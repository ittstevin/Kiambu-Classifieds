import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StarIcon, 
  HeartIcon, 
  ShareIcon, 
  FlagIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdsContext';
import ChatModal from '../components/ChatModal';
import ReportModal from '../components/ReportModal';
import UserRating from '../components/UserRating';

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ads } = useAds();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    fetchAdDetails();
  }, [id]);

  const fetchAdDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ads/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setAd(data.data);
        // Check if ad is saved by current user
        if (user && user.savedAds) {
          setIsSaved(user.savedAds.includes(id));
        }
      } else {
        console.error('Failed to fetch ad details');
      }
    } catch (error) {
      console.error('Error fetching ad details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAd = async () => {
    if (!user) {
      alert('Please login to save ads');
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/save-ad`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ adId: id })
      });

      const data = await response.json();
      
      if (data.success) {
        setIsSaved(!isSaved);
        alert(isSaved ? 'Ad removed from saved' : 'Ad saved successfully');
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      alert('Failed to save ad');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in your ad: ${ad.title}\n\nPrice: Ksh ${ad.price.toLocaleString()}\n\nCan you tell me more about it?`;
    const whatsappUrl = `https://wa.me/${ad.seller.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${ad.seller.phone}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ad details...</p>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ad Not Found</h2>
          <p className="text-gray-600 mb-4">The ad you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {ad.images && ad.images.length > 0 ? (
                <div className="relative">
                  <img
                    src={ad.images[currentImageIndex]}
                    alt={ad.title}
                    className="w-full h-96 object-cover"
                  />
                  {ad.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {ad.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No images available</p>
                </div>
              )}
            </div>

            {/* Ad Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {ad.location}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(ad.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {ad.views} views
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveAd}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    {isSaved ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ShareIcon className="h-6 w-6 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setShowReport(true)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FlagIcon className="h-6 w-6 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Ksh {ad.price.toLocaleString()}
                </h2>
                {ad.isNegotiable && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    Negotiable
                  </span>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
              </div>

              {/* Category-specific details */}
              {ad.details && Object.keys(ad.details).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(ad.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{ad.seller.name}</p>
                  <p className="text-gray-600 text-sm">
                    Member since {new Date(ad.seller.memberSince).toLocaleDateString()}
                  </p>
                  {ad.seller.averageRating > 0 && (
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, index) => (
                        <StarIcon
                          key={index}
                          className={`h-4 w-4 ${
                            index < Math.round(ad.seller.averageRating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {ad.seller.averageRating.toFixed(1)} ({ad.seller.totalRatings} ratings)
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowRating(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Rate this seller
                </button>
              </div>
            </div>

            {/* User Rating Component */}
            {showRating && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <UserRating
                  userId={ad.seller._id}
                  currentUser={user}
                  adId={ad._id}
                  onRatingSubmit={() => setShowRating(false)}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Seller</h3>
              <div className="space-y-3">
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={handleCall}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Call
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                  Chat
                </button>
              </div>
            </div>

            {/* Ad Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Ad Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{ad.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saves</span>
                  <span className="font-medium">{ad.saves}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inquiries</span>
                  <span className="font-medium">{ad.inquiries}</span>
                </div>
                {ad.boosted && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Boosted</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <ChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          receiverId={ad.seller._id}
          adId={ad._id}
        />
      )}

      {/* Report Modal */}
      {showReport && (
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          type="ad"
          targetId={ad._id}
          targetName={ad.title}
        />
      )}
    </div>
  );
};

export default AdDetail; 