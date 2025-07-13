import React from 'react';
import { useQuery } from 'react-query';
import { Heart, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';
import AdCard from '../components/Ads/AdCard';

const SavedAds = () => {
  const { user, isAuthenticated } = useAuth();
  const { savedAds, toggleSaveAd } = useAd();

  const { data: savedAdsData, isLoading, refetch } = useQuery(
    'savedAds',
    async () => {
      if (!savedAds.length) return { ads: [] };
      const response = await axios.get('/api/ads', {
        params: { ids: savedAds.join(',') }
      });
      return response.data;
    },
    { enabled: isAuthenticated && savedAds.length > 0 }
  );

  const handleRemoveSaved = async (adId) => {
    await toggleSaveAd(adId);
    refetch();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sign in to view saved ads
            </h3>
            <p className="text-gray-600 mb-6">
              Create an account or sign in to save and view your favorite ads
            </p>
            <div className="flex justify-center space-x-4">
              <a href="/login" className="btn-primary">
                Sign In
              </a>
              <a href="/register" className="btn-secondary">
                Create Account
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Ads</h1>
          <p className="text-gray-600">
            Your favorite advertisements ({savedAdsData?.ads?.length || 0} saved)
          </p>
        </div>

        {/* Saved Ads Grid */}
        {savedAdsData?.ads?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedAdsData.ads.map((ad) => (
              <div key={ad._id} className="ad-card relative group">
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveSaved(ad._id)}
                  className="absolute top-2 right-2 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from saved"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>

                {/* Saved Heart Icon */}
                <div className="absolute top-2 left-2 z-10">
                  <Heart size={20} className="fill-red-500 text-red-500" />
                </div>

                {/* Ad Card Content */}
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved ads yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start browsing and save ads you're interested in by clicking the heart icon
            </p>
            <a href="/" className="btn-primary">
              Browse Ads
            </a>
          </div>
        )}

        {/* Pagination */}
        {savedAdsData?.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              {Array.from({ length: savedAdsData.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${
                    page === savedAdsData.page ? 'pagination-active' : ''
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAds; 