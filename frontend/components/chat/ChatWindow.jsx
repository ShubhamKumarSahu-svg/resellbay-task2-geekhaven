'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { STATUS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const MessageBubble = ({ message, isOwnMessage, sender }) => {
  const senderName = sender?.name || 'User';

  return (
    <div
      className={cn(
        'flex gap-2 items-end',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage asChild>
            <Image
              src={sender?.profileImage || '/default-avatar.png'}
              alt={senderName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          </AvatarImage>
          <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] md:max-w-[60%] p-3 rounded-lg text-sm break-words',
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted rounded-bl-none'
        )}
      >
        <p>{message.content}</p>
      </div>
    </div>
  );
};

const MessageInput = ({ onSendMessage }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    onSendMessage(trimmedContent);
    setContent('');
  };

  return (
    <div className="p-4 border-t bg-background">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          autoComplete="off"
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send Message"
          disabled={!content.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export const ChatWindow = ({ user, chat, messages, status, onSendMessage }) => {
  const messagesEndRef = useRef(null);
  const otherParticipant = chat?.participants?.find((p) => p._id !== user._id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!chat || !otherParticipant) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <LoadingSpinner text="Loading chat..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center p-4 border-b sticky top-0 bg-background z-10">
        <h2 className="font-bold text-lg truncate">{otherParticipant.name}</h2>
      </header>

      <div className="flex-1 p-4 overflow-y-auto bg-muted/20">
        {status === STATUS.LOADING && !messages.length ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id || Math.random()}
                message={msg}
                isOwnMessage={msg.sender._id === user._id}
                sender={msg.sender}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
};
