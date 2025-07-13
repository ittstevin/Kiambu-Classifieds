import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-400">?</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center space-x-2 w-full"
          >
            <Home size={16} />
            <span>Go Home</span>
          </Link>
          
          <Link
            to="/"
            className="btn-secondary flex items-center justify-center space-x-2 w-full"
          >
            <Search size={16} />
            <span>Browse Ads</span>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Popular Categories
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/category/vehicles"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Vehicles
            </Link>
            <Link
              to="/category/property"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Property
            </Link>
            <Link
              to="/category/electronics"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Electronics
            </Link>
            <Link
              to="/category/fashion"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              Fashion
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-1 mx-auto"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 