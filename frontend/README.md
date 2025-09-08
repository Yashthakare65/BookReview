# Book Review Platform - Frontend

React frontend for the Book Review Platform.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Open browser**
   ```
   http://localhost:3000
   ```

## 🎨 Features

### Pages
- **Home** - Landing page with features and call-to-action
- **Login** - User authentication
- **Register** - User registration
- **Book List** - Browse and search books
- **Book Details** - View book information and reviews
- **My Reviews** - Manage personal reviews

### Components
- **Navbar** - Navigation with authentication state
- **StarRating** - Interactive star rating component
- **LoadingSpinner** - Loading states
- **AuthContext** - Authentication context provider

## 🛠️ Tech Stack

- **React 18** - UI library
- **React Router 6** - Client-side routing
- **TailwindCSS** - Styling framework
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Notifications

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.js
│   ├── StarRating.js
│   └── LoadingSpinner.js
├── pages/
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── BookList.js
│   ├── BookDetails.js
│   └── MyReviews.js
├── contexts/
│   └── AuthContext.js
├── App.js
├── index.js
└── index.css
```

## 🎨 Styling

The project uses TailwindCSS for styling with custom components:

### Custom CSS Classes
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-outline` - Outline button style
- `.input-field` - Form input style
- `.card` - Card container style
- `.card-hover` - Card with hover effects

### Color Scheme
- **Primary**: Blue shades (#3b82f6)
- **Secondary**: Gray shades (#64748b)
- **Accent**: Yellow (#fbbf24)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
# Set this to your backend root URL (no trailing slash), for example:
# Development: http://localhost:5000
# After deploying backend to Vercel: https://your-backend.vercel.app
REACT_APP_API_URL=http://localhost:5000
```

Note: The app will call API endpoints under the /api path (e.g. $REACT_APP_API_URL/api/books). Ensure REACT_APP_API_URL does NOT end with a trailing slash to avoid duplicated slashes in requests.

### Proxy Configuration
The development server is configured to proxy API requests to the backend:

```json
{
  "proxy": "http://localhost:5000"
}
```

## 🚀 Build and Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set build command: `npm run build`
4. Set output directory: `build`

## 🧪 Testing

```bash
npm test
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 Key Features

### Authentication
- JWT token management
- Automatic token refresh
- Protected routes
- User context throughout app

### Book Browsing
- Search functionality
- Filtering and sorting
- Pagination
- Responsive grid layout

### Review System
- 5-star rating system
- Text comments
- Edit/delete own reviews
- Helpful votes

### User Experience
- Loading states
- Error handling
- Toast notifications
- Smooth transitions
- Intuitive navigation

## 🔧 Customization

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.js`
3. Add navigation link in `src/components/Navbar.js`

### Styling Components
- Use TailwindCSS classes
- Create custom components in `src/index.css`
- Follow the established design system

### API Integration
- Use the `AuthContext` for authenticated requests
- Handle loading and error states
- Show appropriate user feedback

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check if backend is running
   - Verify proxy configuration
   - Check network requests in browser dev tools

2. **Authentication Issues**
   - Clear localStorage
   - Check JWT token validity
   - Verify backend authentication endpoints

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies are installed

## 📈 Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- Memoization for expensive components
- Efficient state management
- Lazy loading for large lists

## 🔒 Security Considerations

- JWT token storage in localStorage
- Input validation and sanitization
- XSS prevention
- Secure API communication
- Error message sanitization
