import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdProvider } from './contexts/AdContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import AdDetail from './pages/AdDetail';
import PostAd from './pages/PostAd';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import MyAds from './pages/MyAds';
import SavedAds from './pages/SavedAds';
import SearchResults from './pages/SearchResults';
import AdminDashboard from './pages/AdminDashboard';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <AdProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categorySlug" element={<Category />} />
            <Route path="/ad/:adId" element={<AdDetail />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-ads" element={<MyAds />} />
            <Route path="/saved-ads" element={<SavedAds />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AdProvider>
    </AuthProvider>
  );
}

export default App; 