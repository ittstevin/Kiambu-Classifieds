import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AdsProvider } from './contexts/AdsContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PostAd from './pages/PostAd';
import Category from './pages/Category';
import AdDetail from './pages/AdDetail';
import Profile from './pages/Profile';
import MyAds from './pages/MyAds';
import SavedAds from './pages/SavedAds';
import SearchResults from './pages/SearchResults';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import SellerProfile from './components/Profile/SellerProfile';
import NotFound from './pages/NotFound';
import Chatbot from './components/Chatbot/Chatbot';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdsProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/post-ad" element={<PostAd />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/ad/:id" element={<AdDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-ads" element={<MyAds />} />
                <Route path="/saved-ads" element={<SavedAds />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/seller/:sellerId" element={<SellerProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Chatbot />
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </AdsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App; 