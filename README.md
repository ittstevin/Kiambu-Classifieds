# Kiambu Classifieds

A fully functional online classifieds website replicating Jiji.co.ke's interface and functionality, built with React, Node.js, and MongoDB.

## 🚀 Features

### Core Functionality
- **User Authentication**: Register, login, and profile management
- **Ad Management**: Create, edit, delete, and view advertisements
- **Search & Filter**: Advanced search with location, price, category filters
- **Image Upload**: Multiple image upload with preview
- **Save Ads**: Users can save favorite ads
- **Contact Sellers**: Direct messaging system
- **Responsive Design**: Mobile-first approach

### UI/UX Features
- **Sticky Navigation**: With search bar and location dropdown
- **Hero Section**: Prominent search and category shortcuts
- **Ad Cards**: Clean, informative ad display
- **Image Gallery**: Slider for ad images
- **Filter Sidebar**: Advanced filtering options
- **Pagination**: Smooth browsing experience
- **Modern Design**: Tailwind CSS styling

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **React Image Gallery** - Image sliders

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **bcryptjs** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kiambu-classifieds
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/kiambu-classifieds
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

4. **Create uploads directory**
   ```bash
   mkdir server/uploads
   ```

5. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start them separately:
   # Backend only
   npm run server

   # Frontend only
   cd client && npm start
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Production Build
```bash
# Build the frontend
cd client && npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
kiambu-classifieds/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── index.js       # App entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── uploads/          # Image uploads
│   └── index.js          # Server entry point
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Ads
- `GET /api/ads` - Get all ads with pagination
- `POST /api/ads` - Create new ad
- `GET /api/ads/:id` - Get specific ad
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad
- `GET /api/ads/search` - Search ads
- `GET /api/ads/featured` - Get featured ads
- `POST /api/ads/:id/save` - Save/unsave ad
- `GET /api/ads/saved` - Get saved ads

## 🎨 Key Components

### Frontend Components
- **Navbar**: Sticky navigation with search
- **AdCard**: Individual ad display component
- **CategoryCard**: Category shortcut cards
- **ImageGallery**: Image slider for ads
- **FilterSidebar**: Advanced filtering options
- **SearchBar**: Global search functionality

### Backend Models
- **User**: User authentication and profile
- **Ad**: Advertisement data with relationships

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- File upload restrictions
- CORS configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`

### Backend (Railway/Heroku)
1. Deploy to Railway or Heroku
2. Set environment variables
3. Configure MongoDB connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] Real-time messaging
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Admin dashboard
- [ ] Payment integration
- [ ] Mobile app
- [ ] Social media integration

---

**Built with ❤️ for Kiambu County** 