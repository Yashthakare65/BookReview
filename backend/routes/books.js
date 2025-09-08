const express = require('express');
const { body, validationResult } = require('express-validator');
const Book = require('../models/Book');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/books
// @desc    Get all books with optional search and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const books = await Book.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-description'); // Exclude description for list view

    const total = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error while fetching books' });
  }
});

// @route   GET /api/books/suggestions
// @desc    Get search suggestions for books (title/author)
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const q = req.query.q || req.query.query || '';
    if (!q) {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const suggestions = await Book.find({
      $or: [ { title: { $regex: regex } }, { author: { $regex: regex } } ]
    })
    .limit(6)
    .select('title author');

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Server error while fetching suggestions' });
  }
});

// @route   GET /api/books/:id
// @desc    Get book details with reviews
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Get reviews with user information
    const reviews = await Review.find({ bookId: req.params.id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({
      book,
      reviews
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error while fetching book' });
  }
});

// @route   POST /api/books
// @desc    Create a new book
// @access  Private (Admin only)
router.post('/', auth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('author').trim().isLength({ min: 1, max: 100 }).withMessage('Author is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
  body('genre').optional().trim().isLength({ max: 50 }).withMessage('Genre must be less than 50 characters'),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Published year must be valid'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL')
], async (req, res) => {
  console.log('POST /api/books hit');
  console.log('Request body preview:', {
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    publishedYear: req.body.publishedYear,
    hasImageUrl: !!req.body.imageUrl
  });
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = errors.array();
      const combined = errs.map(e => e.msg || e.message || `${e.param} invalid`).join('; ');
      return res.status(400).json({
        message: 'Validation failed',
        errors: errs,
        details: combined
      });
    }

    // Only admins can create books
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const { title, author, description, genre, publishedYear, imageUrl } = req.body;

    const book = new Book({
      title,
      author,
      description,
      genre,
      publishedYear
    });

    // If client provided an image URL, use it as the cover
    if (imageUrl) {
      book.coverImage = imageUrl;
      book.imageUrl = imageUrl;
    }

    await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ message: 'Server error while creating book' });
  }
});

// @route   POST /api/books/:id/upload-cover
// @desc    Upload book cover image
// @access  Private
router.post('/:id/upload-cover', auth, upload.single('cover'), async (req, res) => {
  try {
    // Only admins can upload covers
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Log file info for debugging
    console.log('Upload cover: file fieldname=', req.file.fieldname, 'mimetype=', req.file.mimetype, 'size=', req.file.size);

    // Upload to Cloudinary using data URI
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    let result;
    try {
      result = await cloudinary.uploader.upload(dataUri, { folder: 'book-covers' });
    } catch (cloudErr) {
      console.error('Cloudinary upload failed:', cloudErr);
      const detail = cloudErr && cloudErr.message ? cloudErr.message : String(cloudErr);
      return res.status(500).json({ message: 'Cloudinary upload failed', details: detail });
    }

    // Update book with cover image URL
    book.coverImage = result.secure_url;
    await book.save();

    res.json({
      message: 'Cover image uploaded successfully',
      coverImage: result.secure_url
    });

  } catch (error) {
    console.error('Upload cover error:', error);
    const detail = error && error.message ? error.message : String(error);
    res.status(500).json({ message: 'Server error while uploading cover', details: detail });
  }
});

// @route   PUT /api/books/:id
// @desc    Update a book
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('author').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Author must be less than 100 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 2000 }).withMessage('Description must be less than 2000 characters'),
  body('genre').optional().trim().isLength({ max: 50 }).withMessage('Genre must be less than 50 characters'),
  body('publishedYear').optional().isInt({ min: 1000, max: new Date().getFullYear() }).withMessage('Published year must be valid'),
  body('imageUrl').optional().isURL().withMessage('Image URL must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errs = errors.array();
      const combined = errs.map(e => e.msg || e.message || `${e.param} invalid`).join('; ');
      return res.status(400).json({
        message: 'Validation failed',
        errors: errs,
        details: combined
      });
    }

    // Only admins can update books
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        book[key] = updates[key];
      }
    });

    // If imageUrl is updated, also set coverImage
    if (updates.imageUrl) {
      book.coverImage = updates.imageUrl;
    }

    await book.save();

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error while updating book' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete a book
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admins can delete books
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Delete all reviews for this book
    await Review.deleteMany({ bookId: req.params.id });

    // Delete the book
    await Book.findByIdAndDelete(req.params.id);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error while deleting book' });
  }
});

module.exports = router;
