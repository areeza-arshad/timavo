'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { FULL_ADVANCE_THRESHOLD, SHIPPING_FEE } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'bank_transfer'>('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [screenshotError, setScreenshotError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralMessage, setReferralMessage] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  
  const subtotal = getTotalPrice();
  const shippingFee = items.length === 0 ? 0 : SHIPPING_FEE;
  const totalPrice = subtotal + shippingFee;
  
  const requiresFullAdvance = totalPrice < FULL_ADVANCE_THRESHOLD;
  const advancePercentage = requiresFullAdvance ? 1 : 0.5;
  const advanceAmount = totalPrice * advancePercentage;
  const remainingAmount = totalPrice - advanceAmount;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [isHydrated, items, router, orderPlaced]);

  const validateReferralCode = async (code: string) => {
    if (!code) return false;
    try {
      const res = await fetch(`/api/affiliates/validate?code=${code}`);
      const data = await res.json();
      if (data.valid) {
        setReferralMessage('Referral code applied successfully!');
        setIsReferralValid(true);
        return true;
      } else {
        setReferralMessage('Invalid referral code');
        setIsReferralValid(false);
        return false;
      }
    } catch {
      setReferralMessage('Error validating code');
      setIsReferralValid(false);
      return false;
    }
  };

  const handleReferralChange = async (code: string) => {
    const upperCode = code.toUpperCase();
    setReferralCode(upperCode);
    if (upperCode.length >= 4) {
      await validateReferralCode(upperCode);
    } else {
      setReferralMessage('');
      setIsReferralValid(false);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setScreenshotError('Please upload JPEG, PNG, or WEBP image only');
        setScreenshot(null);
        setScreenshotPreview('');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setScreenshotError('File size must be less than 5MB');
        setScreenshot(null);
        setScreenshotPreview('');
        return;
      }
      
      setScreenshot(file);
      const previewUrl = URL.createObjectURL(file);
      setScreenshotPreview(previewUrl);
      setScreenshotError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!screenshot) {
      toast.error('Please upload payment screenshot');
      setScreenshotError('Payment screenshot is required');
      return;
    }
    
    if (referralCode && !isReferralValid) {
      const isValid = await validateReferralCode(referralCode);
      if (!isValid) {
        toast.error('Please enter a valid referral code');
        return;
      }
    }
    
    setLoading(true);

    let screenshotUrl = '';
    if (screenshot) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', screenshot);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          screenshotUrl = uploadData.url;
        } else {
          toast.error('Failed to upload screenshot');
          setLoading(false);
          return;
        }
      } catch (error) {
        toast.error('Failed to upload screenshot');
        setLoading(false);
        return;
      }
    }

    const orderData = {
      customer: formData,
      items: items.map(item => ({
        ...item,
        selectedSize: item.selectedSize || null,
      })),
      orderNote: orderNote,
      totalAmount: totalPrice,
      advanceAmount: advanceAmount,
      remainingAmount: remainingAmount,
      paymentMethod: paymentMethod,
      transactionId: paymentMethod === 'easypaisa' ? transactionId : undefined,
      paymentScreenshot: screenshotUrl || undefined,
      referralCode: referralCode || undefined,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderPlaced(true);
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/order-confirmation?id=${data.orderId}`);
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24 md:px-4">
      <div className="container-custom">
        <h1 className="text-4xl text-gold font-serif text-center mb-12">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-charcoal mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Delivery Address</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">
                  Order Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any instructions for your order..."
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm text-charcoal mb-1">
                  Referral Code (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg uppercase"
                    value={referralCode}
                    onChange={(e) => handleReferralChange(e.target.value)}
                  />
                  {referralCode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isReferralValid ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : referralCode.length >= 4 ? (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : null}
                    </div>
                  )}
                </div>
                {referralMessage && (
                  <p className={`text-xs mt-1 ${isReferralValid ? 'text-green-600' : 'text-red-500'}`}>
                    {referralMessage}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-3">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="easypaisa"
                      checked={paymentMethod === 'easypaisa'}
                      onChange={() => setPaymentMethod('easypaisa')}
                      className="text-gold"
                    />
                    <span>Easypaisa</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-gold"
                    />
                    <span>Bank Transfer</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'easypaisa' && (
                <div className="bg-gold/5 p-4 space-y-3 rounded-lg">
                  <p className="font-medium">Easypaisa Account Details:</p>
                  <p className="text-sm">Account Title: Hafiza Fatima Murtaza</p>
                  <p className="text-sm">Account Number: 03328197729</p>
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    className="w-full px-4 py-2 outline-none border border-gray-200 rounded-lg"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />

                  <div className="mt-3">
                    <label className="block text-sm text-charcoal mb-2">
                      Upload Payment Screenshot
                    </label>
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gold transition">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="hidden"
                          
                        />
                      </label>
                      {screenshotPreview ? (
                        <div className="relative">
                          <img src={screenshotPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                          <button
                            type="button"
                            onClick={() => {
                              setScreenshot(null);
                              setScreenshotPreview('');
                              setScreenshotError('');
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-red-500">No file chosen</div>
                      )}
                    </div>
                    {screenshotError && (
                      <p className="text-xs text-red-500 mt-1">{screenshotError}</p>
                    )}
                    <p className="text-xs text-charcoal mt-2">
                      Required: Upload screenshot of payment (JPEG, PNG, max 5MB)
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="bg-gold/5 p-4 space-y-3 rounded-lg">
                  <p className="font-medium">Bank Account Details:</p>
                  <p className="text-sm">Bank: Bank of Punjab</p>
                  <p className="text-sm">Account Name: Hafiza Fatima Murtaza</p>
                  <p className="text-sm">Account Number: 5010402491600014</p>
                  <p className="text-sm">IBAN: PK79BPUN5010402491600014</p>
                  
                  <div className="mt-3">
                    <label className="block text-sm text-charcoal mb-2">
                      Upload Payment Screenshot
                    </label>
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gold transition">
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="hidden"
                          
                        />
                      </label>
                      {screenshotPreview ? (
                        <div className="relative">
                          <img src={screenshotPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                          <button
                            type="button"
                            onClick={() => {
                              setScreenshot(null);
                              setScreenshotPreview('');
                              setScreenshotError('');
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-red-500">No file chosen</div>
                      )}
                    </div>
                    {screenshotError && (
                      <p className="text-xs text-red-500 mt-1">{screenshotError}</p>
                    )}
                    <p className="text-xs text-charcoal mt-2">
                      Required: Upload screenshot of payment (JPEG, PNG, max 5MB)
                    </p>
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-lg ${requiresFullAdvance ? 'bg-sand/30' : 'bg-gold/10'}`}>
                <p className="text-sm font-medium mb-1">
                  {requiresFullAdvance ? (
                    <><span className="text-orange-700">Full Advance Required</span></>
                  ) : (
                    <><span className="text-gold">50% Advance + 50% Cash on Delivery</span></>
                  )}
                </p>
                <p className="text-xs text-charcoal">
                  {requiresFullAdvance 
                    ? `Orders under PKR ${FULL_ADVANCE_THRESHOLD} require 100% advance payment.`
                    : `Orders above PKR ${FULL_ADVANCE_THRESHOLD} require 50% advance online, remaining 50% on delivery.`}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-dark py-3 rounded-lg font-medium hover:bg-gold/80 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay Advance PKR ${advanceAmount.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div>
            <div className="bg-sand/30 p-4 md:p-6 sticky top-32 rounded-2xl">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div 
                    key={`${item.productId}-${item.selectedSize || 'nosize'}-${index}`} 
                    className="flex justify-between text-dark text-base"
                  >
                    <div>
                      <span>{item.name} x {item.quantity}</span>
                      {item.selectedSize && (
                        <p className="text-xs text-gold">Size: {item.selectedSize}</p>
                      )}
                    </div>
                    <span>PKR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {orderNote && (
                <div className="border-t border-sand/20 pt-3 mb-3">
                  <p className="text-xs text-charcoal">Order Notes:</p>
                  <p className="text-xs text-dark italic">{orderNote}</p>
                </div>
              )}

              <div className="border-t border-sand/20 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>PKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>PKR {shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-sand/20">
                  <span>Total</span>
                  <span>PKR {totalPrice.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between font-medium text-sm md:text-base pt-2 ${requiresFullAdvance ? 'text-orange-700' : 'text-gold'}`}>
                  <span>Advance to Pay ({requiresFullAdvance ? '100%' : '50%'})</span>
                  <span>PKR {advanceAmount.toFixed(2)}</span>
                </div>
                {!requiresFullAdvance && (
                  <div className="flex justify-between text-xs md:text-sm text-charcoal">
                    <span>Remaining (COD)</span>
                    <span>PKR {remainingAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              {isReferralValid && (
                <div className="mt-3 p-2 bg-green-50 text-green-600 text-xs text-center rounded-lg flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Affiliate code applied!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}