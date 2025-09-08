const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/reviews
// @desc    Add a review
// @access  Private
router.post('/', auth, [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment is required and must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { bookId, rating, comment } = req.body;
    const userId = req.user._id;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = await Review.findOne({ bookId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this book' });
    }

    // Create new review
    const review = new Review({
      bookId,
      userId,
      rating,
      comment
    });

    await review.save();

    // Update book stats (averageRating and totalReviews)
    const bookObj = await Book.findById(bookId);
    if (bookObj) {
      const prevTotal = bookObj.totalReviews || 0;
      const prevAvg = bookObj.averageRating || 0;
      const newTotal = prevTotal + 1;
      const newAvg = ((prevAvg * prevTotal) + rating) / newTotal;
      bookObj.totalReviews = newTotal;
      bookObj.averageRating = parseFloat(newAvg.toFixed(2));
      await bookObj.save();
    }

    // Populate user information for response
    await review.populate('userId', 'name avatar');

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error while adding review' });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ userId: req.user._id })
      .populate('bookId', 'title author coverImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ userId: req.user._id });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching your reviews' });
  }
});

// @route   GET /api/reviews/:bookId
// @desc    Get reviews for a specific book
// @access  Public
router.get('/:bookId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const reviews = await Review.find({ bookId: req.params.bookId })
      .populate('userId', 'name avatar')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ bookId: req.params.bookId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

// @route   GET /api/reviews/user/:userId
// @desc    Get reviews by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ userId: req.params.userId })
      .populate('bookId', 'title author coverImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ userId: req.params.userId });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching user reviews' });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ userId: req.user._id })
      .populate('bookId', 'title author coverImage')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ userId: req.user._id });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ message: 'Server error while fetching your reviews' });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        review[key] = updates[key];
      }
    });

    const oldRating = review.rating;

    // Apply updates
    const newRating = updates.rating !== undefined ? updates.rating : oldRating;
    await review.save();
    await review.populate('userId', 'name avatar');

    // Update book stats if rating changed
    if (newRating !== oldRating) {
      const bookObj = await Book.findById(review.bookId);
      if (bookObj) {
        const total = bookObj.totalReviews || 0;
        if (total > 0) {
          const newAvg = ((bookObj.averageRating * total) - oldRating + newRating) / total;
          bookObj.averageRating = parseFloat(newAvg.toFixed(2));
          await bookObj.save();
        }
      }
    }

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Adjust book stats
    const bookObj = await Book.findById(review.bookId);
    if (bookObj) {
      const total = bookObj.totalReviews || 0;
      if (total > 1) {
        const newTotal = total - 1;
        const newAvg = ((bookObj.averageRating * total) - review.rating) / newTotal;
        bookObj.totalReviews = newTotal;
        bookObj.averageRating = parseFloat(newAvg.toFixed(2));
        await bookObj.save();
      } else {
        // No more reviews
        bookObj.totalReviews = 0;
        bookObj.averageRating = 0;
        await bookObj.save();
      }
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
});

// @route   POST /api/reviews/:id/helpful
// @desc    Mark a review as helpful
// @access  Private
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    console.log('Mark helpful request by user:', req.user?._id?.toString(), 'reviewId:', req.params.id);

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure helpful is a number
    if (typeof review.helpful !== 'number') review.helpful = 0;

    // Increment helpful count
    review.helpful = review.helpful + 1;
    await review.save();

    res.json({
      message: 'Review marked as helpful',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Mark helpful error:', error.stack || error);
    const detail = error && error.message ? error.message : String(error);
    res.status(500).json({ message: 'Server error while marking review as helpful', details: detail });
  }
});

module.exports = router;
