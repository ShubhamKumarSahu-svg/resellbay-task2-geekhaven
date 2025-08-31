'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Heart, User } from 'lucide-react'; // -> 1. Import the Heart icon
import Image from 'next/image';

const NavButton = ({ isActive, onClick, icon: Icon, label }) => (
  <Button
    variant={isActive ? 'default' : 'ghost'}
    onClick={onClick}
    className="w-full justify-start gap-3"
  >
    <Icon size={20} />
    <span className="hidden sm:inline">{label}</span>
  </Button>
);

export const ProfileSidebar = ({ user, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'details', label: 'Profile Details', icon: User },
    { id: 'liked', label: 'Liked Items', icon: Heart },
  ];

  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <Card>
        <CardContent className="p-4 text-center">
          <Image
            src={user.profileImage || `https://i.pravatar.cc/150?u=${user._id}`}
            alt={`${user.name}'s profile`}
            width={96}
            height={96}
            sizes="96px"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-border"
          />
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground break-words">
            {user.email}
          </p>
        </CardContent>
      </Card>

      <nav className="mt-6 space-y-2">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
            icon={item.icon}
            label={item.label}
          />
        ))}
      </nav>
    </aside>
  );
};
