import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, Clock, TrendingUp, X, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdvancedSearch = ({ onSearch, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    location: '',
    priceMin: '',
    priceMax: '',
    condition: '',
    sortBy: 'relevance'
  });

  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const category = params.get('category') || '';
    const location = params.get('location') || '';
    const priceMin = params.get('priceMin') || '';
    const priceMax = params.get('priceMax') || '';
    const condition = params.get('condition') || '';
    const sortBy = params.get('sortBy') || 'relevance';

    setSearchTerm(query);
    setSelectedFilters({
      category,
      location,
      priceMin,
      priceMax,
      condition,
      sortBy
    });
  }, [location.search]);

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Load trending searches
  useEffect(() => {
    const loadTrendingSearches = async () => {
      try {
        const response = await axios.get('/api/ads/trending-searches');
        setTrendingSearches(response.data);
      } catch (error) {
        console.error('Error loading trending searches:', error);
      }
    };
    loadTrendingSearches();
  }, []);

  // Get search suggestions
  const { data: suggestions = [] } = useQuery(
    ['search-suggestions', searchTerm],
    async () => {
      if (searchTerm.length < 2) return [];
      const response = await axios.get(`/api/ads/suggestions?q=${searchTerm}`);
      return response.data;
    },
    {
      enabled: searchTerm.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const categories = {
    vehicles: 'Vehicles',
    property: 'Property',
    electronics: 'Electronics',
    fashion: 'Fashion',
    services: 'Services',
    jobs: 'Jobs',
    furniture: 'Furniture',
    books: 'Books',
    sports: 'Sports',
    pets: 'Pets',
    agriculture: 'Agriculture',
    other: 'Other'
  };

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'used', label: 'Used' },
    { value: 'refurbished', label: 'Refurbished' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'date_new', label: 'Date: Newest First' },
    { value: 'date_old', label: 'Date: Oldest First' }
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

  const handleSearch = (term = searchTerm, filters = selectedFilters) => {
    if (!term.trim()) return;

    // Add to search history
    const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Build search URL
    const params = new URLSearchParams();
    params.set('q', term.trim());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    const searchUrl = `/search?${params.toString()}`;
    navigate(searchUrl);
    
    if (onSearch) {
      onSearch({ term: term.trim(), filters });
    }

    setShowSuggestions(false);
    setShowFilters(false);
  };

  const handleFilterChange = (key, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      category: '',
      location: '',
      priceMin: '',
      priceMax: '',
      condition: '',
      sortBy: 'relevance'
    });
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    handleSearch(suggestion);
  };

  const handleHistoryClick = (term) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  const handleTrendingClick = (term) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  const hasActiveFilters = Object.values(selectedFilters).some(value => value && value !== 'relevance');

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="Search for anything..."
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded ${
              hasActiveFilters ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-primary-600 text-white px-4 py-1 rounded-md hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (searchTerm || searchHistory.length > 0 || trendingSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h3>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm text-gray-700 flex items-center"
                >
                  <Search className="w-4 h-4 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Recent Searches
              </h3>
              {searchHistory.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(term)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm text-gray-700"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {trendingSearches.length > 0 && (
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.slice(0, 6).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleTrendingClick(term)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {Object.entries(categories).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={selectedFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={selectedFilters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Any Condition</option>
                {conditions.map(condition => (
                  <option key={condition.value} value={condition.value}>
                    {condition.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={selectedFilters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                value={selectedFilters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={selectedFilters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => handleSearch(searchTerm, selectedFilters)}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(selectedFilters).map(([key, value]) => {
            if (!value || value === 'relevance') return null;
            
            let label = '';
            switch (key) {
              case 'category':
                label = categories[value] || value;
                break;
              case 'location':
                label = value;
                break;
              case 'condition':
                label = conditions.find(c => c.value === value)?.label || value;
                break;
              case 'priceMin':
                label = `Min: KES ${value}`;
                break;
              case 'priceMax':
                label = `Max: KES ${value}`;
                break;
              case 'sortBy':
                label = sortOptions.find(s => s.value === value)?.label || value;
                break;
              default:
                label = value;
            }

            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
              >
                {label}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 