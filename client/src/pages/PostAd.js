import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAd } from '../contexts/AdContext';
import { Upload, X, Plus, Camera, Eye, Trash2, Sparkles, Lightbulb, Video } from 'lucide-react';
import AISuggestions from '../components/Ads/AISuggestions';
import VideoUpload from '../components/Ads/VideoUpload';
import LocalDialect from '../components/Local/LocalDialect';

const PostAd = () => {
  const { isAuthenticated } = useAuth();
  const { createAd, loading } = useAd();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    condition: 'used',
    brand: '',
    model: '',
    year: '',
    location: '',
    contactPhone: '',
    contactEmail: '',
    isNegotiable: false
  });

  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const categories = {
    vehicles: ['Cars', 'Motorcycles', 'Commercial Vehicles', 'Auto Parts'],
    property: ['Houses', 'Apartments', 'Land', 'Commercial Property'],
    electronics: ['Phones', 'Laptops', 'TVs', 'Audio Equipment'],
    fashion: ['Clothing', 'Shoes', 'Accessories', 'Jewelry'],
    services: ['Professional Services', 'Home Services', 'Transportation'],
    jobs: ['Full-time', 'Part-time', 'Freelance', 'Internship'],
    furniture: ['Sofas', 'Beds', 'Tables', 'Chairs'],
    books: ['Textbooks', 'Fiction', 'Non-fiction', 'Magazines'],
    sports: ['Equipment', 'Clothing', 'Accessories'],
    pets: ['Dogs', 'Cats', 'Birds', 'Fish'],
    agriculture: ['Machinery', 'Seeds', 'Fertilizers', 'Livestock'],
    other: ['Miscellaneous']
  };

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
    { value: 'refurbished', label: 'Refurbished' }
  ];

  const locations = [
    'Kiambu County',
    'Thika',
    'Juja',
    'Ruiru',
    'Gatundu',
    'Lari',
    'Limuru',
    'Kikuyu',
    'Kabete',
    'Kiambaa'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle AI suggestion selection
  const handleAISuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion
    }));
  };

  // Handle AI image upload
  const handleAIImageUpload = (file) => {
    // Add the AI-analyzed image to the images array
    const newImage = {
      file,
      preview: URL.createObjectURL(file)
    };
    setImages(prev => [...prev, newImage]);
  };

  // Handle video upload
  const handleVideoUpload = (file) => {
    setVideoFile(file);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length + images.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('images', image.file);
      });

      // Add video if uploaded
      if (videoFile) {
        formDataToSend.append('video', videoFile);
      }

      const result = await createAd(formDataToSend);
      if (result) {
        navigate('/my-ads');
      }
    } catch (error) {
      console.error('Error creating ad:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-bold text-gray-900 mb-4">
            Sign in to post an ad
          </h2>
          <p className="text-center text-gray-600 mb-8">
            You need to be logged in to post advertisements
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Post Your Ad
              </h1>
              <LocalDialect type="badge" />
            </div>
            <p className="text-gray-600">
              Create a compelling advertisement to reach potential buyers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Suggestions Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    AI-Powered Ad Creation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {showAISuggestions ? 'Hide' : 'Show'} AI Help
                </button>
              </div>
              
              {showAISuggestions && (
                <AISuggestions
                  userInput={formData.title}
                  category={formData.category}
                  onSuggestionSelect={handleAISuggestion}
                  onImageUpload={handleAIImageUpload}
                />
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input-field ${errors.title ? 'border-red-300' : ''}`}
                  placeholder="Enter a descriptive title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KES) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`input-field ${errors.price ? 'border-red-300' : ''}`}
                  placeholder="0"
                  min="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>
            </div>

            {/* Category and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input-field ${errors.category ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select Subcategory</option>
                    {categories[formData.category]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="input-field"
                >
                  {conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Samsung, Toyota"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Galaxy S21, Corolla"
                />
              </div>
            </div>

            {/* Year and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`input-field ${errors.location ? 'border-red-300' : ''}`}
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`input-field ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Provide detailed information about your item..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Media Upload Section */}
            <div className="space-y-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="btn-primary inline-flex items-center">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Upload up to 10 images (max 5MB each)
                    </p>
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg cursor-pointer"
                              onClick={() => {
                                setSelectedImage(image);
                                setShowImageModal(true);
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage(image);
                                    setShowImageModal(true);
                                  }}
                                  className="p-1 bg-white/80 hover:bg-white rounded transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4 text-gray-600" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                  }}
                                  className="p-1 bg-white/80 hover:bg-white rounded transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Click on images to preview • Drag to reorder
                      </p>
                    </div>
                  )}
                </div>
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">{errors.images}</p>
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video (Optional)
                </label>
                <VideoUpload
                  onVideoUpload={handleVideoUpload}
                  maxDuration={30}
                  maxSize={50}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+254 700 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Negotiable with Local Dialect */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <input
                  id="negotiable"
                  name="isNegotiable"
                  type="checkbox"
                  checked={formData.isNegotiable}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                  Price is negotiable
                </label>
              </div>
              {formData.isNegotiable && (
                <LocalDialect type="text" context="negotiation" />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-accent"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="spinner mr-2"></div>
                    Posting...
                  </div>
                ) : (
                  'Post Ad'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Image Preview</h3>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.preview}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded"
              />
            </div>
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  File: {selectedImage.file.name}
                </div>
                <div className="text-sm text-gray-600">
                  Size: {(selectedImage.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostAd; 