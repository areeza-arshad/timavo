'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AffiliatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    socialUsername: '',
    paymentMethod: 'easypaisa',
    easypaisaNumber: '',
    jazzcashNumber: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankIBAN: '',
    bankName: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        setSubmitted(true);
        toast.success('Application submitted! We\'ll review and get back to you.');
      } else {
        toast.error(data.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-sand/20 pt-32 pb-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 bg-sand/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-sand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif mb-3">Application Submitted!</h2>
          <p className="text-charcoal mb-6">
            Thank you for your interest in Timavo Affiliate Program. Our team will review your application 
            and please check your spam/junk folder for approve email
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24">
      <div className="container-custom max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-cursive text-gold mb-4">
            Join Our Affiliate Program
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mb-6" />
          <p className="text-charcoal max-w-2xl mx-auto">
            Become a Timavo affiliate and earn commission with us on every sale you generate. 
            Perfect for influencers, content creators, and jewelry lovers!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-sm"
          >
            <h2 className="text-2xl font-serif mb-6">Apply Now</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-charcoal mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm text-charcoal mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm text-charcoal mb-1">Whatsapp Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm text-charcoal mb-1">Instagram/TikTok Username</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                  value={formData.socialUsername}
                  onChange={(e) => setFormData({ ...formData, socialUsername: e.target.value })}
                  placeholder="@username"
                />
              </div>

              {/*Payment Method Selection */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="easypaisa"
                      checked={formData.paymentMethod === 'easypaisa'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="text-gold"
                    />
                    <span className="text-sm">EasyPaisa</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="jazzcash"
                      checked={formData.paymentMethod === 'jazzcash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="text-gold"
                    />
                    <span className="text-sm">JazzCash</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="text-gold"
                    />
                    <span className="text-sm">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {formData.paymentMethod === 'easypaisa' && (
                <div>
                  <label className="block text-sm text-charcoal mb-1">EasyPaisa Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                    value={formData.easypaisaNumber}
                    onChange={(e) => setFormData({ ...formData, easypaisaNumber: e.target.value })}
                    placeholder="03XXXXXXXXX"
                  />
                </div>
              )}

              {formData.paymentMethod === 'jazzcash' && (
                <div>
                  <label className="block text-sm text-charcoal mb-1">JazzCash Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                    value={formData.jazzcashNumber}
                    onChange={(e) => setFormData({ ...formData, jazzcashNumber: e.target.value })}
                    placeholder="03XXXXXXXXX"
                  />
                </div>
              )}

              {formData.paymentMethod === 'bank_transfer' && (
                <div className="space-y-3 border-t pt-3">
                  <p className="text-xs text-gold font-medium">Enter Your Bank Account Details</p>
                  <div>
                    <label className="block text-sm text-charcoal mb-1">Bank Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-charcoal mb-1">Account Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                      value={formData.bankAccountName}
                      onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-charcoal mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-charcoal mb-1">IBAN (Optional)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-gold outline-none"
                      value={formData.bankIBAN}
                      onChange={(e) => setFormData({ ...formData, bankIBAN: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-dark py-3 rounded-lg font-medium hover:bg-gold/80 transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Apply Now'}
              </button>
            </form>
          </motion.div>

          {/* Commission Info - Same as before */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-rose/30 rounded-2xl p-6">
              <h2 className="text-2xl font-serif mb-4">Commission Structure</h2>
              <div className="text-5xl font-cursive text-gold mb-2">9%</div>
              <p className="text-charcoal">on every successful sale you refer</p>
            </div>

            <div className="bg-plaster/30 rounded-2xl p-6">
              <h3 className="font-serif text-lg mb-3">How It Works</h3>
              <ul className="space-y-3 text-sm text-charcoal">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span>First, Signup to create your account</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span>Apply for affiliate program with the same email</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span>Get approved by our team</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <span>Receive your unique referral code</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Share your code on social media</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gold/10 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span>Earn commission on every sale</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}