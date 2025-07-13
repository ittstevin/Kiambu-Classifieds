const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Join user to their personal room
    socket.join(socket.userId);

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, adId, content } = data;

        // Create message in database
        const message = new Message({
          sender: socket.userId,
          receiver: receiverId,
          ad: adId,
          content: content.trim()
        });

        await message.save();

        // Populate message with user and ad details
        await message.populate('sender', 'name avatar');
        await message.populate('receiver', 'name avatar');
        await message.populate('ad', 'title images');

        // Emit to receiver
        socket.to(receiverId).emit('new_message', {
          message,
          sender: socket.user
        });

        // Emit back to sender for confirmation
        socket.emit('message_sent', { message });

      } catch (error) {
        console.error('Socket send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      socket.to(data.receiverId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.receiverId).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Handle message read
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;
        
        const message = await Message.findById(messageId);
        if (message && message.receiver.toString() === socket.userId) {
          message.isRead = true;
          message.readAt = new Date();
          await message.save();

          // Notify sender that message was read
          socket.to(message.sender.toString()).emit('message_read', {
            messageId,
            readBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Socket mark read error:', error);
      }
    });

    // Handle user online status
    socket.on('user_online', () => {
      socket.broadcast.emit('user_status', {
        userId: socket.userId,
        status: 'online'
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
      socket.broadcast.emit('user_status', {
        userId: socket.userId,
        status: 'offline'
      });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO }; 