'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';
import { SHIPPING_FEE, FULL_ADVANCE_THRESHOLD } from '@/lib/constants';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const subtotal = getTotalPrice();
  const shippingFee = items.length === 0 ? 0 : SHIPPING_FEE;
  const totalPrice = subtotal + shippingFee;
  
  const requiresFullAdvance = totalPrice < FULL_ADVANCE_THRESHOLD;
  const advancePercentage = requiresFullAdvance ? 1 : 0.5;
  const advanceAmount = totalPrice * advancePercentage;
  const remainingAmount = totalPrice - advanceAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-sand/20 pt-32 pb-24">
        <div className="container-custom text-center px-4">
          <h1 className="text-3xl md:text-4xl font-serif mb-6">Your Cart</h1>
          <p className="text-charcoal mb-8">Your cart is empty</p>
          <Link href="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24">
      <div className="container-custom px-4 sm:px-6">
        <h1 className="text-3xl md:text-4xl text-gold font-serif text-center mb-8 md:mb-12">Your Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="flex-1 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={`${item.productId}-${item.selectedSize || 'nosize'}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 bg-sand/30 rounded-lg"
              >
                <img
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg mx-auto sm:mx-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-serif text-base md:text-lg mb-1">{item.name}</h3>
                  {item.selectedSize && (
                    <p className="text-xs text-gold mb-1">Size: {item.selectedSize}</p>
                  )}
                  <p className="text-gold font-medium mb-2">PKR {item.price}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <div className="flex border border-sand/30 rounded">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedSize)}
                        className="px-3 py-1 hover:bg-sand/10"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedSize)}
                        className="px-3 py-1 hover:bg-sand/10"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeItem(item.productId, item.selectedSize);
                        toast.success('Item removed');
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <p className="font-medium text-gold">PKR {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-sand/30 p-4 sm:p-6 rounded-lg sticky top-32">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal">Subtotal</span>
                  <span className="text-dark font-medium">PKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal">Shipping</span>
                  <span className="text-dark font-medium">PKR {shippingFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-sand/50 pt-3 mt-3">
                  <div className="flex justify-between text-sm text-charcoal mb-2">
                    <span>Advance ({requiresFullAdvance ? '100%' : '50%'})</span>
                    <span className="text-gold font-medium">PKR {advanceAmount.toFixed(2)}</span>
                  </div>
                  {!requiresFullAdvance && (
                    <div className="flex justify-between text-sm text-charcoal">
                      <span>Remaining (on delivery)</span>
                      <span className="text-dark">PKR {remainingAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-sand/50 pt-3">
                  <div className="flex justify-between">
                    <span className="font-serif text-base">Total</span>
                    <span className="font-serif text-xl text-gold">PKR {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center block py-3">
                Proceed to Checkout
              </Link>
              
              <p className="text-xs text-charcoal text-center mt-4">
                {requiresFullAdvance 
                  ? `100% advance required for orders under PKR ${FULL_ADVANCE_THRESHOLD}` 
                  : `50% advance online, 50% on delivery`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}