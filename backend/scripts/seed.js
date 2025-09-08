require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookreview';

async function dropCollectionIfExists(db, name) {
  const collections = await db.listCollections().toArray();
  if (collections.find(c => c.name === name)) {
    await db.dropCollection(name);
    console.log(`Dropped collection: ${name}`);
  }
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    const db = mongoose.connection.db;

    // Drop existing collections that we manage
    await dropCollectionIfExists(db, 'users');
    await dropCollectionIfExists(db, 'books');
    await dropCollectionIfExists(db, 'reviews');

    // Create admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const admin = new User({ name: 'Admin', email: adminEmail.toLowerCase(), password: adminPassword, role: 'admin' });
    await admin.save();
    console.log(`Created admin: ${adminEmail}`);

    // Create sample books
    const booksData = [
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        description: 'A novel about the serious issues of rape and racial inequality.',
        coverImage: 'https://pictures.abebooks.com/inventory/22883965402.jpg',
      },
      {
        title: '1984',
        author: 'George Orwell',
        description: 'A dystopian novel set in a totalitarian society ruled by Big Brother.',
        coverImage: 'https://m.media-amazon.com/images/I/61NAx5pd6XL.jpg',
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        description: 'Bilbo Baggins embarks on an unexpected journey.',
        coverImage: 'https://tse1.mm.bing.net/th/id/OIP.gSLel5r9Pf_E25NtSlvetwHaJ4?rs=1&pid=ImgDetMain',
      }
    ];

    const createdBooks = [];
    for (const b of booksData) {
      const book = new Book({
        title: b.title,
        author: b.author,
        description: b.description,
        coverImage: b.coverImage,
        totalReviews: 0,
        averageRating: 0
      });
      await book.save();
      createdBooks.push(book);
    }
    console.log(`Created ${createdBooks.length} sample books`);

    // Create one sample review by admin for first book
    const firstBook = createdBooks[0];
    if (firstBook) {
      const review = new Review({ bookId: firstBook._id, userId: admin._id, rating: 5, comment: 'An excellent and moving novel.' });
      await review.save();

      // Update book stats
      firstBook.totalReviews = 1;
      firstBook.averageRating = 5;
      await firstBook.save();

      console.log('Created a sample review for first book');
    }

    console.log('Seeding completed successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();
