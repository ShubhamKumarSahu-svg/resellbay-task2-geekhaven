const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { AppError } = require('../utils/AppError');

const socketAuthMiddleware = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new AppError('Authentication token is required.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Socket authentication error:', err.message);
    next(new AppError('Authentication failed.', 401));
  }
};

module.exports = (io) => {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    console.log(`Socket connected: User ${socket.userId}`);

    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined room: ${chatId}`);
    });

    socket.on('leave-chat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left room: ${chatId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { chatId, content } = data;
        const senderId = socket.userId;

        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(senderId)) {
          return socket.emit('error', {
            message: 'Cannot send message to this chat.',
          });
        }

        const message = await Message.create({
          chat: chatId,
          sender: senderId,
          content: content.trim(),
        });

        chat.lastMessage = message._id;
        await chat.save();

        await message.populate('sender', 'name profileImage');

        io.to(chatId).emit('new-message', message);
      } catch (error) {
        console.error('Socket send message error:', error);
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(
        `Socket disconnected: User ${socket.userId}, Reason: ${reason}`
      );
    });
  });
};
