'use client';

import useAppStore from '@/stores/useAppStore';
import useChatStore from '@/stores/useChatStore';
import Link from 'next/link';

const Footer = () => {
  const user = useAppStore((state) => state.user);
  const unreadCount = useChatStore((state) => state.unreadCount);

  const navLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/sellers', label: 'Browse Sellers' },
    { href: '/order-history', label: 'Order History' },
    user && { href: '/messages', label: 'Messages', badge: unreadCount > 0 },
  ].filter(Boolean);

  return (
    <footer className="mt-12 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="container mx-auto py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
        <nav className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:gap-x-6 sm:text-sm">
          {navLinks.map(({ href, label, badge }) => (
            <Link
              key={href}
              href={href}
              className="relative transition-colors hover:accent-text"
            >
              {label}
              {badge && (
                <span className="absolute -top-1 -right-2 h-2.5 w-2.5 rounded-full bg-red-500" />
              )}
            </Link>
          ))}
        </nav>
        <p>
          &copy; {new Date().getFullYear()} ResellBay Marketplace. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
