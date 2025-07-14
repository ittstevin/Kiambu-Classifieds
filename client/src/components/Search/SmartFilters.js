import React, { useState, useEffect } from 'react';
import { Filter, Sliders, Shield, Star, MapPin, DollarSign, Calendar, Zap } from 'lucide-react';

const SmartFilters = ({ 
  category, 
  filters, 
  onFilterChange, 
  onClearFilters,
  showVerifiedOnly = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Dynamic filter options based on category
  const getCategoryFilters = (cat) => {
    const baseFilters = {
      price: { min: 0, max: 1000000, step: 1000 },
      location: [
        'Kiambu County', 'Thika', 'Juja', 'Ruiru', 'Gatundu', 
        'Lari', 'Limuru', 'Kikuyu', 'Kabete', 'Kiambaa'
      ],
      condition: ['new', 'used', 'refurbished'],
      sortBy: ['relevance', 'price_low', 'price_high', 'date_new', 'date_old']
    };

    const categorySpecific = {
      vehicles: {
        ...baseFilters,
        price: { min: 0, max: 5000000, step: 5000 },
        year: { min: 1990, max: new Date().getFullYear() + 1, step: 1 },
        mileage: { min: 0, max: 500000, step: 1000 },
        fuelType: ['petrol', 'diesel', 'hybrid', 'electric'],
        transmission: ['manual', 'automatic'],
        bodyType: ['sedan', 'suv', 'hatchback', 'pickup', 'van', 'truck']
      },
      electronics: {
        ...baseFilters,
        price: { min: 0, max: 500000, step: 1000 },
        brand: ['Samsung', 'Apple', 'Huawei', 'Nokia', 'Tecno', 'Infinix', 'Canon', 'Nikon', 'Sony', 'LG'],
        warranty: ['yes', 'no', 'expired'],
        accessories: ['original_box', 'charger', 'manual', 'warranty_card']
      },
      property: {
        ...baseFilters,
        price: { min: 0, max: 50000000, step: 100000 },
        bedrooms: [1, 2, 3, 4, 5, '5+'],
        bathrooms: [1, 2, 3, 4, '4+'],
        propertyType: ['apartment', 'house', 'bungalow', 'maisonette', 'studio'],
        furnished: ['furnished', 'semi_furnished', 'unfurnished']
      },
      furniture: {
        ...baseFilters,
        price: { min: 0, max: 200000, step: 1000 },
        material: ['wood', 'metal', 'plastic', 'leather', 'fabric', 'glass'],
        room: ['living_room', 'bedroom', 'kitchen', 'dining', 'office', 'outdoor']
      },
      fashion: {
        ...baseFilters,
        price: { min: 0, max: 50000, step: 500 },
        size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        gender: ['men', 'women', 'unisex', 'kids'],
        brand: ['Nike', 'Adidas', 'Puma', 'Gucci', 'LV', 'Local']
      }
    };

    return categorySpecific[cat] || baseFilters;
  };

  const categoryFilters = getCategoryFilters(category);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRangeChange = (key, min, max) => {
    handleFilterChange(key, { min, max });
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    return Object.keys(localFilters).filter(key => {
      const value = localFilters[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object') return value.min > 0 || value.max < categoryFilters[key]?.max;
      return value && value !== '';
    }).length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">Smart Filters</span>
            {getActiveFiltersCount() > 0 && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} p-4 space-y-6`}>
        
        {/* Verified Sellers Only */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Verified Sellers Only
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.verifiedOnly || false}
              onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">Price Range</span>
          </div>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.price?.min || ''}
                onChange={(e) => handleRangeChange('price', parseInt(e.target.value) || 0, localFilters.price?.max || categoryFilters.price.max)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={localFilters.price?.max || ''}
                onChange={(e) => handleRangeChange('price', localFilters.price?.min || 0, parseInt(e.target.value) || categoryFilters.price.max)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <input
                type="range"
                min={categoryFilters.price.min}
                max={categoryFilters.price.max}
                step={categoryFilters.price.step}
                value={localFilters.price?.max || categoryFilters.price.max}
                onChange={(e) => handleRangeChange('price', localFilters.price?.min || 0, parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">Location</span>
          </div>
          <select
            value={localFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Locations</option>
            {categoryFilters.location.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">Condition</span>
          </div>
          <div className="space-y-2">
            {categoryFilters.condition.map(condition => (
              <label key={condition} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.condition?.includes(condition) || false}
                  onChange={(e) => {
                    const current = localFilters.condition || [];
                    const newCondition = e.target.checked
                      ? [...current, condition]
                      : current.filter(c => c !== condition);
                    handleFilterChange('condition', newCondition);
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {condition}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Category-Specific Filters */}
        {category === 'vehicles' && (
          <>
            {/* Year Range */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Year</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min Year"
                  value={localFilters.year?.min || ''}
                  onChange={(e) => handleRangeChange('year', parseInt(e.target.value) || 0, localFilters.year?.max || categoryFilters.year.max)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max Year"
                  value={localFilters.year?.max || ''}
                  onChange={(e) => handleRangeChange('year', localFilters.year?.min || 0, parseInt(e.target.value) || categoryFilters.year.max)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Fuel Type */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">Fuel Type</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoryFilters.fuelType.map(fuel => (
                  <label key={fuel} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={localFilters.fuelType?.includes(fuel) || false}
                      onChange={(e) => {
                        const current = localFilters.fuelType || [];
                        const newFuel = e.target.checked
                          ? [...current, fuel]
                          : current.filter(f => f !== fuel);
                        handleFilterChange('fuelType', newFuel);
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {fuel}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sort By */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Sliders className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">Sort By</span>
          </div>
          <select
            value={localFilters.sortBy || 'relevance'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="relevance">Relevance</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="date_new">Newest First</option>
            <option value="date_old">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SmartFilters; 