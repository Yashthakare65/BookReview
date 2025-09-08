import { useState, useEffect,useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiBook, 
  FiUser, 
  FiCalendar, 
  FiMessageSquare, 
  FiThumbsUp,
  FiEdit3,
  FiTrash2,
  FiArrowLeft
} from 'react-icons/fi';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [editingReview, setEditingReview] = useState(null);

   useEffect(() => {
    fetchBookDetails();
  }, [id]);

    const fetchBookDetails = useCallback(async () => {
  try {
    setLoading(true);
    const response = await axios.get(`/api/books/${id}`);
    setBook(response.data.book);
    setReviews(response.data.reviews);
  } catch (error) {
    console.error('Error fetching book details:', error);
    toast.error('Failed to fetch book details');
    navigate('/books');
  } finally {
    setLoading(false);
  }
}, [id, navigate, toast]);

useEffect(() => {
  fetchBookDetails();
}, [fetchBookDetails]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to add a review');
      return;
    }

    if (reviewForm.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      setReviewLoading(true);
      
      if (editingReview) {
        // Update existing review
  await axios.put(`/api/reviews/${editingReview._id}`, reviewForm);
        toast.success('Review updated successfully');
        setEditingReview(null);
      } else {
        // Create new review
        await axios.post('/api/reviews', {
          bookId: id,
          ...reviewForm
        });
        toast.success('Review added successfully');
      }
      
      // Reset form
      setReviewForm({ rating: 0, comment: '' });
      setShowReviewForm(false);
      
      // Refresh reviews
      fetchBookDetails();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      comment: review.comment
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
  await axios.delete(`/api/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchBookDetails();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const [helpfulLoading, setHelpfulLoading] = useState({});

  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      toast.info('Please login to mark a review as helpful');
      navigate('/login');
      return;
    }

    // Prevent double clicks
    if (helpfulLoading[reviewId]) return;

    // Optimistic update
    setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r));
    setHelpfulLoading(prev => ({ ...prev, [reviewId]: true }));

    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/reviews/${reviewId}/helpful`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      // Refresh reviews to ensure consistency
      fetchBookDetails();
    } catch (error) {
      console.error('Error marking review as helpful:', error, error?.response?.data);
      // revert optimistic update
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, helpful: Math.max((r.helpful || 1) - 1, 0) } : r));

      const status = error?.response?.status;
      if (status === 401) {
        toast.error('Session expired - please login again');
        try { logout && logout(); } catch (e) { localStorage.removeItem('token'); }
        navigate('/login');
        return;
      }

      const msg = error?.response?.data?.message || error?.response?.data?.details || 'Failed to mark review as helpful';
      toast.error(msg);
    } finally {
      setHelpfulLoading(prev => { const copy = { ...prev }; delete copy[reviewId]; return copy; });
    }
  };

  const cancelReview = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    setReviewForm({ rating: 0, comment: '' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading book details..." />;
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Book not found</h2>
        <button
          onClick={() => navigate('/books')}
          className="btn-primary"
        >
          Back to Books
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/books')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
      >
        <FiArrowLeft className="h-4 w-4 mr-2" />
        Back to Books
      </button>

      {/* Book Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-64 h-80 object-cover rounded-lg mx-auto lg:mx-0"
              />
            ) : (
              <div className="w-64 h-80 bg-gray-200 rounded-lg flex items-center justify-center mx-auto lg:mx-0">
                <FiBook className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            
            <div className="flex items-center text-lg text-gray-600 mb-4">
              <FiUser className="h-5 w-5 mr-2" />
              <span>{book.author}</span>
            </div>

            {book.publishedYear && (
              <div className="flex items-center text-gray-600 mb-4">
                <FiCalendar className="h-5 w-5 mr-2" />
                <span>Published in {book.publishedYear}</span>
              </div>
            )}

            {book.genre && (
              <div className="mb-4">
                <span className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full">
                  {book.genre}
                </span>
              </div>
            )}

            <div className="flex items-center mb-6 justify-between">
              <div className="flex items-center">
                <StarRating
                  rating={book.averageRating}
                  size="large"
                  showValue={true}
                />
                <span className="ml-4 text-gray-600">
                  ({book.totalReviews} review{book.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>

              {user && user.role === 'admin' && (
                <div className="flex items-center space-x-2">
                  <button onClick={() => navigate(`/admin/books/${book._id}/edit`)} className="text-gray-400 hover:text-primary-600 transition-colors duration-200">
                    <FiEdit3 className="h-5 w-5" />
                  </button>
                  <button onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete this book?')) return;
                    try {
                      await axios.delete(`/api/books/${book._id}`);
                      toast.success('Book deleted');
                      navigate('/books');
                    } catch (err) {
                      console.error('Delete book failed:', err);
                      toast.error(err?.response?.data?.message || 'Failed to delete book');
                    }
                  }} className="text-gray-400 hover:text-red-600 transition-colors duration-200">
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiMessageSquare className="h-6 w-6 mr-2" />
            Reviews ({reviews.length})
          </h2>
          
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingReview ? 'Edit Review' : 'Write a Review'}
            </h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <StarRating
                  rating={reviewForm.rating}
                  onRatingChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                  interactive={true}
                  size="large"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment *
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={4}
                  className="input-field"
                  placeholder="Share your thoughts about this book..."
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="btn-primary"
                >
                  {reviewLoading ? (
                    <div className="spinner h-4 w-4"></div>
                  ) : (
                    editingReview ? 'Update Review' : 'Submit Review'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelReview}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <FiMessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              {user ? 'Be the first to review this book!' : 'Login to write the first review'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.userId.name}</h4>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} size="small" />
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user && user.id === review.userId._id && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                      >
                        <FiEdit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-3">{review.comment}</p>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    disabled={!!helpfulLoading[review._id]}
                    className={`flex items-center space-x-1 transition-colors duration-200 ${helpfulLoading[review._id] ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-primary-600'}`}
                  >
                    <FiThumbsUp className="h-4 w-4" />
                    <span>
                      {helpfulLoading[review._id] ? (
                        <span className="flex items-center space-x-2"><span>Processing</span></span>
                      ) : (
                        `Helpful (${review.helpful})`
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
