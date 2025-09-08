const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// Middleware
// Configure CORS origins from env (comma separated) or fallback to common dev URLs
const frontendOrigins = (process.env.FRONTEND_URL || process.env.FRONTEND_URLS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// If no FRONTEND_URL(S) provided and not in production, allow all origins for developer convenience
let allowedOrigins;
if (frontendOrigins.length) {
  allowedOrigins = frontendOrigins;
} else if (process.env.NODE_ENV === 'production') {
  allowedOrigins = []; // require explicit config in production
} else {
  allowedOrigins = ['*']; // allow all in development when not set
}
console.log('Allowed CORS origins:', allowedOrigins);

app.set('trust proxy', true); // Trust proxy headers when deployed behind Vercel/Proxies
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Deny without throwing to avoid uncaught exceptions; browser will block the request.
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/reviews', require('./routes/reviews'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Book Review API is running!' });
});

// Root route for Vercel
app.get('/', (req, res) => {
  res.send('Book Review API is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bookreview', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    // Create initial admin user if ADMIN_EMAIL and ADMIN_PASSWORD are provided and admin doesn't exist
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (adminEmail && adminPassword) {
        const User = require('./models/User');
        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
        if (!existingAdmin) {
          const admin = new User({ name: 'Admin', email: adminEmail.toLowerCase(), password: adminPassword, role: 'admin' });
          await admin.save();
          console.log(`Created initial admin user: ${adminEmail}`);
        }
      }
    } catch (err) {
      console.error('Error creating initial admin user:', err);
    }
  });
});

module.exports = app;
