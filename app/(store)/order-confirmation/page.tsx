'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
    product?: {
      name: string;
      images?: Array<{ url: string }>;
    };
  }>;
  originalSubtotal?: number;
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  shippingCost: number;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderNote?: string;
  createdAt: string;
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [backPressed, setBackPressed] = useState(false);

  useEffect(() => {
    let backHandlerAdded = false;
    
    const handlePopState = () => {
      if (!backPressed) {
        setBackPressed(true);
        router.replace('/');
      }
    };
    
    if (!backHandlerAdded) {
      window.history.replaceState({ fromConfirmation: true }, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
      backHandlerAdded = true;
    }
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, backPressed]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };
  const getImageUrl = (item: any) => {
    if (item.image) {
      return item.image;
    }
    if (item.product?.images?.[0]) {
      if (typeof item.product.images[0] === 'string') {
        return item.product.images[0];
      }
      return item.product.images[0].url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20">
        <p className="text-charcoal">Order not found</p>
      </div>
    );
  }

  return (
    <div className="bg-sand/20 min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center md:items-start gap-3 mb-6">
          <CheckCircleIcon className="h-14 w-14 text-gold" strokeWidth={1} />
          <div>
            <h1 className="text-sm font-sans text-gold mb-1">Confirmation #{order._id?.slice(-8)}</h1>
            <p className="text-dark font-sans font-medium text-xl md:text-3xl mb-1">
              Thank you, {order.customer?.name}!
            </p>
          </div>
        </div>

        <div className="bg-transparent border border-sand/40 rounded-lg px-4 py-4 mb-6">
          <div className="font-serif font-semibold text-base md:text-xl text-dark">
            Your order is confirmed
          </div>
          <div className="font-sans text-sm md:text-base text-charcoal mt-2">
            You will receive a confirmation email soon
            <p className="text-blue-700">
              Order confirmation email sent to {order.customer?.email}. 
              Please check your <strong>Inbox</strong> or <strong>Spam/Junk</strong> folder.
            </p>
          </div>
        </div>
        <div className="bg-transparent border border-sand/40 rounded-lg px-4 py-4 md:p-6 mb-6">
          <h2 className="text-lg font-serif text-dark font-medium mb-4">Order details</h2>

          <div className="mb-4">
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const imageUrl = getImageUrl(item);
                return (
                  <div key={index} className="flex gap-3 pb-3 border-b border-sand/30 last:border-0">
                    <div className="block w-12 h-12 bg-sand/30 rounded overflow-hidden flex-shrink-0">
                      {imageUrl ? (
                        <img 
                          src={imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-charcoal">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-serif capitalize text-dark">{item.name}</p>
                      <div className="flex gap-1 md:gap-3 text-xs text-charcoal">
                        <span>Qty: {item.quantity}</span>
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gold">PKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-sand/30">
            {(order.originalSubtotal && order.originalSubtotal > 0) && (
              <div className="flex justify-between text-xs mb-1">
                <span className="text-charcoal">Original Subtotal</span>
                <span className="text-dark">PKR {order.originalSubtotal.toLocaleString()}</span>
              </div>
            )}
            
            {(order.discountAmount && order.discountAmount > 0) && (
              <div className="flex justify-between text-xs mb-1 text-green-600">
                <span>Discount ({order.discountPercent}% OFF)</span>
                <span>- PKR {order.discountAmount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs mb-1">
              <span className="text-charcoal">Subtotal after discount</span>
              <span className="text-dark">PKR {(order.subtotal || order.totalAmount - (order.shippingCost || 250)).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-xs mb-1">
              <span className="text-charcoal">Shipping</span>
              <span className="text-dark">PKR {(order.shippingCost || 250).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-sand/30 mt-2">
              <span className="text-dark">Total</span>
              <span className="text-gold">PKR {order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="border border-sand/40 rounded-lg px-4 py-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase font-serif font-medium text-dark tracking-wider mb-2">Contact information</h3>
              <p className="text-sm text-charcoal">{order.customer?.email}</p>
            </div>
            <div>
              <h3 className="text-xs font-serif font-medium text-dark uppercase tracking-wider mb-2">Shipping method</h3>
              <p className="text-xs text-charcoal">Standard Shipping (5-7 business days)</p>
            </div>
            <div>
              <h3 className="text-xs font-serif font-medium text-dark uppercase tracking-wider mb-2">Payment method</h3>
              <p className="text-xs text-charcoal mt-1">Advance: 50% ({order.paymentMethod})</p>
              <p className="text-xs md:text-sm text-gold mt-1">PKR {order.totalAmount?.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-xs font-serif font-medium text-dark uppercase tracking-wider mb-2">Shipping address</h3>
              <div className="text-sm text-charcoal">
                <p>{order.customer?.name}</p>
                <p className="text-xs text-charcoal">{order.customer?.address}</p>
                <p className="text-xs text-charcoal">{order.customer?.phone}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-block bg-gold text-dark px-6 py-3 rounded-full text-sm hover:bg-gold/80 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}