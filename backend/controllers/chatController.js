const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/auth');

exports.getChats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ participants: userId })
    .populate('participants', 'name profileImage email')
    .populate('product', 'title images price')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name profileImage' },
    })
    .sort({ updatedAt: -1 })
    .lean();

  const chatIds = chats.map((chat) => chat._id);
  const unreadCounts = await Message.aggregate([
    {
      $match: {
        chat: { $in: chatIds },
        sender: { $ne: userId },
        'readBy.user': { $ne: userId },
      },
    },
    {
      $group: {
        _id: '$chat',
        count: { $sum: 1 },
      },
    },
  ]);

  const unreadMap = unreadCounts.reduce((acc, item) => {
    acc[item._id.toString()] = item.count;
    return acc;
  }, {});

  const chatsWithCounts = chats.map((chat) => ({
    ...chat,
    unreadCount: unreadMap[chat._id.toString()] || 0,
  }));

  res.status(200).json({
    success: true,
    chats: chatsWithCounts,
  });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userChats = await Chat.find({ participants: userId })
    .select('_id')
    .lean();
  const chatIds = userChats.map((chat) => chat._id);

  const unreadCount = await Message.countDocuments({
    chat: { $in: chatIds },
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
  });

  res.status(200).json({
    success: true,
    count: unreadCount,
  });
});

exports.createOrGetChat = async (req, res) => {
  try {
    const { participantId } = req.body; // Remove productId
    const userId = req.user._id;

    // Check if chat already exists between these users
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
      // Remove product filter since we don't need it anymore
    }).populate('participants', 'name profileImage');

    if (!chat) {
      // Create new chat without product
      chat = new Chat({
        participants: [userId, participantId],
        // Remove product field
      });
      await chat.save();

      // Populate the participants after save
      chat = await Chat.findById(chat._id).populate(
        'participants',
        'name profileImage'
      );
    }

    res.status(200).json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatMessages = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;
  const userId = req.user._id;
  const { page = 1, limit = 50 } = req.query;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  if (!chat.participants.includes(userId)) {
    throw new AppError('You are not authorized to view this chat', 403);
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const messages = await Message.find({ chat: chatId })
    .populate('sender', 'name profileImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  messages.reverse();

  res.status(200).json({
    success: true,
    messages,
    hasMore: messages.length === limitNum,
  });
});

exports.markMessagesAsRead = asyncHandler(async (req, res) => {
  const { id: chatId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.includes(userId)) {
    throw new AppError('Chat not found or you are not a participant', 404);
  }

  const { modifiedCount } = await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId },
      'readBy.user': { $ne: userId },
    },
    {
      $addToSet: {
        readBy: { user: userId, readAt: new Date() },
      },
    }
  );

  res.status(200).json({
    success: true,
    message: `${modifiedCount} messages marked as read`,
  });
});
