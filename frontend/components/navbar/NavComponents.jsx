'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import useAppStore from '@/stores/useAppStore';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/DropdownMenu';

export const NavLink = ({ href, children, isMobile = false, ...props }) => {
  const baseClasses = 'rounded px-3 py-2 transition-colors';
  const mobileClasses =
    'block text-base font-medium text-gray-700 dark:text-gray-200 hover:accent-bg hover:text-white';
  const desktopClasses =
    'text-sm text-gray-600 dark:text-gray-300 hover:accent-text';

  return (
    <Link
      href={href}
      className={cn(baseClasses, isMobile ? mobileClasses : desktopClasses)}
      {...props}
    >
      {children}
    </Link>
  );
};

const getInitials = (name) => {
  if (typeof name !== 'string' || !name) return '?';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const ProfileMenu = () => {
  const { user, logout } = useAppStore();

  if (!user) return <NavLink href="/login">Sign In</NavLink>;

  const initials = getInitials(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-2 outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium md:inline">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown size={16} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        {user.role === 'seller' && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/my-listings">My Listings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/add-product">Add Product</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={logout} className="text-red-500">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
