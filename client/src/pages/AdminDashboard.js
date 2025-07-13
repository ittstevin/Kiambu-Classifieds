import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Check, X, Eye, Clock, AlertTriangle, Users, FileText, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedAd, setSelectedAd] = useState(null);

  // All hooks must be called unconditionally
  const { data: dashboardData, isLoading } = useQuery(
    'adminDashboard',
    async () => {
      const response = await axios.get('/api/admin/dashboard');
      return response.data;
    }
  );

  const { data: pendingAds } = useQuery(
    'pendingAds',
    async () => {
      const response = await axios.get('/api/admin/ads/pending');
      return response.data;
    }
  );

  const { data: approvedAds } = useQuery(
    'approvedAds',
    async () => {
      const response = await axios.get('/api/admin/ads/approved');
      return response.data;
    }
  );

  const { data: rejectedAds } = useQuery(
    'rejectedAds',
    async () => {
      const response = await axios.get('/api/admin/ads/rejected');
      return response.data;
    }
  );

  const approveAdMutation = useMutation(
    async (adId) => {
      await axios.patch(`/api/admin/ads/${adId}/approve`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pendingAds', 'approvedAds', 'adminDashboard']);
      }
    }
  );

  const rejectAdMutation = useMutation(
    async ({ adId, reason }) => {
      await axios.patch(`/api/admin/ads/${adId}/reject`, { reason });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pendingAds', 'rejectedAds', 'adminDashboard']);
      }
    }
  );

  // Now check for authentication/authorization
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleApprove = async (adId) => {
    try {
      await approveAdMutation.mutateAsync(adId);
    } catch (error) {
      console.error('Error approving ad:', error);
    }
  };

  const handleReject = async (adId, reason) => {
    try {
      await rejectAdMutation.mutateAsync({ adId, reason });
    } catch (error) {
      console.error('Error rejecting ad:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatPrice = (price) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getAdsByTab = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingAds?.ads || [];
      case 'approved':
        return approvedAds?.ads || [];
      case 'rejected':
        return rejectedAds?.ads || [];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and moderate advertisements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Ads</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.pendingCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Ads</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.approvedCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected Ads</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.rejectedCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.totalUsers || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setSelectedTab('approved')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'approved'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setSelectedTab('rejected')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'rejected'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rejected
              </button>
            </nav>
          </div>

          {/* Ads List */}
          <div className="p-6">
            {getAdsByTab().length > 0 ? (
              <div className="space-y-4">
                {getAdsByTab().map((ad) => (
                  <div key={ad._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={ad.images?.[0] || '/placeholder-image.jpg'}
                        alt={ad.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span>{formatPrice(ad.price)}</span>
                          <span>•</span>
                          <span>{ad.location}</span>
                          <span>•</span>
                          <span>{formatDate(ad.createdAt)}</span>
                          <span>•</span>
                          <span>by {ad.seller?.name}</span>
                        </div>

                        {selectedTab === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(ad._id)}
                              disabled={approveAdMutation.isLoading}
                              className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              <Check size={14} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Enter rejection reason:');
                                if (reason) handleReject(ad._id, reason);
                              }}
                              disabled={rejectAdMutation.isLoading}
                              className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              <X size={14} />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => setSelectedAd(ad)}
                              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              <Eye size={14} />
                              <span>View Details</span>
                            </button>
                          </div>
                        )}

                        {selectedTab === 'rejected' && ad.rejectionReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                              <strong>Reason:</strong> {ad.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  {selectedTab === 'pending' && <Clock className="mx-auto h-12 w-12" />}
                  {selectedTab === 'approved' && <Check className="mx-auto h-12 w-12" />}
                  {selectedTab === 'rejected' && <X className="mx-auto h-12 w-12" />}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {selectedTab} ads
                </h3>
                <p className="text-gray-600">
                  {selectedTab === 'pending' && 'All ads have been reviewed'}
                  {selectedTab === 'approved' && 'No approved ads yet'}
                  {selectedTab === 'rejected' && 'No rejected ads'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ad Detail Modal */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ad Details</h3>
              <button
                onClick={() => setSelectedAd(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedAd.title}</h4>
                <p className="text-gray-600">{selectedAd.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Price:</span>
                  <span className="ml-2">{formatPrice(selectedAd.price)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2">{selectedAd.location}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 capitalize">{selectedAd.category}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Condition:</span>
                  <span className="ml-2 capitalize">{selectedAd.condition}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Seller:</span>
                  <span className="ml-2">{selectedAd.seller?.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Contact:</span>
                  <span className="ml-2">{selectedAd.contactPhone}</span>
                </div>
              </div>

              {selectedAd.images && selectedAd.images.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Images:</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedAd.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedAd.title} ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    handleApprove(selectedAd._id);
                    setSelectedAd(null);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Enter rejection reason:');
                    if (reason) {
                      handleReject(selectedAd._id, reason);
                      setSelectedAd(null);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 