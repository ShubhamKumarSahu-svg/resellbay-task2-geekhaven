'use client';

import { LogIn, Menu, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import useAppStore from '@/stores/useAppStore';
import useCartStore from '@/stores/useCartStore';

import { ThemeToggle } from '../ui/custom/ThemeToggle';
import { NavLink, ProfileMenu } from './NavComponents';

const Navbar = () => {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const cartSummary = useCartStore((state) => state.summary);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const handleNavClick = () => setIsMobileMenuOpen(false);

  const navLinks = [{ href: '/products', label: 'All Products' }];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm dark:bg-gray-800">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center space-x-2"
          aria-label="ResellBay Home"
        >
          <svg
            className="h-6 w-6 accent-text"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            ResellBay
          </span>
        </Link>

        <div className="hidden items-center space-x-2 text-sm md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <>
              <ProfileMenu />

              <Link
                href="/cart"
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartSummary?.totalItems > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {cartSummary.totalItems}
                  </span>
                )}
              </Link>
              <ThemeToggle />
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1 rounded px-3 py-2 text-sm accent-bg text-white hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen((p) => !p)}
            className="p-2 text-gray-600 dark:text-gray-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <MobileMenu
          navLinks={navLinks}
          user={user}
          cartItems={cartSummary?.totalItems || 0}
          onLinkClick={handleNavClick}
          onLogout={logout}
        />
      )}
    </header>
  );
};

const MobileMenu = ({ navLinks, user, cartItems, onLinkClick, onLogout }) => {
  const handleLogout = () => {
    onLogout();
    onLinkClick();
  };

  return (
    <div className="border-t border-gray-200 px-2 pt-2 pb-3 space-y-1 dark:border-gray-700 md:hidden">
      {navLinks.map(({ href, label }) => (
        <NavLink key={href} href={href} isMobile onClick={onLinkClick}>
          {label}
        </NavLink>
      ))}

      {user ? (
        <>
          {user.role === 'seller' && (
            <>
              <NavLink href="/my-listings" isMobile onClick={onLinkClick}>
                My Listings
              </NavLink>
              <NavLink href="/add-product" isMobile onClick={onLinkClick}>
                Add Product
              </NavLink>
            </>
          )}
          <NavLink href="/profile" isMobile onClick={onLinkClick}>
            My Profile
          </NavLink>
          <NavLink href="/cart" isMobile onClick={onLinkClick}>
            My Cart ({cartItems})
          </NavLink>
          <button
            onClick={handleLogout}
            className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-500 hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </>
      ) : (
        <NavLink href="/login" isMobile onClick={onLinkClick}>
          Login / Register
        </NavLink>
      )}
    </div>
  );
};

export default Navbar;
