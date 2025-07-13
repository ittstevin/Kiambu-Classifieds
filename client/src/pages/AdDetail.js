import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { MapPin, Clock, Phone, Mail, Heart, Share2, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';
import AdCard from '../components/Ads/AdCard';

const AdDetail = () => {
  const { adId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toggleSaveAd, savedAds } = useAd();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  const { data: ad, isLoading } = useQuery(
    ['ad', adId],
    async () => {
      const response = await axios.get(`/api/ads/${adId}`);
      return response.data;
    }
  );

  const { data: similarAds } = useQuery(
    ['similarAds', adId],
    async () => {
      const response = await axios.get(`/api/ads/${adId}/similar`);
      return response.data;
    },
    { enabled: !!ad }
  );

  const isSaved = savedAds.includes(adId);

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

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    await toggleSaveAd(adId);
  };

  const handleContactSeller = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      await axios.post(`/api/ads/${adId}/contact`, { message: contactMessage });
      setShowContactModal(false);
      setContactMessage('');
    } catch (error) {
      console.error('Error contacting seller:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ad not found</h2>
          <p className="text-gray-600 mb-4">The ad you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-primary-600">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to={`/category/${ad.category}`} className="hover:text-primary-600 capitalize">
                {ad.category}
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{ad.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="mb-6">
              <div className="relative">
                <img
                  src={ad.images[selectedImage]}
                  alt={ad.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={handleSaveClick}
                    className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                  >
                    <Heart
                      size={20}
                      className={isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                  </button>
                  <button className="p-2 bg-white/80 hover:bg-white rounded-full transition-colors">
                    <Share2 size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Images */}
              {ad.images.length > 1 && (
                <div className="mt-4 flex space-x-2 overflow-x-auto">
                  {ad.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${ad.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ad Details */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                  <div className="price-tag text-2xl mb-2">{formatPrice(ad.price)}</div>
                  {ad.isNegotiable && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded">
                      Negotiable
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <MapPin size={16} className="mr-1" />
                  <span>{ad.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-1" />
                  <span>{formatTimeAgo(ad.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Eye size={16} className="mr-1" />
                  <span>{ad.views} views</span>
                </div>
              </div>

              {/* Ad Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {ad.brand && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Brand:</span>
                    <span className="ml-2 text-gray-900">{ad.brand}</span>
                  </div>
                )}
                {ad.model && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Model:</span>
                    <span className="ml-2 text-gray-900">{ad.model}</span>
                  </div>
                )}
                {ad.year && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Year:</span>
                    <span className="ml-2 text-gray-900">{ad.year}</span>
                  </div>
                )}
                {ad.condition && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Condition:</span>
                    <span className="ml-2 text-gray-900 capitalize">{ad.condition}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{ad.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Seller Information */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-primary-600 font-semibold">
                      {ad.seller?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{ad.seller?.name}</p>
                    <p className="text-sm text-gray-500">{ad.seller?.location}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {ad.contactPhone && (
                    <button
                      onClick={() => window.open(`tel:${ad.contactPhone}`)}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Phone size={16} />
                      <span>Call Seller</span>
                    </button>
                  )}

                  {ad.contactPhone && (
                    <button
                      onClick={() => {
                        const message = `Hi! I'm interested in your ad: ${ad.title}`;
                        const whatsappUrl = `https://wa.me/${ad.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span>WhatsApp Seller</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowContactModal(true)}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <Mail size={16} />
                    <span>Message Seller</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety Tips</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Meet in a public place</li>
                <li>• Inspect the item before buying</li>
                <li>• Don't share personal information</li>
                <li>• Be cautious of too-good-to-be-true deals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Similar Ads */}
        {similarAds && similarAds.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarAds.map((similarAd) => (
                <AdCard key={similarAd._id} ad={similarAd} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Seller</h3>
            <form onSubmit={handleContactSeller}>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Write your message to the seller..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                required
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetail; 