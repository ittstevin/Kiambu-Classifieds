import React, { useState, useEffect } from 'react';
import { Sparkles, Camera, Lightbulb, Check, X } from 'lucide-react';

const AISuggestions = ({ 
  userInput, 
  category, 
  onSuggestionSelect, 
  onImageUpload,
  showImageUpload = true 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // AI suggestion patterns based on category and input
  const getSuggestions = (input, cat) => {
    const lowerInput = input.toLowerCase();
    const suggestions = [];

    // Title suggestions based on category
    if (cat === 'electronics') {
      if (lowerInput.includes('phone') || lowerInput.includes('mobile')) {
        suggestions.push(
          `${input} - Excellent Condition`,
          `${input} with Original Box`,
          `${input} - Like New`,
          `${input} - Great Deal`
        );
      } else if (lowerInput.includes('laptop') || lowerInput.includes('computer')) {
        suggestions.push(
          `${input} - High Performance`,
          `${input} with Accessories`,
          `${input} - Perfect for Work`,
          `${input} - Great for Students`
        );
      }
    } else if (cat === 'vehicles') {
      if (lowerInput.includes('car') || lowerInput.includes('vehicle')) {
        suggestions.push(
          `${input} - Well Maintained`,
          `${input} - Low Mileage`,
          `${input} - Perfect for Family`,
          `${input} - Great Fuel Economy`
        );
      } else if (lowerInput.includes('motorcycle') || lowerInput.includes('bike')) {
        suggestions.push(
          `${input} - Perfect for Commuting`,
          `${input} - Great Condition`,
          `${input} - Low Fuel Consumption`,
          `${input} - Ideal for Delivery`
        );
      }
    } else if (cat === 'property') {
      if (lowerInput.includes('house') || lowerInput.includes('home')) {
        suggestions.push(
          `${input} - Perfect Location`,
          `${input} - Ready to Move In`,
          `${input} - Great Investment`,
          `${input} - Family Friendly`
        );
      } else if (lowerInput.includes('land') || lowerInput.includes('plot')) {
        suggestions.push(
          `${input} - Prime Location`,
          `${input} - Ready for Development`,
          `${input} - Great Investment`,
          `${input} - Clear Title`
        );
      }
    } else if (cat === 'furniture') {
      suggestions.push(
        `${input} - Excellent Condition`,
        `${input} - Perfect for Home`,
        `${input} - Great Quality`,
        `${input} - Must See`
      );
    } else {
      // Generic suggestions
      suggestions.push(
        `${input} - Excellent Condition`,
        `${input} - Great Deal`,
        `${input} - Must See`,
        `${input} - Perfect for You`
      );
    }

    // Add location-based suggestions
    const locations = ['Kiambu', 'Thika', 'Juja', 'Ruiru'];
    locations.forEach(location => {
      suggestions.push(`${input} in ${location}`);
    });

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  };

  // Simulate AI processing
  useEffect(() => {
    if (userInput && userInput.length > 2) {
      setIsLoading(true);
      
      // Simulate AI processing delay
      setTimeout(() => {
        const newSuggestions = getSuggestions(userInput, category);
        setSuggestions(newSuggestions);
        setIsLoading(false);
      }, 500);
    } else {
      setSuggestions([]);
    }
  }, [userInput, category]);

  // Handle image upload for AI analysis
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      
      // Simulate AI image analysis
      setIsLoading(true);
      setTimeout(() => {
        // Mock AI image analysis results
        const imageSuggestions = [
          `${userInput || 'Item'} - As Shown in Photo`,
          `${userInput || 'Item'} - Excellent Condition`,
          `${userInput || 'Item'} - Perfect for You`
        ];
        setSuggestions(prev => [...imageSuggestions, ...prev.slice(0, 3)]);
        setIsLoading(false);
        
        if (onImageUpload) {
          onImageUpload(file);
        }
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect(suggestion);
  };

  return (
    <div className="space-y-4">
      {/* Image Upload for AI Analysis */}
      {showImageUpload && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2 mb-3">
            <Camera className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900 dark:text-blue-100">
              AI Image Analysis
            </span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            Upload a photo and AI will suggest the best title and description
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
          />
          {uploadedImage && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span>Image uploaded for AI analysis</span>
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900 dark:text-green-100">
              AI Suggestions
            </span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          
          {isLoading ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <span>AI is analyzing your input...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300">
                      {suggestion}
                    </span>
                    <Check className="w-4 h-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Tips */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start space-x-2">
          <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">AI Tips for Better Ads:</p>
            <ul className="space-y-1 text-xs">
              <li>• Include brand names and model numbers</li>
              <li>• Mention condition and any defects</li>
              <li>• Add location for local buyers</li>
              <li>• Use clear, descriptive language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions; 