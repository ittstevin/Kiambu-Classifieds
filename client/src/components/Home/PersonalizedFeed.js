import React, { useState, useEffect } from 'react';
import { Heart, MapPin, TrendingUp, Clock, Eye, Star, Shield } from 'lucide-react';
import AdCard from '../Ads/AdCard';

const PersonalizedFeed = ({ user, ads = [] }) => {
  const [activeTab, setActiveTab] = useState('forYou');
  const [feedAds, setFeedAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate personalized feed generation
  useEffect(() => {
    const generatePersonalizedFeed = () => {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        let personalizedAds = [...ads];
        
        // Apply personalization based on user preferences
        if (user) {
          // Filter by user's saved categories
          if (user.savedCategories?.length > 0) {
            personalizedAds = personalizedAds.filter(ad => 
              user.savedCategories.includes(ad.category)
            );
          }
          
          // Filter by user's location
          if (user.location) {
            personalizedAds = personalizedAds.filter(ad => 
              ad.location?.toLowerCase().includes(user.location.toLowerCase())
            );
          }
          
          // Add trending items
          const trendingAds = ads.filter(ad => ad.views > 100).slice(0, 5);
          personalizedAds = [...personalizedAds, ...trendingAds];
          
          // Remove duplicates
          personalizedAds = personalizedAds.filter((ad, index, self) => 
            index === self.findIndex(a => a.id === ad.id)
          );
        }
        
        setFeedAds(personalizedAds);
        setIsLoading(false);
      }, 1000);
    };

    generatePersonalizedFeed();
  }, [user, ads]);

  // Get trending categories
  const getTrendingCategories = () => {
    const categoryCounts = {};
    ads.forEach(ad => {
      categoryCounts[ad.category] = (categoryCounts[ad.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
  };

  // Get recently viewed ads
  const getRecentlyViewed = () => {
    return ads.filter(ad => ad.recentlyViewed).slice(0, 6);
  };

  // Get recommended based on user behavior
  const getRecommended = () => {
    if (!user) return ads.slice(0, 10);
    
    // Simulate recommendation algorithm
    const userInterests = user.savedCategories || [];
    const recommended = ads.filter(ad => 
      userInterests.includes(ad.category) || 
      ad.price < 50000 || // Budget-friendly items
      ad.verifiedSeller
    );
    
    return recommended.slice(0, 10);
  };

  const renderFeedContent = () => {
    switch (activeTab) {
      case 'forYou':
        return (
          <div className="space-y-6">
            {/* Personalized Header */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="w-5 h-5 text-primary-600" />
                <h3 className="font-medium text-primary-900 dark:text-primary-100">
                  Personalized for You
                </h3>
              </div>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Based on your interests in {user?.savedCategories?.join(', ') || 'various categories'} 
                {user?.location && ` and location in ${user.location}`}
              </p>
            </div>

            {/* Feed Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedAds.map(ad => (
                  <AdCard key={ad.id} ad={ad} showPersonalization={true} />
                ))}
              </div>
            )}
          </div>
        );

      case 'trending':
        return (
          <div className="space-y-6">
            {/* Trending Categories */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="font-medium text-orange-900 dark:text-orange-100">
                  Trending Categories
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {getTrendingCategories().map(category => (
                  <span
                    key={category}
                    className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Trending Ads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads
                .filter(ad => ad.views > 50)
                .sort((a, b) => b.views - a.views)
                .slice(0, 9)
                .map(ad => (
                  <AdCard key={ad.id} ad={ad} showTrending={true} />
                ))}
            </div>
          </div>
        );

      case 'recent':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900 dark:text-green-100">
                  Recently Viewed
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Continue browsing where you left off
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecentlyViewed().map(ad => (
                <AdCard key={ad.id} ad={ad} showRecent={true} />
              ))}
            </div>
          </div>
        );

      case 'recommended':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-purple-900 dark:text-purple-100">
                  Recommended for You
                </h3>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Based on your browsing history and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecommended().map(ad => (
                <AdCard key={ad.id} ad={ad} showRecommended={true} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Feed Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 p-1">
          {[
            { id: 'forYou', label: 'For You', icon: Heart },
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'recent', label: 'Recent', icon: Clock },
            { id: 'recommended', label: 'Recommended', icon: Star }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Content */}
      <div className="min-h-96">
        {renderFeedContent()}
      </div>

      {/* Personalization Tips */}
      {activeTab === 'forYou' && user && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Improve Your Feed
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Save categories you're interested in</p>
            <p>• Update your location for local recommendations</p>
            <p>• Rate ads to help us understand your preferences</p>
            <p>• Follow sellers you trust</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedFeed; 