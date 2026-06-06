'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useSkinToneStore } from '@/store/skinToneStore';
import SkinToneSelector from './SkinToneSelector';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState(false);
  
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { tone, setSkinTone } = useSkinToneStore();
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.includes('/admin');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    fetchUser();
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

const fetchUser = async () => {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      
      if (data.user?.email) {
        try {
          const affiliateRes = await fetch(`/api/affiliates/check?email=${data.user.email}`);
          if (affiliateRes.ok) {
            const affiliateData = await affiliateRes.json();
            setIsAffiliate(affiliateData.isAffiliate);
          } else {
            setIsAffiliate(false);
          }
        } catch (error) {
          console.error('Error checking affiliate:', error);
          setIsAffiliate(false);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error);
  }
}; 

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('cart-storage');
    useCartStore.getState().clearCart();
    setUser(null);
    toast.success('Logged out');
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };
  
  const handleMobileMenuToggle = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
    window.dispatchEvent(new CustomEvent('mobileMenuToggle', { detail: isOpen }));
  };

  if (isAdminPage) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 w-full z-30 transition-all duration-300 ${
          isScrolled ? 'bg-cream/95 backdrop-blur-md shadow-sm' : 'bg-cream'
        }`}
      >
        <div className="container-custom md:px-4 py-4 md:py-5">
          <div className="flex items-center justify-end md:justify-end">
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/shop" className="text-base z-40 text-gold font-medium tracking-wide hover:text-gold/60 transition font-sans">
                Shop
              </Link>
              
              <button
                onClick={() => setShowToneSelector(true)}
                className="text-base text-gold font-medium tracking-wide hover:text-gold/60 transition font-sans flex"
              >
                <svg className="w-6 h-6 hover:text-gold/60" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="4" width="16" height="16" rx="8" fill="#FDEBD0" stroke="#C6A43B" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" fill="#E8C5A0" stroke="#C6A43B" strokeWidth="1" />
                  <circle cx="12" cy="12" r="1.5" fill="#8B5A2B" stroke="#C6A43B" strokeWidth="0.8" />
                </svg>
                {tone ? ` ${tone.charAt(0).toUpperCase() + tone.slice(1).toLowerCase()}` : 'Find your match'}
              </button>
              
              {/* Auth Links */}
              {user ? (
                <div className="relative group">
                  <button className="text-base text-gold font-medium tracking-wide font-sans">
                    <svg className="w-6 h-6 text-gold hover:text-gold/60 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 rounded-lg py-2 text-sm hover:bg-cream">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/account" className="block px-4 py-2 rounded-lg text-sm hover:bg-cream">
                      My Account
                    </Link>
                    {isAffiliate && (
                      <Link href="/affiliate/dashboard" className="block px-4 py-2 text-sm hover:bg-cream">
                        Affiliate Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full rounded-lg text-left px-4 py-2 text-sm hover:bg-cream">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <button className="text-base text-gold font-medium tracking-wide transition font-sans">
                    <svg className="w-6 h-6 text-gold hover:text-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link href="/login" className="block px-4 py-2 rounded-lg text-sm hover:bg-cream">
                      Sign In
                    </Link>
                    <Link href="/signup" className="block px-4 py-2 rounded-lg text-sm hover:bg-cream">
                      Create Account
                    </Link>
                  </div>
                </div>
              )}

              {/* Search Icon */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gold hover:text-gold/60 transition font-sans"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              <Link href="/cart" className="relative text-gold hover:text-gold/60 transition font-sans">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
                </svg>
                {isClient && totalItems > 0 && (
                  <span 
                    suppressHydrationWarning 
                    className="absolute -top-2 -right-3 bg-sand text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Link href="/cart" className="relative text-gold hover:text-gold/60 transition font-sans md:hidden">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
              </svg>
              {isClient && totalItems > 0 && (
                <span 
                  suppressHydrationWarning 
                  className="absolute -top-1 -right-0 bg-sand text-white text-[8px] rounded-full w-3 h-3 flex items-center justify-center"
                >
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => handleMobileMenuToggle(!isMobileMenuOpen)} className="md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Expandable Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:outline-none focus:border-gold text-sm bg-white"
                    autoFocus
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gold">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </motion.nav>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[200] bg-rose pt-8 md:hidden"
          >
            <div className="flex justify-end px-6 mb-4">
              <button onClick={() => handleMobileMenuToggle(false)} className="p-2">
                <svg className="w-6 h-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center space-y-6 mb-auto">
              <div className="w-full px-6 mb-8">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gold/30 rounded-full focus:outline-none focus:border-gold text-sm bg-white"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </form>
              </div>
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-sans tracking-wide text-gold transition">
                Shop
              </Link>
              
              <button onClick={() => { setShowToneSelector(true); setIsMobileMenuOpen(false); }} className="text-lg font-sans tracking-wide text-gold transition">
                {tone ? ` ${tone.toUpperCase()}` : 'Find your match'}
              </button>
              
              <Link href="/affiliate" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-sans tracking-wide text-gold transition">
                Earn Commission
              </Link>

              {/* Admin Panel Link - Only for admin users */}
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-sans tracking-wide text-gold transition">
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-dark py-4 px-6">
              <div className="flex justify-around items-center">
                {/* Account / User Icon */}
                {user ? (
                  <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center group-hover:bg-gold/30 transition">
                      <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gold group-hover:text-gold transition">Account</span>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center group-hover:bg-gold/30 transition">
                      <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span className="text-xs text-gold group-hover:text-gold transition">Sign In</span>
                  </Link>
                )}

                {/* Cart Icon */}
                <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1 group relative">
                  <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center group-hover:bg-gold/30 transition">
                    <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
                    </svg>
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-plaster text-dark text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gold group-hover:text-gold transition">Cart</span>
                </Link>

                {/* Admin Icon (for mobile bottom bar) */}
                {user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center group-hover:bg-gold/30 transition">
                      <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gold group-hover:text-gold transition">Admin</span>
                  </Link>
                )}

                {isAffiliate && (
                  <Link href="/affiliate/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center group-hover:bg-gold/30 transition">
                     <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span className="text-xs text-gold group-hover:text-gold transition">Affiliate</span>
                  </Link>
                )}
                {user && (
                  <button onClick={handleLogout} className="flex flex-col items-center gap-1 group">
                    <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center group-hover:bg-red-500/30 transition">
                      <svg className="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span className="text-xs text-gold group-hover:text-red-400 transition">Logout</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SkinToneSelector isOpen={showToneSelector} onClose={() => setShowToneSelector(false)} />
    </>
  );
}
