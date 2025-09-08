# Book Review Platform

A full-stack web application where users can register, browse books, and add reviews. Built with Node.js (backend) and React (frontend).

## 🚀 Features

### Backend Features
- **Authentication System**: JWT-based authentication with bcrypt password hashing
- **Database Models**: User, Book, and Review models with MongoDB
- **RESTful API**: Complete CRUD operations for books and reviews
- **Image Upload**: Cloudinary integration for book cover images
- **Search & Filtering**: Full-text search across books
- **Pagination**: Efficient data loading with pagination
- **Validation**: Input validation and error handling

### Frontend Features
- **Responsive Design**: Mobile-first design with TailwindCSS
- **Authentication**: Login/Register with JWT token management
- **Book Browsing**: Search, filter, and paginate through books
- **Book Details**: Detailed book information with reviews
- **Review System**: Rate and review books with star ratings
- **User Dashboard**: Manage personal reviews
- **Real-time Updates**: Dynamic UI updates and notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Express Validator** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **React Icons** - Icon library
- **React Toastify** - Notifications
- **React Rating Stars** - Star rating component

## 📁 Project Structure

```
BookReview/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   └── reviews.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account (optional, for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BookReview
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```bash
   cd backend
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookreview
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both backend (port 5000) and frontend (port 3000) servers.

### Alternative: Run servers separately

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm start
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Books
- `GET /api/books` - Get all books (with search, pagination, sorting)
- `GET /api/books/:id` - Get book details with reviews
- `POST /api/books` - Create new book (protected)
- `PUT /api/books/:id` - Update book (protected)
- `DELETE /api/books/:id` - Delete book (protected)
- `POST /api/books/:id/upload-cover` - Upload book cover (protected)

### Reviews
- `POST /api/reviews` - Add review (protected)
- `GET /api/reviews/:bookId` - Get reviews for a book
- `GET /api/reviews/user/:userId` - Get reviews by user
- `GET /api/reviews/my-reviews` - Get current user's reviews (protected)
- `PUT /api/reviews/:id` - Update review (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)
- `POST /api/reviews/:id/helpful` - Mark review as helpful (protected)

## 🎨 Features Overview

### User Authentication
- Secure registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes and API endpoints

### Book Management
- Browse books with search and filtering
- Book details with cover images
- Pagination for large datasets
- Sort by various criteria (title, author, rating, date)

### Review System
- 5-star rating system
- Text comments for reviews
- Edit and delete own reviews
- Mark reviews as helpful
- Average rating calculation

### User Interface
- Responsive design for all devices
- Modern UI with TailwindCSS
- Loading states and error handling
- Toast notifications for user feedback
- Intuitive navigation and user experience

## 🔧 Configuration

### MongoDB Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Cloudinary Setup (Optional)
1. Create a Cloudinary account
2. Get your cloud name, API key, and API secret
3. Update the Cloudinary variables in your `.env` file

### JWT Secret
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Deployment

### Backend Deployment (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to backend directory: `cd backend`
3. Run: `vercel`
4. Set environment variables in Vercel dashboard

### Frontend Deployment (Vercel)
1. Navigate to frontend directory: `cd frontend`
2. Run: `vercel`
3. Set build command: `npm run build`
4. Set output directory: `build`

### Database
- Use MongoDB Atlas for production database
- Ensure proper security settings and IP whitelisting

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Usage Examples

### Register a new user
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});
```

### Add a book review
```javascript
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    bookId: 'book_id_here',
    rating: 5,
    comment: 'Excellent book!'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Book recommendations based on user preferences
- [ ] Social features (follow users, like reviews)
- [ ] Book clubs and reading groups
- [ ] Advanced search filters (genre, year, rating)
- [ ] Book wishlist functionality
- [ ] Reading progress tracking
- [ ] Mobile app development
- [ ] Admin dashboard for book management
- [ ] Email notifications for new reviews
- [ ] Book series management

---

**Happy Reading! 📚**
