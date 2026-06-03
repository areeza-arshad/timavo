'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Contact form submitted:', formData);
      setLoading(false);
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });

      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="bg-sand/20 overflow-hidden pt-20 pb-24">
      <div className="container-custom max-w-4xl mx-auto md:px-4">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-charcoal hover:text-gold transition text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-rose/40 rounded-full px-4 py-1.5 mb-6">
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gold" />
            <span className="text-xs text-gold tracking-wide uppercase font-medium">Get in Touch</span>
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl lg:text-6xl text-gold mb-4">
            Contact Us
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mb-6" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="md:col-span-1"
          >
            <div className="bg-rose/30 rounded-2xl p-6 mb-6">
              <h3 className="font-serif text-xl text-dark mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs text-charcoal">Email</p>
                    <a href="mailto:timavoofficial@gmail.com" className="text-dark text-sm hover:text-gold transition">
                      timavoofficial@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-gold" />
                  <div>
                    <p className="text-xs text-charcoal">Response Time</p>
                    <p className="text-dark text-sm">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="md:col-span-2"
          >
            <div className="bg-cream/50 rounded-2xl p-6 md:p-8">
              <h3 className="font-serif text-2xl text-dark mb-6">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm text-dark mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/50" />
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gold transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm text-dark mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal/50" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gold transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm text-dark mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="Order Inquiry">Order Inquiry</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Custom Design">Custom Design Request</option>
                    <option value="Return/Exchange">Return/Exchange</option>
                    <option value="Affiliate Program">Affiliate Program</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm text-dark mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gold transition-colors resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-dark py-3 rounded-xl font-medium hover:bg-gold/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      Message Sent!
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>

                <p className="text-xs text-charcoal text-center mt-4">
                  By submitting this form, you agree to our privacy policy. We'll never share your information.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 bg-gradient-to-r from-rose/40 via-sand/30 to-plaster/30 rounded-2xl p-8 text-center"
        >
          <h2 className="font-serif text-xl text-dark mb-2">
            Prefer to call?
          </h2>
          <p className="text-charcoal text-xs md:text-sm mb-4">
            Check our contact information page for order and address details
          </p>
          <Link
            href="/contact-information"
            className="inline-flex items-center gap-2 bg-gold text-dark px-6 py-2.5 rounded-full hover:bg-gold/80 transition text-xs md:text-sm"
          >
            View Contact Information
          </Link>
        </motion.div>
      </div>
    </div>
  );
}