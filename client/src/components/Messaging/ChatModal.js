import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Send, X, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { io } from 'socket.io-client';

const ChatModal = ({ isOpen, onClose, ad, seller }) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);

  // Get conversation messages
  const { data: conversationData, isLoading } = useQuery(
    ['messages', seller._id],
    async () => {
      const response = await axios.get(`/api/messages/${seller._id}`);
      return response.data;
    },
    {
      enabled: isOpen && !!seller._id,
      onSuccess: (data) => {
        setMessages(data.messages || []);
      }
    }
  );

  // Send message mutation
  const sendMessageMutation = useMutation(
    async (messageData) => {
      const response = await axios.post('/api/messages', messageData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setMessages(prev => [...prev, data.data]);
        queryClient.invalidateQueries(['messages', seller._id]);
      }
    }
  );

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && token) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        newSocket.emit('user_online');
      });

      newSocket.on('new_message', (data) => {
        if (data.sender._id === seller._id) {
          setMessages(prev => [...prev, data.message]);
        }
      });

      newSocket.on('user_typing', (data) => {
        if (data.userId === seller._id) {
          setIsTyping(true);
        }
      });

      newSocket.on('user_stop_typing', (data) => {
        if (data.userId === seller._id) {
          setIsTyping(false);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, token, seller._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (socket) {
      socket.emit('typing_start', { receiverId: seller._id });
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const timeout = setTimeout(() => {
        socket.emit('typing_stop', { receiverId: seller._id });
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    const messageData = {
      receiverId: seller._id,
      adId: ad._id,
      content: message.trim()
    };

    try {
      await sendMessageMutation.mutateAsync(messageData);
      setMessage('');
      
      // Stop typing indicator
      if (socket) {
        socket.emit('typing_stop', { receiverId: seller._id });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {seller.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{seller.name}</h3>
              <p className="text-sm text-gray-500">{ad.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation about this ad!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender._id === user._id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender._id === user._id ? 'text-primary-200' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg">
                <p className="text-sm italic">{seller.name} is typing...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-2 mb-3">
            {seller.phone && (
              <button
                onClick={() => window.open(`tel:${seller.phone}`)}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                <Phone size={14} />
                <span>Call</span>
              </button>
            )}
            {seller.email && (
              <button
                onClick={() => window.open(`mailto:${seller.email}`)}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                <Mail size={14} />
                <span>Email</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={sendMessageMutation.isLoading}
            />
            <button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal; 