# 🏠 Kiambu Classifieds

A modern, responsive online classifieds platform built with React, Node.js, and MongoDB. Replicating the user interface and core functionality of jiji.co.ke with advanced features for the Kiambu County community.

![Kiambu Classifieds](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.0.0-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0.0-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-blue)

## ✨ Features

### 🎯 Core Features
- **Responsive Design** - Mobile-first design matching Jiji.co.ke layout
- **User Authentication** - JWT-based login/signup with Google OAuth
- **Ad Management** - Post, edit, and manage advertisements with drafts
- **Image Upload** - Multiple image upload with preview and optimization
- **Search & Filters** - Advanced search with real-time suggestions
- **Messaging System** - Real-time chat between buyers and sellers
- **Admin Dashboard** - Comprehensive moderation and analytics panel

### 🚀 Advanced Features

#### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based authentication
- **Google OAuth** - One-click login with Google accounts
- **Password Reset** - Email-based password recovery
- **Protected Routes** - Role-based access control
- **Session Management** - Automatic token refresh

#### 📝 Ad Management
- **Auto-save Drafts** - Automatic saving every 30 seconds
- **Image Preview** - Drag-and-drop image upload with preview
- **SEO Optimization** - Automatic slug generation and meta tags
- **Ad Approval Flow** - Admin moderation before publication
- **Status Management** - Draft, pending, active, sold states

#### 🔍 Smart Search
- **Real-time Suggestions** - Search suggestions as you type
- **Advanced Filters** - Price range, location, condition, category
- **Search History** - Personalized search history
- **Trending Searches** - Popular search terms
- **Smart Sorting** - Relevance, price, date sorting

#### 💬 Messaging & Communication
- **Real-time Chat** - Socket.IO powered instant messaging
- **WhatsApp Integration** - Direct WhatsApp contact buttons
- **Message Notifications** - Real-time message alerts
- **Conversation Management** - Organized chat threads

#### 👤 User Profiles
- **Seller Profiles** - Detailed seller information with badges
- **Rating System** - User reviews and ratings
- **Trust Badges** - Verified, trusted, active seller badges
- **Response Metrics** - Response rate and time tracking

#### 🎨 UI/UX Enhancements
- **Dark Mode** - Complete dark theme with smooth transitions
- **Responsive Design** - Perfect mobile experience like Jiji.co.ke
- **Toast Notifications** - Beautiful success/error notifications
- **Loading States** - Skeleton loaders and progress indicators
- **Smooth Animations** - CSS transitions and micro-interactions

#### 🛠️ Admin Features
- **Dashboard Analytics** - Sales metrics, user statistics
- **Ad Moderation** - Approve/reject ads with comments
- **User Management** - View and manage user accounts
- **Category Management** - Add/edit categories and subcategories
- **System Monitoring** - Performance and error tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **Socket.IO** - Real-time bidirectional communication
- **Bcrypt** - Password hashing
- **Cors** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Kiambu-Classifieds.git
   cd Kiambu-Classifieds
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in root directory
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kiambu-classifieds
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the application**
   ```bash
   # Start backend server
   npm run server
   
   # Start frontend (in new terminal)
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 Features in Detail

### 🔐 Authentication System
- **JWT Tokens**: Secure authentication with automatic refresh
- **Google OAuth**: One-click login integration
- **Password Reset**: Email-based recovery system
- **Session Persistence**: Remember user login state

### 📝 Advanced Ad Form
- **Auto-save**: Automatic draft saving every 30 seconds
- **Image Upload**: Drag-and-drop with preview
- **Form Validation**: Real-time validation with error messages
- **SEO Fields**: Automatic slug generation and meta descriptions
- **Condition Selection**: New, used, refurbished options
- **Location Picker**: Kiambu County specific locations

### 🔍 Smart Search System
- **Real-time Suggestions**: Search suggestions as you type
- **Advanced Filters**: Multiple filter combinations
- **Search History**: Personalized search tracking
- **Trending Searches**: Popular search terms
- **Smart Sorting**: Multiple sort options

### 💬 Real-time Messaging
- **Socket.IO Integration**: Instant message delivery
- **Chat Interface**: Modern chat UI with emojis
- **Message Status**: Read/unread indicators
- **File Sharing**: Image sharing in chat
- **Conversation Management**: Organized chat threads

### 👤 Enhanced User Profiles
- **Seller Badges**: Verified, trusted, active seller indicators
- **Rating System**: 5-star rating with reviews
- **Response Metrics**: Response rate and time tracking
- **Profile Analytics**: Ad performance statistics
- **Contact Options**: Phone, email, WhatsApp integration

### 🎨 Dark Mode
- **Theme Toggle**: Smooth light/dark mode switching
- **Persistent Preference**: Remembers user theme choice
- **System Preference**: Respects OS theme setting
- **Smooth Transitions**: Beautiful theme switching animations

### 📊 Admin Dashboard
- **Analytics Overview**: Sales, users, ads statistics
- **Ad Moderation**: Approve/reject ads with comments
- **User Management**: View and manage user accounts
- **Category Management**: Add/edit categories
- **System Monitoring**: Performance and error tracking

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Ads
- `GET /api/ads` - Get all ads with filters
- `POST /api/ads` - Create new ad
- `GET /api/ads/:id` - Get specific ad
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad
- `GET /api/ads/suggestions` - Search suggestions
- `GET /api/ads/trending-searches` - Trending searches

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/reviews` - Get user reviews
- `POST /api/users/:id/reviews` - Add user review

### Messages
- `GET /api/messages` - Get user messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark as read

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/ads` - Get ads for moderation
- `PUT /api/admin/ads/:id/approve` - Approve ad
- `PUT /api/admin/ads/:id/reject` - Reject ad

## 🎨 UI Components

### Core Components
- **Navbar**: Responsive navigation with dark mode
- **Footer**: Site footer with links
- **AdCard**: Advertisement display component
- **AdForm**: Advanced ad creation form
- **SearchBar**: Smart search with filters
- **ChatModal**: Real-time messaging interface

### Auth Components
- **LoginForm**: User login form
- **RegisterForm**: User registration form
- **GoogleLogin**: Google OAuth button
- **PasswordReset**: Password recovery form
- **AuthGuard**: Protected route wrapper

### UI Components
- **DarkModeToggle**: Theme switching component
- **LoadingSpinner**: Loading indicators
- **Toast**: Notification system
- **Modal**: Reusable modal component
- **ImageUpload**: File upload with preview

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend (Railway/Render)
```bash
# Set environment variables
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Deploy to Railway
railway up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Jiji.co.ke](https://jiji.co.ke)
- Built with modern web technologies
- Designed for the Kiambu County community

## 📞 Support

For support, email support@kiambuclassifieds.com or create an issue in this repository.

---

**Made with ❤️ for Kiambu County** 