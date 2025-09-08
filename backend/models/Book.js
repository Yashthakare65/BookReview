const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  coverImage: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [50, 'Genre cannot be more than 50 characters']
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

// Virtual for average rating calculation
bookSchema.virtual('rating').get(function() {
  if (typeof this.averageRating === 'number') {
    return this.averageRating.toFixed(1);
  }
  return '0.0';
});

// Ensure virtual fields are serialized
bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
