# Book Review Platform - Backend

Node.js backend API for the Book Review Platform.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Book Endpoints

#### Get All Books
```http
GET /api/books?search=harry&page=1&limit=10&sort=title&order=asc
```

#### Get Book Details
```http
GET /api/books/:id
```

#### Create Book
```http
POST /api/books
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "description": "Book description",
  "genre": "Fiction",
  "publishedYear": 2023,
  "isbn": "9781234567890"
}
```

### Review Endpoints

#### Add Review
```http
POST /api/reviews
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookId": "book_id_here",
  "rating": 5,
  "comment": "Great book!"
}
```

#### Get Book Reviews
```http
GET /api/reviews/:bookId?page=1&limit=10
```

#### Get My Reviews
```http
GET /api/reviews/my-reviews?page=1&limit=10
Authorization: Bearer <jwt_token>
```

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookreview
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Book Model
```javascript
{
  title: String,
  author: String,
  description: String,
  coverImage: String,
  genre: String,
  publishedYear: Number,
  isbn: String (unique),
  averageRating: Number,
  totalReviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  bookId: ObjectId (ref: Book),
  userId: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  helpful: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Environment Variables for Production
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string
- `CLOUDINARY_*`: Your Cloudinary credentials (optional)

## 🧪 Testing

```bash
npm test
```

## 📝 Error Handling

All endpoints return consistent error responses:

```javascript
{
  "message": "Error description",
  "errors": [] // Validation errors (if any)
}
```

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- CORS configuration
- Rate limiting (can be added)
- SQL injection prevention (MongoDB)

## 📊 Performance Features

- Pagination for large datasets
- Database indexing
- Image optimization with Cloudinary
- Efficient queries with population
