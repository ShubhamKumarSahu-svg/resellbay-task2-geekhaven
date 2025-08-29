import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import api from '../lib/api';
import { handleApiCall } from '../lib/apiHelper';
import { STATUS } from '../lib/constants';
import socket from '../lib/socket';
import useAppStore from './useAppStore';

const useChatStore = create(
  immer((set, get) => ({
    chats: [],
    activeChat: null,
    messages: [],
    chatsStatus: STATUS.IDLE,
    messagesStatus: STATUS.IDLE,
    unreadCount: 0,
    error: null,
    _messageHandler: null,

    fetchUnreadCount: async () => {
      try {
        const response = await api.get('/chat/unread-count');
        set({ unreadCount: response.data.count });
      } catch (error) {
        console.warn('Failed to fetch unread count:', error);
      }
    },

    fetchChats: async () => {
      console.log('Fetching chats...');
      set((state) => {
        state.chatsStatus = STATUS.LOADING;
        state.error = null;
      });

      const result = await handleApiCall(api.get('/chat'));

      if (result.success) {
        console.log(
          'Chats fetched successfully:',
          result.data.chats?.length || 0
        );
        set((state) => {
          state.chats = result.data.chats || [];
          state.chatsStatus = STATUS.SUCCESS;
        });
      } else {
        console.error('Failed to fetch chats:', result.error);
        set((state) => {
          state.chatsStatus = STATUS.ERROR;
          state.error = result.error;
        });
      }
      return result;
    },

    createOrGetChat: async (participantId) => {
      const result = await handleApiCall(api.post('/chat/', { participantId }));

      if (result.success && result.data?.chat) {
        const newChat = result.data.chat;
        set((state) => {
          const existingIndex = state.chats.findIndex(
            (c) => c._id === newChat._id
          );
          if (existingIndex >= 0) {
            state.chats[existingIndex] = newChat;
          } else {
            state.chats.unshift(newChat);
          }
        });
        return newChat;
      }
      return null;
    },

    selectChat: async (chatOrChatId) => {
      const chatId =
        typeof chatOrChatId === 'object' && chatOrChatId !== null
          ? chatOrChatId._id
          : chatOrChatId;

      if (!chatId) {
        console.error(
          'selectChat called with an invalid argument:',
          chatOrChatId
        );
        return;
      }

      const { activeChat: currentActiveChat } = get();

      if (currentActiveChat?._id && currentActiveChat._id !== chatId) {
        socket.emit('leave-chat', currentActiveChat._id);
      }

      if (currentActiveChat?._id === chatId) {
        return;
      }

      set((state) => {
        state.activeChat = state.chats.find((c) => c._id === chatId) || null;
        state.messagesStatus = STATUS.LOADING;
        state.messages = [];
        state.error = null;
      });

      const result = await handleApiCall(api.get(`/chat/${chatId}/messages`));

      if (result.success) {
        set((state) => {
          state.messages = result.data.messages || [];
          state.messagesStatus = STATUS.SUCCESS;
        });

        socket.emit('join-chat', chatId);

        const activeChat = get().activeChat;
        if (activeChat?.unreadCount > 0) {
          try {
            await api.post(`/chat/${chatId}/read`);
            set((state) => {
              const chatInState = state.chats.find((c) => c._id === chatId);
              if (chatInState) {
                state.unreadCount = Math.max(
                  0,
                  state.unreadCount - chatInState.unreadCount
                );
                chatInState.unreadCount = 0;
              }
            });
          } catch (error) {
            console.warn('Failed to mark chat as read:', error);
          }
        }
      } else {
        set((state) => {
          state.messagesStatus = STATUS.ERROR;
          state.error = result.error;
        });
      }
      return result;
    },

    sendMessage: (content) => {
      const { activeChat } = get();
      const { user } = useAppStore.getState();
      if (!content.trim() || !activeChat || !user) return;

      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content,
        chat: activeChat._id,
        sender: user,
        createdAt: new Date().toISOString(),
        pending: true,
      };

      set((state) => {
        state.messages.push(tempMessage);
      });

      socket.emit('send-message', {
        chatId: activeChat._id,
        content: content.trim(),
      });
    },

    _handleNewMessage: (message) => {
      const currentUser = useAppStore.getState().user;
      if (!currentUser || !message || !message.chat || !message.sender) return;

      const isFromAnotherUser = message.sender._id !== currentUser._id;
      const { activeChat } = get();

      set((state) => {
        const chatIndex = state.chats.findIndex((c) => c._id === message.chat);

        if (chatIndex !== -1) {
          const chat = state.chats[chatIndex];
          chat.lastMessage = message;
          chat.updatedAt = message.createdAt || new Date().toISOString();

          if (isFromAnotherUser && activeChat?._id !== message.chat) {
            chat.unreadCount = (chat.unreadCount || 0) + 1;
            state.unreadCount++;
          }

          state.chats.splice(chatIndex, 1);
          state.chats.unshift(chat);
        }

        if (activeChat?._id === message.chat) {
          const pendingIndex = state.messages.findIndex(
            (m) => m.pending && m.content === message.content
          );
          if (pendingIndex > -1) {
            state.messages[pendingIndex] = message;
          } else {
            state.messages.push(message);
          }
        }
      });
    },

    connectSocket: () => {
      const { token } = useAppStore.getState();
      if (token && !socket.connected) {
        socket.connect();
        const handler = (message) => get()._handleNewMessage(message);
        set({ _messageHandler: handler });
        socket.on('new-message', handler);
      }
    },

    disconnectSocket: () => {
      const { _messageHandler } = get();
      if (_messageHandler) {
        socket.off('new-message', _messageHandler);
        set({ _messageHandler: null });
      }
      if (socket.connected) {
        socket.disconnect();
      }
    },

    clearActiveChat: () => {
      const { activeChat: currentActiveChat } = get();
      if (currentActiveChat?._id) {
        socket.emit('leave-chat', currentActiveChat._id);
      }
      set((state) => {
        state.activeChat = null;
        state.messages = [];
        state.messagesStatus = STATUS.IDLE;
      });
    },
  }))
);

export default useChatStore;
