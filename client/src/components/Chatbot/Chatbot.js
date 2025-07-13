import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, HelpCircle, Shield, Clock, MapPin, Phone, Mail, AlertTriangle, CheckCircle, Star, Download, BarChart3 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import chatbotService from '../../services/chatbotService';

const FAQS = [
  // General Questions
  {
    q: 'How do I contact the seller?',
    a: 'You can contact the seller via the phone, email, or WhatsApp buttons on the ad detail page. You can also use the in-app messaging system for secure communication.',
    keywords: ['contact', 'seller', 'phone', 'email', 'whatsapp', 'message']
  },
  {
    q: 'Is this item still available?',
    a: 'Most ads are updated in real-time. If the ad is visible and not marked as sold, it is likely still available. You can message the seller to confirm availability.',
    keywords: ['available', 'sold', 'still', 'item', 'product']
  },
  {
    q: 'How do I post an ad?',
    a: 'Click the "Post Ad" button in the navigation bar, fill in the details, upload images, and submit your ad. You can save drafts and edit later. The process takes about 5 minutes.',
    keywords: ['post', 'ad', 'create', 'upload', 'draft', 'submit']
  },
  {
    q: 'How do I reset my password?',
    a: 'Go to the login page and click on "Forgot Password". Enter your email address and follow the instructions sent to your email to reset your password securely.',
    keywords: ['password', 'reset', 'forgot', 'login', 'email']
  },
  {
    q: 'Is it safe to buy on Kiambu Classifieds?',
    a: 'We recommend meeting in public places, verifying items before payment, and using our secure messaging system. Always trust your instincts and report suspicious activity.',
    keywords: ['safe', 'security', 'scam', 'trust', 'meet', 'payment']
  },
  {
    q: 'How do I report a scam or suspicious ad?',
    a: 'Click the "Report" button on the ad detail page or contact support@kiambuclassifieds.com. Include details about the issue for faster resolution.',
    keywords: ['report', 'scam', 'suspicious', 'fake', 'fraud', 'complaint']
  },
  
  // Payment & Pricing
  {
    q: 'How much does it cost to post an ad?',
    a: 'Posting ads is currently free! We may introduce premium features in the future, but basic ad posting will remain free for our community.',
    keywords: ['cost', 'price', 'free', 'payment', 'fee', 'charge']
  },
  {
    q: 'Can I negotiate the price?',
    a: 'Yes! Many sellers are open to negotiation. Look for the "Price negotiable" indicator on ads, or simply ask the seller directly through messaging.',
    keywords: ['negotiate', 'price', 'discount', 'offer', 'bargain']
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Payment methods vary by seller. Common options include cash, mobile money (M-Pesa, Airtel Money), bank transfer, and digital payments. Always agree on payment method before meeting.',
    keywords: ['payment', 'mpesa', 'cash', 'bank', 'transfer', 'money']
  },
  
  // Location & Delivery
  {
    q: 'Where can I meet the seller?',
    a: 'We recommend meeting in public places like shopping malls, banks, or busy areas. Avoid meeting at home addresses for safety. Popular meeting spots in Kiambu include Thika Mall, Juja Mall, and Ruiru Town.',
    keywords: ['meet', 'location', 'where', 'address', 'public', 'safety']
  },
  {
    q: 'Do you offer delivery services?',
    a: 'Delivery depends on the seller. Some sellers offer delivery within Kiambu County, while others prefer pickup only. Check the ad details or ask the seller directly.',
    keywords: ['delivery', 'pickup', 'shipping', 'transport', 'location']
  },
  
  // Account & Profile
  {
    q: 'How do I edit my profile?',
    a: 'Go to your profile page by clicking your name in the navigation bar. You can update your personal information, contact details, and profile picture there.',
    keywords: ['profile', 'edit', 'update', 'account', 'settings']
  },
  {
    q: 'How do I delete my account?',
    a: 'Contact support@kiambuclassifieds.com to request account deletion. We\'ll help you remove your account and data securely.',
    keywords: ['delete', 'account', 'remove', 'close', 'deactivate']
  },
  
  // Technical Support
  {
    q: 'The website is not loading properly',
    a: 'Try refreshing the page, clearing your browser cache, or using a different browser. If the problem persists, contact support@kiambuclassifieds.com with details.',
    keywords: ['loading', 'error', 'website', 'browser', 'technical', 'problem']
  },
  {
    q: 'I can\'t upload images to my ad',
    a: 'Make sure your images are under 5MB each and in JPG, PNG, or GIF format. Try reducing image size or using a different browser. Contact support if the issue continues.',
    keywords: ['upload', 'image', 'photo', 'file', 'size', 'format']
  },
  
  // Safety & Security
  {
    q: 'What should I do if I get scammed?',
    a: 'Immediately report the incident to support@kiambuclassifieds.com with all details. Also report to local authorities if money was involved. We take fraud seriously and will investigate.',
    keywords: ['scammed', 'fraud', 'stolen', 'fake', 'report', 'police']
  },
  {
    q: 'How do I verify a seller is legitimate?',
    a: 'Check their profile for verification badges, read reviews, ask for additional photos, and meet in public places. Trusted sellers usually have good ratings and detailed profiles.',
    keywords: ['verify', 'legitimate', 'real', 'trusted', 'reviews', 'rating']
  },
  
  // Features & Functionality
  {
    q: 'How do I save ads to view later?',
    a: 'Click the heart icon on any ad to save it to your favorites. You can view all saved ads in the "Saved Ads" section of your profile.',
    keywords: ['save', 'favorite', 'heart', 'bookmark', 'later']
  },
  {
    q: 'Can I search for specific items?',
    a: 'Yes! Use the search bar at the top of the page. You can search by keywords, category, location, or price range. Advanced filters help narrow down results.',
    keywords: ['search', 'find', 'look', 'specific', 'filter', 'category']
  },
  {
    q: 'How do I know if an ad is recent?',
    a: 'Each ad shows when it was posted. Look for the date stamp on the ad card. You can also sort ads by "Newest First" in the search results.',
    keywords: ['recent', 'new', 'date', 'posted', 'time', 'fresh']
  }
];

const Chatbot = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      from: 'bot', 
      text: 'Hi! 👋 I\'m your Kiambu Classifieds assistant. I can help you with buying, selling, safety tips, and more. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const messagesEndRef = useRef(null);

  // Set context based on current page
  useEffect(() => {
    const currentPage = location.pathname.includes('/ad/') ? 'ad-detail' :
                       location.pathname.includes('/search') ? 'search' :
                       location.pathname.includes('/category') ? 'category' :
                       location.pathname.includes('/post-ad') ? 'post-ad' : 'general';
    
    chatbotService.setContext({ currentPage });
  }, [location.pathname]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = (callback) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1000 + Math.random() * 1000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { 
      from: 'user', 
      text: input,
      timestamp: new Date()
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    
    simulateTyping(async () => {
      const answer = await chatbotService.getResponse(input);
      setMessages((msgs) => [...msgs, { 
        from: 'bot', 
        text: answer,
        timestamp: new Date()
      }]);
    });
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const exportConversation = () => {
    const conversation = chatbotService.exportConversation();
    const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-conversation-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAnalytics = () => {
    return chatbotService.getAnalytics();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-full p-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transform hover:scale-105 transition-all duration-200"
        onClick={() => setOpen(true)}
        aria-label="Open chatbot"
        style={{ 
          boxShadow: '0 8px 32px rgba(56,189,248,0.3)',
          animation: 'pulse 2s infinite'
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="w-full max-w-sm md:max-w-md bg-white dark:bg-gray-900 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-white font-semibold">Kiambu Assistant</span>
                  <div className="text-xs text-white/80">Online • Ready to help</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                  title="View Analytics"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={exportConversation}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                  title="Export Conversation"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setOpen(false)} 
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Analytics Panel */}
            {showAnalytics && (
              <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Conversation Analytics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">Total Messages</div>
                    <div className="font-semibold">{getAnalytics().totalMessages}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-2 rounded">
                    <div className="text-gray-500 dark:text-gray-400">Avg Response</div>
                    <div className="font-semibold">{Math.round(getAnalytics().averageResponseTime / 1000)}s</div>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto max-h-96 bg-gray-50 dark:bg-gray-900">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-4 py-2 text-sm max-w-[85%] shadow-sm ${
                    msg.from === 'user'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className={`text-xs mt-1 ${
                      msg.from === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              className="flex items-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-3"
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Type your question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="ml-2 p-2 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Actions */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Quick questions:</div>
              <div className="grid grid-cols-2 gap-2">
                {FAQS.slice(0, 6).map((faq, i) => (
                  <button
                    key={i}
                    className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-200 transition-all border border-gray-200 dark:border-gray-600"
                    onClick={() => {
                      setInput(faq.q);
                      setTimeout(handleSend, 100);
                    }}
                    disabled={isTyping}
                  >
                    {faq.q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Chatbot; 