'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { STATUS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const ChatListItem = ({ chat, user, onSelect, isActive }) => {
  const otherParticipant = chat?.participants?.find((p) => p._id !== user._id);

  if (!otherParticipant) {
    return null;
  }

  return (
    <li>
      <button
        onClick={() => onSelect(chat)}
        className={cn(
          'p-4 w-full flex items-center gap-4 text-left hover:bg-accent focus:outline-none focus:bg-accent transition-colors duration-150',
          isActive && 'bg-accent'
        )}
      >
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage asChild>
            <Image
              src={otherParticipant.profileImage || '/default-avatar.png'}
              alt={otherParticipant.name}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </AvatarImage>
          <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
          <p className="font-semibold truncate">{otherParticipant.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {chat.lastMessage?.content || 'No messages yet'}
          </p>
        </div>
        {chat.unreadCount > 0 && (
          <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
            {chat.unreadCount}
          </span>
        )}
      </button>
    </li>
  );
};

export const ChatList = ({
  user,
  chats,
  status,
  activeChatId,
  onSelectChat,
}) => {
  if (status === STATUS.LOADING && !chats.length) {
    return <LoadingSpinner className="mt-8" />;
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="p-4 font-bold text-lg border-b sticky top-0 bg-background z-10">
        Conversations
      </h2>
      {chats.length > 0 ? (
        <ul className="overflow-y-auto flex-1">
          {chats.map((chat) => (
            <ChatListItem
              key={chat._id}
              chat={chat}
              user={user}
              onSelect={onSelectChat}
              isActive={activeChatId === chat._id}
            />
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-sm text-muted-foreground mt-4">
          No conversations found.
        </div>
      )}
    </div>
  );
};
