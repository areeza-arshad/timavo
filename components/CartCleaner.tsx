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
          const storedCart = localStorage.getItem('cart-storage');
          if (storedCart) {
            try {
              const parsed = JSON.parse(storedCart);
              // If there are items but user is guest, it's probably stale data
              if (parsed.state?.items?.length > 0) {
                localStorage.removeItem('cart-storage');
                clearCart();
              }
            } catch (e) {
              console.error('Error parsing cart:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAndClearGuestCart();
  }, [clearCart]);

  return null;
}