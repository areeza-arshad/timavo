import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SimpleAnimatedLogo from '@/components/SimpleAnimatedLogo';
import { Toaster } from 'react-hot-toast';
import CartCleaner from '@/components/CartCleaner';

export const metadata: Metadata = {
  title: 'Timavo - Find handcrafted Jewelry',
  description: 'Discover timeless elegance with Timavo\'s handcrafted jewelry pieces',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cream">
        <SimpleAnimatedLogo />
        <Navbar />
        <main className="min-h-screen pt-0">{children}</main>
        <Footer />
        <Toaster position="top-center" />
        <CartCleaner/>
      </body>
    </html>
  );
}