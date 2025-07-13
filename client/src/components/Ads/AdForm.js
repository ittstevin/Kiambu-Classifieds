import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Save, Eye, Upload, X, Plus, Camera, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const AdForm = ({ ad = null, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
    isNegotiable: false,
    isDraft: true
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

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

  // Initialize form with existing ad data
  useEffect(() => {
    if (ad) {
      setFormData({
        title: ad.title || '',
        description: ad.description || '',
        price: ad.price || '',
        category: ad.category || '',
        subcategory: ad.subcategory || '',
        condition: ad.condition || 'used',
        brand: ad.brand || '',
        model: ad.model || '',
        year: ad.year || '',
        location: ad.location || '',
        contactPhone: ad.contactPhone || user?.phone || '',
        contactEmail: ad.contactEmail || user?.email || '',
        isNegotiable: ad.isNegotiable || false,
        isDraft: ad.status === 'draft'
      });
    }
  }, [ad, user]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!formData.title.trim()) return; // Don't save empty forms

    setIsAutoSaving(true);
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

      if (ad) {
        // Update existing ad
        await axios.put(`/api/ads/${ad._id}`, formDataToSend);
      } else {
        // Create new draft
        await axios.post('/api/ads', formDataToSend);
      }

      setLastSaved(new Date());
      toast.success('Draft saved automatically');
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [formData, images, ad]);

  // Set up auto-save timer
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      autoSave();
    }, 30000); // Auto-save every 30 seconds

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [formData, images, autoSave]);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
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

  const createAdMutation = useMutation(
    async (formDataToSend) => {
      const response = await axios.post('/api/ads', formDataToSend);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Ad created successfully!');
        queryClient.invalidateQueries('ads');
        if (onSuccess) onSuccess(data);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to create ad';
        toast.error(message);
      }
    }
  );

  const updateAdMutation = useMutation(
    async (formDataToSend) => {
      const response = await axios.put(`/api/ads/${ad._id}`, formDataToSend);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Ad updated successfully!');
        queryClient.invalidateQueries('ads');
        if (onSuccess) onSuccess(data);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to update ad';
        toast.error(message);
      }
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add slug for SEO
      formDataToSend.append('slug', generateSlug(formData.title));

      // Add images
      images.forEach((image, index) => {
        formDataToSend.append('images', image.file);
      });

      if (ad) {
        await updateAdMutation.mutateAsync(formDataToSend);
      } else {
        await createAdMutation.mutateAsync(formDataToSend);
      }
    } catch (error) {
      console.error('Error submitting ad:', error);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error('Please add a title to save as draft');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.append('isDraft', 'true');

      images.forEach((image, index) => {
        formDataToSend.append('images', image.file);
      });

      if (ad) {
        await axios.put(`/api/ads/${ad._id}`, formDataToSend);
      } else {
        await axios.post('/api/ads', formDataToSend);
      }

      toast.success('Draft saved successfully!');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {ad ? 'Edit Ad' : 'Post New Ad'}
          </h1>
          <p className="text-gray-600">
            {ad ? 'Update your advertisement' : 'Create a new advertisement'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          <button
            onClick={handleSaveDraft}
            disabled={isAutoSaving}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Save Draft</span>
          </button>
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye size={16} />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </button>
        </div>
      </div>

      {/* Auto-save indicator */}
      {isAutoSaving && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 text-sm">Auto-saving...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
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
                placeholder="e.g., Samsung Galaxy S21 - Excellent Condition"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
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

          <div className="mt-6">
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
        </div>

        {/* Category and Details */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category & Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {formData.category && categories[formData.category] && (
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
                  {categories[formData.category].map(subcategory => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
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
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images *</h2>
          
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
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          
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

          <div className="mt-6">
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

          <div className="mt-6 flex items-center">
            <input
              id="negotiable"
              name="isNegotiable"
              type="checkbox"
              checked={formData.isNegotiable}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-900">
              Price is negotiable
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createAdMutation.isLoading || updateAdMutation.isLoading}
            className="btn-accent"
          >
            {createAdMutation.isLoading || updateAdMutation.isLoading ? (
              <div className="flex items-center">
                <div className="spinner mr-2"></div>
                {ad ? 'Updating...' : 'Posting...'}
              </div>
            ) : (
              ad ? 'Update Ad' : 'Post Ad'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdForm; 