import React, { useState } from 'react';
import { Star, Shield, Award, TrendingUp, Clock, CheckCircle, AlertCircle, Crown } from 'lucide-react';

const ReputationSystem = ({ 
  user, 
  showDetails = false,
  variant = 'compact' // compact, detailed, badge
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // Calculate reputation metrics
  const calculateReputation = (userData) => {
    const {
      rating = 0,
      totalRatings = 0,
      successfulTransactions = 0,
      totalTransactions = 0,
      memberSince,
      verified = false,
      responseRate = 0,
      responseTime = 0
    } = userData;

    // Calculate seller level
    let level = 'Bronze';
    let levelColor = 'text-amber-600';
    let levelIcon = <Award className="w-4 h-4" />;

    if (successfulTransactions >= 50 && rating >= 4.5) {
      level = 'Gold';
      levelColor = 'text-yellow-600';
      levelIcon = <Crown className="w-4 h-4" />;
    } else if (successfulTransactions >= 20 && rating >= 4.0) {
      level = 'Silver';
      levelColor = 'text-gray-600';
      levelIcon = <Award className="w-4 h-4" />;
    }

    // Calculate success rate
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

    // Calculate response time category
    let responseTimeCategory = 'Excellent';
    let responseTimeColor = 'text-green-600';
    if (responseTime > 24) {
      responseTimeCategory = 'Slow';
      responseTimeColor = 'text-red-600';
    } else if (responseTime > 2) {
      responseTimeCategory = 'Good';
      responseTimeColor = 'text-yellow-600';
    }

    return {
      level,
      levelColor,
      levelIcon,
      successRate,
      responseTimeCategory,
      responseTimeColor,
      memberSince: new Date(memberSince).getFullYear()
    };
  };

  const reputation = calculateReputation(user);

  // Generate star rating display
  const renderStars = (rating, size = 'w-4 h-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  // Badge component
  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700">
        {reputation.levelIcon}
        <span className={`text-xs font-medium ${reputation.levelColor}`}>
          {reputation.level}
        </span>
        {user.verified && (
          <Shield className="w-3 h-3 text-blue-600" />
        )}
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          {renderStars(user.rating || 0, 'w-3 h-3')}
          <span className="text-xs text-gray-600 dark:text-gray-400">
            ({user.totalRatings || 0})
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {reputation.levelIcon}
          <span className={`text-xs font-medium ${reputation.levelColor}`}>
            {reputation.level}
          </span>
        </div>

        {user.verified && (
          <Shield className="w-3 h-3 text-blue-600" />
        )}

        {showDetails && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-3 h-3" />
            <span>{reputation.successRate.toFixed(0)}% success</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            {renderStars(user.rating || 0)}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              {user.rating?.toFixed(1) || '0.0'} ({user.totalRatings || 0} reviews)
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {reputation.levelIcon}
          <span className={`font-medium ${reputation.levelColor}`}>
            {reputation.level} Seller
          </span>
          {user.verified && (
            <div className="flex items-center space-x-1 text-blue-600">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {reputation.successRate.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.successfulTransactions || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Successful Sales</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.responseRate || 0}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Response Rate</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {reputation.memberSince}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Member Since</div>
        </div>
      </div>

      {/* Response Time */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Response Time</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${reputation.responseTimeColor}`}>
            {reputation.responseTimeCategory}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user.responseTime || 0}h avg
          </span>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Phone Verified</span>
          {user.phoneVerified ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Email Verified</span>
          {user.emailVerified ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">ID Verified</span>
          {user.idVerified ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Rate User Button */}
      <button
        onClick={() => setShowRatingModal(true)}
        className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
      >
        Rate This User
      </button>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Rate {user.name}
            </h3>
            
            <div className="flex justify-center mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setRating(i + 1)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review (optional)..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
            
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle rating submission
                  console.log('Rating submitted:', { rating, review });
                  setShowRatingModal(false);
                  setRating(0);
                  setReview('');
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReputationSystem; 