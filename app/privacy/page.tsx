'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LockClosedIcon, 
  EyeIcon, 
  ShieldCheckIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { CookieIcon } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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
            <LockClosedIcon className="h-4 w-4 text-gold" />
            <span className="text-xs text-gold tracking-wide uppercase font-medium">Your Privacy Matters</span>
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl lg:text-6xl text-gold mb-4">
            Privacy Policy
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mb-6" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-rose/30 rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <DocumentTextIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl md:text-2xl text-dark">Information We Collect</h2>
          </div>
          <p className="text-charcoal text-xs md:text-sm leading-relaxed mb-3">
            We collect information you provide directly to us, such as when you create an account, 
            place an order, or contact customer support. This may include:
          </p>
          <ul className="space-y-2 text-xs md:text-sm text-charcoal ml-6 list-disc">
            <li>Name, email address, phone number</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely)</li>
            <li>Order history and preferences</li>
          </ul>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-plaster/30 rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <EyeIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl md:text-sm text-dark">How We Use Your Information</h2>
          </div>
          <p className="text-charcoal leading-relaxed mb-3">
            We use the information we collect to:
          </p>
          <ul className="space-y-2 text-xs md:text-sm text-charcoal ml-6 list-disc">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your order</li>
            <li>Improve our products and services</li>
            <li>Send you promotional offers (with your consent)</li>
            <li>Protect against fraudulent transactions</li>
          </ul>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-sand/30 rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <UserGroupIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl md:text-sm text-dark">Information Sharing</h2>
          </div>
          <p className="text-charcoal text-xs md:text-sm leading-relaxed mb-3">
            We do not sell, trade, or rent your personal information to third parties. 
            We may share your information with:
          </p>
          <ul className="space-y-2 text-xs md:text-sm text-charcoal ml-6 list-disc">
            <li>Service providers who assist in order fulfillment and delivery</li>
            <li>Payment processors to handle transactions securely</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-rose/40 via-sand/30 to-plaster/30 rounded-2xl p-8 text-center"
        >
          <h2 className="font-serif text-xl text-dark mb-2">
            Questions About Your Privacy?
          </h2>
          <p className="text-charcoal text-xs md:text-sm mb-4">
            Contact our team for any concerns
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center text-xs md:text-sm gap-2 bg-gold text-dark px-6 py-2.5 rounded-full hover:bg-gold/80 transition"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  );
}