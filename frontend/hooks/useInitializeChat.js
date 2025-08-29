import { STATUS } from '@/lib/constants';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const useInitializeChat = ({
  chats,
  status,
  activeChat,
  selectChat,
  createOrGetChat,
  fetchChats,
}) => {
  const searchParams = useSearchParams();
  const chatWithId = searchParams.get('chatWith');

  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    if (!chatWithId || status !== STATUS.SUCCESS) return;

    const initializeChat = async () => {
      setIsInitializing(true);

      try {
        const existingChat = chats.find((chat) =>
          chat.participants?.some((p) => p._id === chatWithId)
        );

        if (existingChat) {
          await selectChat(existingChat._id);
        } else {
          const newChat = await createOrGetChat(chatWithId);

          if (newChat) {
            await selectChat(newChat._id);
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [
    chats,
    status,
    activeChat,
    selectChat,
    createOrGetChat,
    chatWithId,
    fetchChats,
  ]);

  return { isInitializing };
};
