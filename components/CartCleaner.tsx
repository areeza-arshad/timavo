'use client';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function CartCleaner() {
  const { clearCart } = useCartStore();

  useEffect(() => {
    const checkAndClearGuestCart = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          console.log('Guest user - cart preserved');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAndClearGuestCart();
  }, [clearCart]);

  return null;
}