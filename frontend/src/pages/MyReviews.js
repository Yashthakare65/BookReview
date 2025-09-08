import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiBook, 
  FiTrash2, 
  FiMessageSquare,
  FiCalendar,
  FiThumbsUp
} from 'react-icons/fi';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMyReviews = async (page = currentPage) => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reviews/my-reviews', {
        params: {
          page,
          limit: 10
        }
      });
      setReviews(response.data.reviews || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching my reviews:', error?.response?.data || error.message || error);
      toast.error('Failed to fetch your reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
  await axios.delete(`/api/reviews/${reviewId}`);
      toast.success('Review deleted successfully');
      fetchMyReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
            i === currentPage
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return <LoadingSpinner text="Loading your reviews..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">Manage and view all your book reviews</p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{total}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {reviews.length > 0 ? 
                (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 
                '0.0'
              }
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {reviews.reduce((sum, review) => sum + review.helpful, 0)}
            </div>
            <div className="text-sm text-gray-600">Helpful Votes</div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <FiMessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">Start reviewing books to see them here</p>
          <Link to="/books" className="btn-primary">
            Browse Books
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Book Info */}
                  <div className="flex-shrink-0">
                    {review.bookId && review.bookId._id ? (
                      <Link to={`/books/${review.bookId._id}`} className="block">
                        {review.bookId.coverImage ? (
                          <img
                            src={review.bookId.coverImage}
                            alt={review.bookId.title}
                            className="w-32 h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <FiBook className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </Link>
                    ) : (
                      <div className="w-32 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <FiBook className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {review.bookId && review.bookId._id ? (
                          <>
                            <Link 
                              to={`/books/${review.bookId._id}`}
                              className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                            >
                              {review.bookId.title}
                            </Link>
                            <p className="text-gray-600">by {review.bookId.author}</p>
                          </>
                        ) : (
                          <span className="text-xl font-semibold text-gray-900">Book not found</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                          title="Delete review"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <StarRating rating={review.rating} size="medium" />
                      <span className="text-sm text-gray-500 flex items-center">
                        <FiCalendar className="h-4 w-4 mr-1" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <FiThumbsUp className="h-4 w-4 mr-1" />
                          {review.helpful} helpful
                        </span>
                      </div>
                      
                      {review.bookId && review.bookId._id && (
                        <Link
                          to={`/books/${review.bookId._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                        >
                          View Book →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyReviews;
