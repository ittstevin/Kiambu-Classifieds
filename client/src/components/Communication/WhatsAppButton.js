import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const WhatsAppButton = ({ 
  phoneNumber, 
  adTitle, 
  sellerName, 
  price, 
  location,
  variant = 'primary' // primary, secondary, floating
}) => {
  const [copied, setCopied] = useState(false);

  // Format phone number for WhatsApp
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  // Generate WhatsApp message templates
  const getMessageTemplates = () => {
    const templates = [
      {
        id: 'inquiry',
        title: 'General Inquiry',
        message: `Hi ${sellerName || 'there'}! I'm interested in your ad "${adTitle}" for KES ${price?.toLocaleString() || 'negotiable'}. Is it still available?`
      },
      {
        id: 'negotiate',
        title: 'Price Negotiation',
        message: `Hi ${sellerName || 'there'}! I saw your "${adTitle}" for KES ${price?.toLocaleString() || 'negotiable'}. What's your best price?`
      },
      {
        id: 'location',
        title: 'Location & Meeting',
        message: `Hi ${sellerName || 'there'}! I'm interested in your "${adTitle}". Where can we meet to see it? I'm in ${location || 'Kiambu County'}.`
      },
      {
        id: 'details',
        title: 'More Details',
        message: `Hi ${sellerName || 'there'}! I'd like to know more about your "${adTitle}". Can you share more details and photos?`
      },
      {
        id: 'custom',
        title: 'Custom Message',
        message: `Hi ${sellerName || 'there'}! I'm interested in your "${adTitle}". `
      }
    ];
    
    return templates;
  };

  const [selectedTemplate, setSelectedTemplate] = useState('inquiry');
  const [customMessage, setCustomMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = getMessageTemplates();
  const currentTemplate = templates.find(t => t.id === selectedTemplate);
  
  const getMessage = () => {
    if (selectedTemplate === 'custom') {
      return customMessage || currentTemplate.message;
    }
    return currentTemplate.message;
  };

  const openWhatsApp = (message) => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      toast.error('Phone number not available');
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp opens (analytics)
    if (window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        'event_category': 'engagement',
        'event_label': adTitle,
        'value': 1
      });
    }
  };

  const copyPhoneNumber = () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      toast.error('Phone number not available');
      return;
    }

    navigator.clipboard.writeText(formattedPhone).then(() => {
      setCopied(true);
      toast.success('Phone number copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleQuickMessage = () => {
    openWhatsApp(getMessage());
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    if (templateId === 'custom') {
      setCustomMessage(currentTemplate.message);
    }
  };

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-20 right-6 z-40">
        <div className="relative">
          {/* Main WhatsApp Button */}
          <button
            onClick={handleQuickMessage}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transform hover:scale-105 transition-all duration-200"
            style={{ 
              boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
              animation: 'pulse 2s infinite'
            }}
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Template Selector */}
          {showTemplates && (
            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900 dark:text-white">Message Templates</span>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-2">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`w-full text-left p-2 rounded text-sm transition-colors ${
                      selectedTemplate === template.id
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{template.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {template.message.substring(0, 50)}...
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate === 'custom' && (
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your custom message..."
                  className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              )}

              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleQuickMessage}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-medium"
                >
                  Send Message
                </button>
                <button
                  onClick={copyPhoneNumber}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Template Toggle Button */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="absolute -top-2 -left-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'secondary') {
    return (
      <div className="space-y-3">
        <button
          onClick={handleQuickMessage}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Message on WhatsApp</span>
        </button>

        <div className="flex space-x-2">
          <button
            onClick={copyPhoneNumber}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Number'}</span>
          </button>
          
          <button
            onClick={() => window.open(`tel:${formatPhoneNumber(phoneNumber)}`)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </button>
        </div>
      </div>
    );
  }

  // Primary variant (default)
  return (
    <div className="space-y-4">
      {/* Quick Message Button */}
      <button
        onClick={handleQuickMessage}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors shadow-lg"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Message Seller on WhatsApp</span>
      </button>

      {/* Message Templates */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Messages</h4>
        <div className="space-y-2">
          {templates.slice(0, 3).map(template => (
            <button
              key={template.id}
              onClick={() => openWhatsApp(template.message)}
              className="w-full text-left p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all"
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {template.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {template.message}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Options */}
      <div className="flex space-x-2">
        <button
          onClick={copyPhoneNumber}
          className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied!' : 'Copy Number'}</span>
        </button>
        
        <button
          onClick={() => window.open(`tel:${formatPhoneNumber(phoneNumber)}`)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span>Call</span>
        </button>
      </div>
    </div>
  );
};

export default WhatsAppButton; 