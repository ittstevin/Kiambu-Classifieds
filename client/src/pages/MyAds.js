import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';
import AdCard from '../components/Ads/AdCard';

const MyAds = () => {
  const { user } = useAuth();
  const { deleteAd } = useAd();
  const [deletingAd, setDeletingAd] = useState(null);

  const { data: myAds, isLoading, refetch } = useQuery(
    'myAds',
    async () => {
      const response = await axios.get('/api/ads', {
        params: { seller: user?.id }
      });
      return response.data;
    },
    { enabled: !!user }
  );

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      setDeletingAd(adId);
      try {
        await deleteAd(adId);
        refetch();
      } catch (error) {
        console.error('Error deleting ad:', error);
      } finally {
        setDeletingAd(null);
      }
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Ads</h1>
            <p className="text-gray-600">
              Manage your advertisements and track their performance
            </p>
          </div>
          <Link
            to="/post-ad"
            className="btn-accent flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Post New Ad</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-primary-600">
              {myAds?.ads?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Ads</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {myAds?.ads?.filter(ad => ad.isActive).length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Ads</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">
              {myAds?.ads?.filter(ad => !ad.isApproved).length || 0}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {myAds?.ads?.reduce((total, ad) => total + (ad.views || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
        </div>

        {/* Ads List */}
        {myAds?.ads?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAds.ads.map((ad) => (
              <div key={ad._id} className="ad-card relative">
                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                  {!ad.isApproved && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Pending
                    </span>
                  )}
                  {!ad.isActive && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 z-10 flex space-x-1">
                  <Link
                    to={`/ad/${ad._id}`}
                    className="p-1 bg-white/80 hover:bg-white rounded transition-colors"
                    title="View"
                  >
                    <Eye size={16} className="text-gray-600" />
                  </Link>
                  <Link
                    to={`/edit-ad/${ad._id}`}
                    className="p-1 bg-white/80 hover:bg-white rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </Link>
                  <button
                    onClick={() => handleDeleteAd(ad._id)}
                    disabled={deletingAd === ad._id}
                    className="p-1 bg-white/80 hover:bg-white rounded transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingAd === ad._id ? (
                      <div className="spinner w-4 h-4"></div>
                    ) : (
                      <Trash2 size={16} className="text-red-600" />
                    )}
                  </button>
                </div>

                {/* Ad Image */}
                <img
                  src={ad.images?.[0] || '/placeholder-image.jpg'}
                  alt={ad.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />

                {/* Ad Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {ad.title}
                  </h3>
                  
                  <div className="price-tag mb-2">
                    {formatPrice(ad.price)}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      <span>{formatDate(ad.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      <span>{ad.views || 0} views</span>
                    </div>
                  </div>

                  {/* Ad Status */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ad.isApproved && ad.isActive
                        ? 'bg-green-100 text-green-800'
                        : ad.isApproved
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ad.isApproved && ad.isActive
                        ? 'Active'
                        : ad.isApproved
                        ? 'Approved'
                        : 'Pending'
                      }
                    </span>
                    
                    <span className="text-xs text-gray-500 capitalize">
                      {ad.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ads yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start selling by posting your first advertisement
            </p>
            <Link to="/post-ad" className="btn-accent">
              Post Your First Ad
            </Link>
          </div>
        )}

        {/* Pagination */}
        {myAds?.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              {Array.from({ length: myAds.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`pagination-btn ${
                    page === myAds.page ? 'pagination-active' : ''
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

export default MyAds; 