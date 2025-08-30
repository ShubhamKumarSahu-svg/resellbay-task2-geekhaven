import { Inter } from 'next/font/google';
import './globals.css';

import ClientProviders from '@/components/ui/custom/ClientProviders';
import Footer from '@/components/navbar/Footer';
import Navbar from '@/components/navbar/Navbar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ToastProvider } from '@/providers/ToastProvider';

import { generateAccentColor } from '@/lib/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ResellBay - The Ultimate Reselling Marketplace',
  description: 'A feature-rich reselling platform built with Next.js.',
};

export default function RootLayout({ children }) {
  const accentColor = generateAccentColor(process.env.ASSIGNMENT_SEED);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground`}
        style={{ '--accent-color': accentColor }}
      >
        <ThemeProvider>
          <ToastProvider>
            <ClientProviders>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="container mx-auto flex-grow px-4 py-8 sm:px-6 lg:px-8">
                  {children}
                </main>
                <Footer />
              </div>
            </ClientProviders>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
