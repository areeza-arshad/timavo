'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function SimpleAnimatedLogo() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false); 

  const isAdminPage = pathname?.startsWith('/admin');
  const isHomePage = pathname === '/';

  useEffect(() => {
    setMounted(true); 
    
    if (!isHomePage) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    
    const handleMenuState = (e: CustomEvent) => {
      setIsMobileMenuOpen(e.detail);
    };
    window.addEventListener('mobileMenuToggle', handleMenuState as EventListener);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mobileMenuToggle', handleMenuState as EventListener);
    };
  }, [isHomePage]);

  if (isAdminPage) {
    return null;
  }

  if (isMobileMenuOpen) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  // For non-homepage - Show logo
  if (!isHomePage) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 py-4 w-1/4">
        <div className="container-custom">
          <Link href="/" className="inline-block">
            <h1 className="font-cursive md:ml-6 text-2xl md:text-3xl text-gold tracking-wide">
              Timavo
            </h1>
          </Link>
        </div>
      </div>
    );
  }

  // Homepage - Animated logo
  return (
    <>
      {/* Large Center Logo */}
      <div 
        className={`fixed z-40 transition-all duration-700 ease-out pointer-events-none
          ${scrolled 
            ? 'opacity-0 scale-25 top-6 left-6 -translate-x-0 -translate-y-0' 
            : 'opacity-100 scale-100 top-[20%] md:top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2'
          }
        `}
      >
        <div className="text-center">
          <h1 className="font-cursive text-4xl md:text-8xl lg:text-8xl xl:text-9xl text-gold whitespace-nowrap">
            Timavo
          </h1>
          <div className="flex justify-center gap-2">
            <span className="w-8 sm:w-12 h-px bg-gold"></span>
            <span className="text-[8px] sm:text-xs tracking-[0.3em] text-cream font-light uppercase">
              Handcrafted Jewelry
            </span>
            <span className="w-8 sm:w-12 h-px bg-gold"></span>
          </div>
        </div>
      </div>

      {/* Small Navbar Logo */}
      <div 
        className={`fixed top-0 left-0 right-0 z-40 w-1/4 transition-all duration-500
          ${scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}
        `}
      >
        <div className="bg-transparent md:ml-6 w-1/4 py-4">
          <div className="container-custom">
            <Link href="/" className="inline-block">
              <h1 className="font-cursive text-2xl md:text-3xl text-gold tracking-wide">
                Timavo
              </h1>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}