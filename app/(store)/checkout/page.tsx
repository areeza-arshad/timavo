'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import { FULL_ADVANCE_THRESHOLD, SHIPPING_FEE } from '@/lib/constants';

const COD_TAX = 100;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'bank_transfer'>('easypaisa');
  const [paymentType, setPaymentType] = useState<'full_advance' | 'half_advance'>('half_advance');
  const [customerPaymentType, setCustomerPaymentType] = useState<'easypaisa' | 'jazzcash'>('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [screenshotError, setScreenshotError] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralMessage, setReferralMessage] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [affiliateId, setAffiliateId] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  
  const originalSubtotal = getTotalPrice();
  const shippingFee = items.length === 0 ? 0 : SHIPPING_FEE;
  const originalTotal = originalSubtotal + shippingFee;
  
  const discountAmount = isReferralValid ? originalSubtotal * 0.05 : 0;
  const discountedSubtotal = originalSubtotal - discountAmount;
  const discountedTotal = discountedSubtotal + shippingFee;

  const isFullAdvance = paymentType === 'full_advance';
  const codTax = isFullAdvance ? 0 : COD_TAX;
  const totalWithTax = discountedTotal + codTax;

  const advancePercentage = isFullAdvance ? 1 : 0.5;
  const advanceAmount = discountedTotal * advancePercentage;
  const remainingAmount = discountedTotal - advanceAmount + codTax;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    houseNo: '',
    street: '',
    block: '',
    landmark: '',
    area: '',
    colonyRoad: '',
    city: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (paymentMethod === 'bank_transfer') {
      setCustomerPaymentType('easypaisa'); 
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (isHydrated && items.length === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [isHydrated, items, router, orderPlaced]);

  useEffect(() => {
    if (discountedTotal < 1000) {
      setPaymentType('full_advance');
    }
  }, [discountedTotal]);

  const validateReferralCode = async (code: string) => {
    if (!code) return false;
    try {
      const res = await fetch(`/api/affiliates/validate?code=${code}`);
      const data = await res.json();
      if (data.valid) {
        setReferralMessage(`Referral code applied!`);
        setIsReferralValid(true);
        setAffiliateId(data.affiliateId || '');
        return true;
      } else {
        setReferralMessage('Invalid referral code');
        setIsReferralValid(false);
        setAffiliateId('');
        return false;
      }
    } catch {
      setReferralMessage('Error validating code');
      setIsReferralValid(false);
      setAffiliateId('');
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
      setAffiliateId('');
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
    
    const commissionAmount = isReferralValid ? originalSubtotal * 0.09 : 0;

    const orderData = {
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.houseNo}, ${formData.street}, ${formData.block ? formData.block + ', ' : ''}${formData.area}, ${formData.colonyRoad}, ${formData.city}`,
        houseNo: formData.houseNo,
        street: formData.street,
        block: formData.block,
        landmark: formData.landmark,
        area: formData.area,
        colonyRoad: formData.colonyRoad,
        city: formData.city,
      },
      items: items.map(item => ({
        ...item,
        selectedSize: item.selectedSize || null,
      })),
      orderNote: orderNote,
      originalSubtotal: originalSubtotal,
      subtotal: discountedSubtotal,
      discountAmount: discountAmount,
      discountPercent: isReferralValid ? 5 : 0,
      codTax: codTax,
      shippingCost: shippingFee,
      totalAmount: totalWithTax,
      advanceAmount: advanceAmount,
      remainingAmount: remainingAmount,
      paymentMethod: paymentMethod,
      paymentType: paymentType,
      customerPaymentType: paymentMethod === 'easypaisa' ? customerPaymentType : undefined,
      transactionId: paymentMethod === 'easypaisa' ? transactionId : undefined,
      paymentScreenshot: screenshotUrl || undefined,
      referralCode: referralCode || undefined,
      affiliateId: affiliateId || undefined,
      commissionAmount: commissionAmount,
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

  if (!isHydrated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24 md:px-4">
      <div className="container-custom">
        <h1 className="text-4xl text-gold font-serif text-center mb-12">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
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
                <label className="block text-sm text-charcoal mb-1">Contact Number (Active on SIM)</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {/* Address Fields */}
              <div>
                <label className="block text-sm text-charcoal mb-1">House / Building / Apartment #</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.houseNo}
                  onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Street #</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Block / Sector</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Near any famous place (Landmark)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Area</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Colony / Road / Chowk / Chowrangi</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.colonyRoad}
                  onChange={(e) => setFormData({ ...formData, colonyRoad: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm text-charcoal mb-1">Main City</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm text-charcoal mb-1">Order Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any instructions for your order..."
                  className="w-full px-4 py-2 border border-gray-200 focus:border-gold outline-none rounded-lg"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-sm text-charcoal mb-1">Referral Code</label>
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

              {/* Online Payment Method */}
              <div>
                <label className="block text-sm text-charcoal mb-3">Online Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      value="easypaisa"
                      checked={paymentMethod === 'easypaisa'}
                      onChange={() => setPaymentMethod('easypaisa')}
                      className="text-gold"
                    />
                    <span>Easypaisa/Jazzcash</span>
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

              {/* Payment Details based on method */}
              {/* {paymentMethod === 'easypaisa' && (
                <div className="bg-gold/5 p-4 space-y-3 rounded-lg">
                  <p className="font-medium">Account Details:</p>
                  <p className="text-sm">Easypaisa Account Title: Hafiza Fatima Murtaza</p>
                  <p className="text-sm">Easypaisa Number: 03328197729</p>
                  <p className="text-sm border-t border-sand/30 pt-2">Jazzcash Account Title: Ghulam Murtaza</p>
                  <p className="text-sm">Jazzcash Number: 03706806664</p>
                  <input
                    type="text"
                    placeholder="Transaction ID"
                    className="w-full px-4 py-2 outline-none border border-gray-200 rounded-lg"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                  <div className="mt-3">
                    <label className="block text-sm text-charcoal mb-2">Upload Payment Screenshot *</label>
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gold transition">
                        Choose File
                        <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
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
                    {screenshotError && <p className="text-xs text-red-500 mt-1">{screenshotError}</p>}
                    <p className="text-xs text-charcoal mt-2">Required: Upload screenshot of payment (JPEG, PNG, max 5MB)</p>
                  </div>
                </div>
              )} */}
              {paymentMethod === 'easypaisa' && (
                <div className="bg-gold/5 p-4 space-y-3 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-2">
                      Select Your Payment Wallet
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="customerPaymentType"
                          value="easypaisa"
                          checked={customerPaymentType === 'easypaisa'}
                          onChange={(e) => setCustomerPaymentType(e.target.value as 'easypaisa')}
                          className="text-gold"
                        />
                        <span className="text-sm">EasyPaisa</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="customerPaymentType"
                          value="jazzcash"
                          checked={customerPaymentType === 'jazzcash'}
                          onChange={(e) => setCustomerPaymentType(e.target.value as 'jazzcash')}
                          className="text-gold"
                        />
                        <span className="text-sm">JazzCash</span>
                      </label>
                    </div>
                  </div>

                  {/* EasyPaisa Details */}
                  {customerPaymentType === 'easypaisa' && (
                    <div className="border-b border-sand/30 pb-2">
                      <p className="text-sm font-medium text-gold">EasyPaisa Account Details</p>
                      <p className="text-sm">Account Title: Hafiza Fatima Murtaza</p>
                      <p className="text-sm">Account Number: 03328197729</p>
                    </div>
                  )}

                  {/* JazzCash Details */}
                  {customerPaymentType === 'jazzcash' && (
                    <div className="pb-2">
                      <p className="text-sm font-medium text-gold">JazzCash Account Details</p>
                      <p className="text-sm">Account Title: Ghulam Murtaza</p>
                      <p className="text-sm">Account Number: 03706806664</p>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Transaction ID"
                    className="w-full px-4 py-2 outline-none border border-gray-200 rounded-lg"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                  />
                  
                  <div className="mt-3">
                    <label className="block text-sm text-charcoal mb-2">Upload Payment Screenshot *</label>
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gold transition">
                        Choose File
                        <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
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
                    {screenshotError && <p className="text-xs text-red-500 mt-1">{screenshotError}</p>}
                    <p className="text-xs text-charcoal mt-2">Required: Upload screenshot of payment (JPEG, PNG, max 5MB)</p>
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
                    <label className="block text-sm text-charcoal mb-2">Upload Payment Screenshot *</label>
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gold transition">
                        Choose File
                        <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
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
                    {screenshotError && <p className="text-xs text-red-500 mt-1">{screenshotError}</p>}
                    <p className="text-xs text-charcoal mt-2">Required: Upload screenshot of payment (JPEG, PNG, max 5MB)</p>
                  </div>
                </div>
              )}
              {/* Payment Type Selection - Customer can choose */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">Choose Your Payment Plan</label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentType === 'full_advance' ? 'border-gold bg-gold/5' : 'border-sand/30'}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      checked={paymentType === 'full_advance'}
                      onChange={() => {
                        console.log('🔍 User selected: full_advance');
                        setPaymentType('full_advance');
                      }}
                      className="mt-1 text-gold"
                    />
                    <div>
                      <p className="font-medium text-dark">100% Advance Payment</p>
                      <p className="text-xs text-green-600">No extra tax • Pay full amount now</p>
                    </div>
                  </label>
                  
                  {discountedTotal >= 1000 && (
                    <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentType === 'half_advance' ? 'border-gold bg-gold/5' : 'border-sand/30'}`}>
                      <input
                        type="radio"
                        name="paymentType"
                        checked={paymentType === 'half_advance'}
                        onChange={() => setPaymentType('half_advance')}
                        className="mt-1 text-gold"
                      />
                      <div>
                        <p className="font-medium text-dark">50% Advance + 50% Cash on Delivery</p>
                        <p className="text-xs text-orange-600">Includes PKR {COD_TAX} Tax on delivery</p>
                      </div>
                    </label>
                  )}
                  
                  {discountedTotal < 1000 && (
                    <div className="p-3">
                      <p className="text-xs text-blue-700">
                        Orders under PKR 1000 require 100% advance payment. You can only choose the full advance option.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Note */}
              <div className={`p-4 rounded-lg ${isFullAdvance ? 'bg-sand/30 border border-sand/30' : 'bg-gold/10 border border-gold/20'}`}>
                <p className="text-sm font-medium mb-1">
                  {isFullAdvance ? (
                    <><span className="text-green-700">Full Advance Payment Selected</span></>
                  ) : (
                    <><span className="text-gold">Half Advance + Cash on Delivery Selected</span></>
                  )}
                </p>
                <p className="text-xs text-charcoal">
                  {isFullAdvance 
                    ? `You have chosen 100% advance payment. No extra tax will be added. Pay PKR ${advanceAmount.toFixed(2)} now.`
                    : `You have chosen 50% advance + 50% COD. Remaining PKR ${remainingAmount.toFixed(2)} (including PKR ${COD_TAX} tax) will be collected on delivery.`}
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

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-sand/30 p-4 md:p-6 sticky top-32 rounded-2xl">
              <h2 className="text-xl font-serif mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.selectedSize || 'nosize'}-${index}`} className="flex justify-between text-dark text-base">
                    <div>
                      <span>{item.name} x {item.quantity}</span>
                      {item.selectedSize && <p className="text-xs text-gold">Size: {item.selectedSize}</p>}
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
                {isReferralValid && (
                  <div className="flex justify-between text-sm text-gray-400 line-through">
                    <span>Original Total</span>
                    <span>PKR {originalTotal.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>PKR {discountedSubtotal.toFixed(2)}</span>
                </div>
                
                {isReferralValid && discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs md:text-base">
                    <span>Referral Discount (5%)</span>
                    <span>- PKR {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xs md:text-base">
                  <span>Shipping</span>
                  <span>PKR {shippingFee.toFixed(2)}</span>
                </div>
                
                {!isFullAdvance && codTax > 0 && (
                  <div className="flex justify-between text-orange-600 text-xs md:text-base">
                    <span>COD Tax</span>
                    <span>PKR {codTax.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-2 border-t border-sand/20">
                  <span>Total</span>
                  <span>PKR {totalWithTax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-medium text-sm pt-2">
                  <span>Advance to Pay ({isFullAdvance ? '100%' : '50%'})</span>
                  <span className="text-gold">PKR {advanceAmount.toFixed(2)}</span>
                </div>
                
                {!isFullAdvance && (
                  <div className="flex justify-between gap-4 text-xs text-charcoal">
                    <span>Remaining {codTax > 0 && `(includes PKR ${codTax} tax)`}</span>
                    <span className='text-right flex gap-1'><span>PKR</span> {remainingAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              {isReferralValid && (
                <div className="mt-3 p-2 text-green-600 text-xs text-center rounded-lg">
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