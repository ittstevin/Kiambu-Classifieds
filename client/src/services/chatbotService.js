// Chatbot Service - Ready for AI/LLM Integration
class ChatbotService {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {};
  }

  // Add message to conversation history
  addToHistory(message, isUser = true) {
    this.conversationHistory.push({
      role: isUser ? 'user' : 'assistant',
      content: message,
      timestamp: new Date()
    });

    // Keep only last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  // Set user context (current page, ad details, etc.)
  setContext(context) {
    this.userContext = { ...this.userContext, ...context };
  }

  // Get smart response based on question and context
  async getResponse(question, context = {}) {
    this.setContext(context);
    this.addToHistory(question, true);

    // For now, use FAQ-based responses
    // In the future, this can be replaced with AI/LLM calls
    const response = this.getFAQResponse(question);
    
    this.addToHistory(response, false);
    return response;
  }

  // FAQ-based response system (can be replaced with AI)
  getFAQResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Context-aware responses based on current page
    if (this.userContext.currentPage === 'ad-detail') {
      if (lowerQuestion.includes('available') || lowerQuestion.includes('sold')) {
        return 'To check if this item is still available, look for the "Sold" status on the ad. If not marked as sold, it\'s likely still available. You can also message the seller directly to confirm.';
      }
      if (lowerQuestion.includes('contact') || lowerQuestion.includes('seller')) {
        return 'You can contact the seller using the phone, email, or WhatsApp buttons on this page. You can also use the in-app messaging system for secure communication.';
      }
      if (lowerQuestion.includes('price') || lowerQuestion.includes('negotiate')) {
        return 'Look for the "Price negotiable" indicator on this ad. If present, the seller is open to negotiation. You can also ask the seller directly through messaging.';
      }
    }

    if (this.userContext.currentPage === 'search') {
      if (lowerQuestion.includes('filter') || lowerQuestion.includes('search')) {
        return 'Use the filters on the left to narrow down your search by price, location, condition, and more. You can also use the search bar for specific keywords.';
      }
    }

    // General FAQ responses
    const faqResponses = {
      'hello': 'Hello! 👋 How can I help you today? You can ask me about buying, selling, safety tips, or any other questions about Kiambu Classifieds.',
      'hi': 'Hi there! 👋 I\'m here to help with anything about Kiambu Classifieds. What would you like to know?',
      'thank': 'You\'re welcome! 😊 Is there anything else I can help you with?',
      'bye': 'Goodbye! 👋 Feel free to come back if you have more questions. Have a great day!',
      'help': 'I can help you with:\n\n• How to contact sellers\n• Safety tips for buying/selling\n• How to post ads\n• Payment methods\n• Account settings\n• Technical support\n\nWhat would you like to know?',
      'safety': 'Here are some safety tips:\n\n• Meet in public places (malls, banks)\n• Verify items before payment\n• Use our secure messaging system\n• Trust your instincts\n• Report suspicious activity\n\nWould you like more specific safety advice?',
      'payment': 'Common payment methods include:\n\n• Cash (meet in public)\n• Mobile money (M-Pesa, Airtel Money)\n• Bank transfer\n• Digital payments\n\nAlways agree on payment method before meeting.',
      'contact': 'You can contact sellers through:\n\n• Phone calls\n• WhatsApp\n• Email\n• In-app messaging\n\nThe contact buttons are on each ad detail page.',
      'post': 'To post an ad:\n\n1. Click "Post Ad" in navigation\n2. Fill in details\n3. Upload images\n4. Submit\n\nYou can save drafts and edit later. The process takes about 5 minutes.',
      'cost': 'Posting ads is currently FREE! We may introduce premium features later, but basic posting will remain free for our community.',
      'report': 'To report issues:\n\n• Click "Report" on ad pages\n• Email support@kiambuclassifieds.com\n• Include details for faster resolution\n\nWe take all reports seriously.',
      'verify': 'To verify sellers:\n\n• Check verification badges\n• Read reviews and ratings\n• Ask for additional photos\n• Meet in public places\n• Trusted sellers have good ratings'
    };

    // Check for keyword matches
    for (const [keyword, response] of Object.entries(faqResponses)) {
      if (lowerQuestion.includes(keyword)) {
        return response;
      }
    }

    // Default response with suggestions
    return "I'm not sure about that specific question. Here are some things I can help with:\n\n• How to contact sellers\n• Safety tips for buying/selling\n• How to post ads\n• Payment methods\n• Account settings\n• Technical support\n\nTry asking one of these or contact support@kiambuclassifieds.com for specific help.";
  }

  // Future: AI/LLM Integration
  async getAIResponse(question, context = {}) {
    // This method can be implemented with OpenAI, Claude, or other LLMs
    try {
      // Example OpenAI integration (uncomment when ready)
      /*
      const response = await fetch('/api/chatbot/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          context,
          conversationHistory: this.conversationHistory
        })
      });
      
      const data = await response.json();
      return data.response;
      */
      
      // For now, fall back to FAQ responses
      return this.getFAQResponse(question);
    } catch (error) {
      console.error('AI response error:', error);
      return this.getFAQResponse(question);
    }
  }

  // Get conversation analytics
  getAnalytics() {
    return {
      totalMessages: this.conversationHistory.length,
      userMessages: this.conversationHistory.filter(msg => msg.role === 'user').length,
      assistantMessages: this.conversationHistory.filter(msg => msg.role === 'assistant').length,
      averageResponseTime: this.calculateAverageResponseTime(),
      commonQuestions: this.getCommonQuestions()
    };
  }

  calculateAverageResponseTime() {
    // Calculate average time between user message and bot response
    const responseTimes = [];
    for (let i = 0; i < this.conversationHistory.length - 1; i++) {
      if (this.conversationHistory[i].role === 'user' && 
          this.conversationHistory[i + 1].role === 'assistant') {
        const timeDiff = this.conversationHistory[i + 1].timestamp - this.conversationHistory[i].timestamp;
        responseTimes.push(timeDiff);
      }
    }
    
    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  }

  getCommonQuestions() {
    const questions = this.conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content.toLowerCase());
    
    const questionCount = {};
    questions.forEach(q => {
      questionCount[q] = (questionCount[q] || 0) + 1;
    });
    
    return Object.entries(questionCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([question, count]) => ({ question, count }));
  }

  // Clear conversation history
  clearHistory() {
    this.conversationHistory = [];
  }

  // Export conversation for support
  exportConversation() {
    return {
      history: this.conversationHistory,
      context: this.userContext,
      analytics: this.getAnalytics(),
      timestamp: new Date()
    };
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

export default chatbotService; 