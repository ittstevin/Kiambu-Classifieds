import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, MapPin, TrendingUp, Clock, Heart } from 'lucide-react';
import axios from 'axios';
import AdCard from '../components/Ads/AdCard';
import CategoryCard from '../components/Categories/CategoryCard';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Kiambu County');

  const locations = [
    'Kiambu County',
    'Thika',
    'Juja',
    'Ruiru',
    'Gatundu',
    'Lari',
    'Limuru',
    'Kikuyu',
    'Kabete',
    'Kiambaa'
  ];

  const categories = [
    {
      id: 'vehicles',
      name: 'Vehicles',
      icon: '🚗',
      description: 'Cars, Motorcycles, Commercial',
      count: '2,450'
    },
    {
      id: 'property',
      name: 'Property',
      icon: '🏠',
      description: 'Houses, Apartments, Land',
      count: '1,890'
    },
    {
      id: 'electronics',
      name: 'Electronics',
      icon: '📱',
      description: 'Phones, Laptops, TVs',
      count: '3,200'
    },
    {
      id: 'fashion',
      name: 'Fashion',
      icon: '👕',
      description: 'Clothing, Shoes, Accessories',
      count: '4,100'
    },
    {
      id: 'services',
      name: 'Services',
      icon: '🔧',
      description: 'Professional Services',
      count: '1,500'
    },
    {
      id: 'jobs',
      name: 'Jobs',
      icon: '💼',
      description: 'Employment Opportunities',
      count: '800'
    }
  ];

  // Fetch featured ads
  const { data: featuredAds, isLoading: adsLoading } = useQuery(
    'featuredAds',
    async () => {
      const response = await axios.get('/api/ads/featured');
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
              Buy and Sell in Kiambu County
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              The trusted marketplace for Kiambu residents
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="bg-white rounded-full shadow-2xl flex items-center p-2">
                <div className="flex-1 px-4">
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 bg-transparent text-gray-900 placeholder-gray-500 outline-none text-lg"
                  />
                </div>
                <div className="flex items-center space-x-2 px-4">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-accent-500 hover:bg-accent-600 text-white px-6 py-3 rounded-full font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Search size={20} />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold">50,000+</div>
              <div className="text-blue-100">Active Ads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">25,000+</div>
              <div className="text-blue-100">Happy Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-blue-100">Free to Post</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find exactly what you're looking for in our comprehensive categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ads Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Ads
              </h2>
              <p className="text-gray-600">
                Handpicked ads from our community
              </p>
            </div>
            <Link
              to="/search"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>

          {adsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="ad-card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAds?.slice(0, 8).map((ad) => (
                <AdCard key={ad._id} ad={ad} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Your Ad
              </h3>
              <p className="text-gray-600">
                Sign up and post your item with photos and details
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Connect with Buyers
              </h3>
              <p className="text-gray-600">
                Receive messages and negotiate with potential buyers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Complete the Sale
              </h3>
              <p className="text-gray-600">
                Meet safely and complete your transaction
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 