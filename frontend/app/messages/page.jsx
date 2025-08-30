'use client';

import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useInitializeChat } from '@/hooks/useInitializeChat';
import useAppStore from '@/stores/useAppStore';
import useChatStore from '@/stores/useChatStore';
import { MessageSquare } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MessagesPage() {
  const { user } = useAppStore();
  const {
    chats,
    activeChat,
    messages,
    chatsStatus,
    messagesStatus,
    fetchChats,
    selectChat,
    sendMessage,
    connectSocket,
    disconnectSocket,
    createOrGetChat,
  } = useChatStore();

  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipientId = searchParams.get('chatWith');

  const handleSelectChat = (chat) => {
    router.replace('/messages');
    selectChat(chat);
  };

  useEffect(() => {
    if (user) {
      fetchChats();
      const handle = connectSocket();
      setIsSocketConnected(true);
      return () => {
        disconnectSocket(handle);
        setIsSocketConnected(false);
      };
    }
  }, [user, fetchChats, connectSocket, disconnectSocket]);

  const { isInitializing } = useInitializeChat({
    recipientId,
    chats,
    status: chatsStatus,
    activeChat,
    selectChat,
    createOrGetChat,
  });

  if (!user) {
    return <LoadingSpinner text="Please log in to view messages." />;
  }

  const showLoading = isInitializing || !isSocketConnected;

  return (
    <div className="flex h-[calc(100vh-10rem)] border rounded-lg bg-background">
      <aside className="w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto">
        <ChatList
          user={user}
          chats={chats}
          status={chatsStatus}
          activeChatId={activeChat?._id}
          onSelectChat={handleSelectChat}
        />
      </aside>

      <main className="hidden md:flex flex-1 flex-col">
        {showLoading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner text="Loading conversations..." />
          </div>
        ) : activeChat ? (
          <ChatWindow
            user={user}
            chat={activeChat}
            messages={messages}
            status={messagesStatus}
            onSendMessage={sendMessage}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
            <MessageSquare className="h-16 w-16" />
            <p className="mt-4 text-lg font-semibold">Select a Conversation</p>
            <p className="text-sm">
              Choose a chat from the list to start messaging.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
