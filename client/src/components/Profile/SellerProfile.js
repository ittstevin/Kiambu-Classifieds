import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Star, 
  Shield, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Award,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Eye,
  ThumbsUp
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const SellerProfile = () => {
  const { sellerId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch seller data
  const { data: seller, isLoading: sellerLoading } = useQuery(
    ['seller', sellerId],
    async () => {
      const response = await axios.get(`/api/users/${sellerId}`);
      return response.data;
    },
    {
      enabled: !!sellerId,
    }
  );

  // Fetch seller's ads
  const { data: sellerAds = [], isLoading: adsLoading } = useQuery(
    ['seller-ads', sellerId],
    async () => {
      const response = await axios.get(`/api/ads?seller=${sellerId}&status=active`);
      return response.data;
    },
    {
      enabled: !!sellerId,
    }
  );

  // Fetch seller's reviews
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery(
    ['seller-reviews', sellerId],
    async () => {
      const response = await axios.get(`/api/users/${sellerId}/reviews`);
      return response.data;
    },
    {
      enabled: !!sellerId,
    }
  );

  const getBadgeType = (seller) => {
    if (!seller) return 'new';
    
    const memberSince = new Date(seller.createdAt);
    const monthsActive = (new Date() - memberSince) / (1000 * 60 * 60 * 24 * 30);
    const totalAds = seller.totalAds || 0;
    const rating = seller.averageRating || 0;
    
    if (monthsActive >= 12 && totalAds >= 50 && rating >= 4.5) return 'verified';
    if (monthsActive >= 6 && totalAds >= 20 && rating >= 4.0) return 'trusted';
    if (monthsActive >= 3 && totalAds >= 10) return 'active';
    return 'new';
  };

  const getBadgeInfo = (type) => {
    const badges = {
      verified: {
        icon: <Shield className="w-4 h-4" />,
        label: 'Verified Seller',
        color: 'bg-green-100 text-green-800',
        description: 'Trusted seller with excellent track record'
      },
      trusted: {
        icon: <Award className="w-4 h-4" />,
        label: 'Trusted Seller',
        color: 'bg-blue-100 text-blue-800',
        description: 'Reliable seller with good feedback'
      },
      active: {
        icon: <TrendingUp className="w-4 h-4" />,
        label: 'Active Seller',
        color: 'bg-orange-100 text-orange-800',
        description: 'Regular seller with positive reviews'
      },
      new: {
        icon: <Clock className="w-4 h-4" />,
        label: 'New Seller',
        color: 'bg-gray-100 text-gray-800',
        description: 'New to the platform'
      }
    };
    return badges[type] || badges.new;
  };

  const calculateRatingStats = (reviews) => {
    if (!reviews.length) return { average: 0, total: 0, distribution: {} };
    
    const total = reviews.length;
    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / total;
    
    const distribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {});
    
    return { average, total, distribution };
  };

  const handleContact = (type) => {
    if (!seller) return;
    
    switch (type) {
      case 'phone':
        if (seller.phone) {
          window.open(`tel:${seller.phone}`);
        } else {
          toast.error('Phone number not available');
        }
        break;
      case 'email':
        if (seller.email) {
          window.open(`mailto:${seller.email}`);
        } else {
          toast.error('Email not available');
        }
        break;
      case 'message':
        // Navigate to messaging
        window.location.href = `/messages?seller=${sellerId}`;
        break;
    }
  };

  if (sellerLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Seller not found</h3>
          <p className="mt-1 text-sm text-gray-500">The seller you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const badgeInfo = getBadgeInfo(getBadgeType(seller));
  const ratingStats = calculateRatingStats(reviews);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {seller.name?.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${badgeInfo.color}`}>
                {badgeInfo.icon}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeInfo.color}`}>
                  {badgeInfo.icon}
                  <span className="ml-1">{badgeInfo.label}</span>
                </span>
              </div>
              <p className="text-gray-600 mt-1">{badgeInfo.description}</p>
              
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{ratingStats.average.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({ratingStats.total} reviews)</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{seller.location || 'Location not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Member since {new Date(seller.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {seller.phone && (
              <button
                onClick={() => handleContact('phone')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
            )}
            
            {seller.email && (
              <button
                onClick={() => handleContact('email')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            )}
            
            <button
              onClick={() => handleContact('message')}
              className="btn-accent flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'ads', label: `Ads (${sellerAds.length})` },
              { id: 'reviews', label: `Reviews (${reviews.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Total Ads</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{seller.totalAds || 0}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Response Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {seller.responseRate || 95}%
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Avg Response Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {seller.avgResponseTime || '2h'}
                  </p>
                </div>
              </div>

              {seller.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{seller.bio}</p>
                </div>
              )}

              {ratingStats.total > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map(rating => {
                      const count = ratingStats.distribution[rating] || 0;
                      const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
                      
                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 w-16">
                            <span className="text-sm text-gray-600">{rating}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ads Tab */}
          {activeTab === 'ads' && (
            <div>
              {adsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : sellerAds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerAds.map(ad => (
                    <div key={ad._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {ad.title}
                        </h3>
                        <p className="text-lg font-bold text-primary-600 mb-2">
                          KES {ad.price.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{ad.location}</span>
                          <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No ads found</h3>
                  <p className="mt-1 text-sm text-gray-500">This seller hasn't posted any ads yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              {reviewsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {review.reviewer.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.reviewer.name}</p>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                  <p className="mt-1 text-sm text-gray-500">This seller hasn't received any reviews yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile; 