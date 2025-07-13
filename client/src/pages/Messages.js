import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { MessageCircle, Phone, Mail, Clock, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ChatModal from '../components/Messaging/ChatModal';

const Messages = () => {
  const { isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const { data: conversations, isLoading } = useQuery(
    'conversations',
    async () => {
      const response = await axios.get('/api/messages/conversations');
      return response.data;
    },
    {
      enabled: isAuthenticated,
      refetchInterval: 5000 // Refetch every 5 seconds for real-time updates
    }
  );

  const formatTimeAgo = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setShowChatModal(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view messages</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your conversations.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Your conversations with sellers and buyers</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation)}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {conversation.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {conversation.user?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {conversation.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(conversation.lastMessage.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-400">
                          Re: {conversation.ad?.title || 'Ad'}
                        </span>
                        {conversation.ad?.images?.[0] && (
                          <img
                            src={conversation.ad.images[0]}
                            alt="Ad thumbnail"
                            className="w-6 h-6 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <MessageCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600 mb-6">
              Start a conversation by messaging a seller about their ad.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Browse Ads
            </button>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedConversation && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false);
            setSelectedConversation(null);
          }}
          ad={selectedConversation.ad}
          seller={selectedConversation.user}
        />
      )}
    </div>
  );
};

export default Messages; 