import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Heart, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAd } from '../../contexts/AdContext';

const AdCard = ({ ad }) => {
  const { isAuthenticated } = useAuth();
  const { toggleSaveAd, savedAds } = useAd();
  const isSaved = savedAds.includes(ad._id);

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const adDate = new Date(date);
    const diffInHours = Math.floor((now - adDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}m ago`;
  };

  const getConditionBadgeClass = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
        return 'condition-new';
      case 'used':
        return 'condition-used';
      case 'refurbished':
        return 'condition-refurbished';
      default:
        return 'condition-used';
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    await toggleSaveAd(ad._id);
  };

  return (
    <Link to={`/ad/${ad._id}`} className="block">
      <div className="ad-card group">
        {/* Image */}
        <div className="relative">
          <img
            src={ad.images?.[0] || '/placeholder-image.jpg'}
            alt={ad.title}
            className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors duration-200"
          >
            <Heart
              size={16}
              className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>

          {/* Condition Badge */}
          {ad.condition && (
            <span className={`absolute top-2 left-2 condition-badge ${getConditionBadgeClass(ad.condition)}`}>
              {ad.condition}
            </span>
          )}

          {/* Views */}
          <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
            <Eye size={12} />
            <span>{ad.views || 0}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {ad.title}
          </h3>

          {/* Price */}
          <div className="price-tag mb-2">
            {formatPrice(ad.price)}
          </div>

          {/* Location and Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="location-text">
              <MapPin size={14} />
              <span>{ad.location}</span>
            </div>
            <div className="time-text flex items-center">
              <Clock size={12} />
              <span className="ml-1">{formatTimeAgo(ad.createdAt)}</span>
            </div>
          </div>

          {/* Category */}
          {ad.category && (
            <div className="mt-2">
              <span className="category-badge">
                {ad.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AdCard; 