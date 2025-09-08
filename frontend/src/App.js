import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookList from './pages/BookList';
import BookDetails from './pages/BookDetails';
import MyReviews from './pages/MyReviews';
import AdminCreateBook from './pages/AdminCreateBook';
import AdminEditBook from './pages/AdminEditBook';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/books" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/books" /> : <Register />} 
            />
            <Route path="/books" element={<BookList />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route
              path="/my-reviews"
              element={user ? <MyReviews /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/books/new"
              element={user && user.role === 'admin' ? <AdminCreateBook /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin/books/:id/edit"
              element={user && user.role === 'admin' ? <AdminEditBook /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
