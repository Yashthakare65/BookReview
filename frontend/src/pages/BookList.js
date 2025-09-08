import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSearch, FiBook } from 'react-icons/fi';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const baseURL = process.env.REACT_APP_API_URL || '';

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const suggestionsRef = React.useRef(null);
  const debounceRef = React.useRef(null);

  const fetchSuggestions = async (query) => {
    try {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      const res = await axios.get(`${baseURL}/api/books/suggestions`, { params: { q: query } });
      setSuggestions(res.data.suggestions || []);
      setShowSuggestions(true);
      setHighlightIndex(-1);
    } catch (err) {
      console.error('Suggestions fetch error:', err?.response?.data || err.message || err);
    }
  };

  // Debounced suggestions when typing
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 250);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const handleSuggestionSelect = (suggestion) => {
    const value = suggestion.title || `${suggestion.title} ${suggestion.author || ''}`;
    setSearchTerm(value);
    setShowSuggestions(false);
    fetchBooks(1, value, sortBy, sortOrder);
  };

  const handleInputKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const fetchBooks = async (page = 1, search = '', sort = sortBy, order = sortOrder) => {
    try {
      setLoading(true);
      const url = `${baseURL}/api/books`;
      const response = await axios.get(url, {
        params: {
          search,
          page,
          sort,
          order,
          limit: 12,
        },
      });

      const data = response.data;
      setBooks(data.books || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching books:', error?.response?.data || error.message || error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch books when dependencies change
    fetchBooks(currentPage, searchTerm, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks(1, searchTerm, sortBy, sortOrder);
  };

  const handleSortChange = (e) => {
    const [newSort, newOrder] = e.target.value.split('-');
    setSortBy(newSort);
    setSortOrder(newOrder);
    setCurrentPage(1);
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

  if (loading && books.length === 0) {
    return <LoadingSpinner text="Loading books..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Books</h1>
        <p className="text-gray-600">Discover amazing books and read reviews from our community</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <div ref={suggestionsRef} className="relative">
                <input
                  type="text"
                  placeholder="Search books by title, author, or description..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
                  className="input-field pl-10 w-full"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((s, idx) => (
                      <li
                        key={s._id}
                        onMouseDown={(ev) => ev.preventDefault()}
                        onClick={() => handleSuggestionSelect(s)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center ${highlightIndex === idx ? 'bg-gray-100' : ''}`}
                      >
                        <div>
                          <div className="font-medium text-sm">{s.title}</div>
                          {s.author && <div className="text-xs text-gray-500">{s.author}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </form>

          <div className="flex gap-4">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="input-field min-w-[200px]"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="author-asc">Author A-Z</option>
              <option value="author-desc">Author Z-A</option>
              <option value="averageRating-desc">Highest Rated</option>
              <option value="averageRating-asc">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-600">Showing {books.length} of {total} books</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">{searchTerm ? 'Try adjusting your search terms' : 'No books available at the moment'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <Link to={`/books/${book._id}`} className="block">
                <div className="h-64 bg-gray-100 flex items-center justify-center">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="object-contain h-full w-full" />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{book.title}</h3>
                <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                <div className="flex items-center justify-between">
                  <StarRating value={book.averageRating || 0} />
                  <p className="text-sm text-gray-500">{book.reviewsCount || 0} reviews</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">Added on {new Date(book.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">{renderPagination()}</div>
    </div>
  );
};

export default BookList;
