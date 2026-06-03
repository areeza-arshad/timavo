'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  ShoppingBagIcon, 
  CreditCardIcon,
  ArrowLeftIcon,
  TruckIcon,
  HeartIcon,
  ScaleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function TermsOfServicePage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="bg-sand/20 overflow-hidden pt-32 pb-24">
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
            <DocumentTextIcon className="h-4 w-4 text-gold" />
            <span className="text-xs text-gold tracking-wide uppercase font-medium">Legal Agreement</span>
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl lg:text-6xl text-gold mb-4">
            Terms of Service
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
            <h2 className="font-serif text-xl text-dark">Agreement to Terms</h2>
          </div>
          <p className="text-charcoal text-xs md:text-sm leading-relaxed mb-3">
            By accessing or using Timavo's website, you agree to be bound by these Terms of Service. 
          </p>
          <p className="text-charcoal text-xs md:text-sm bg-white/30 rounded-lg p-3">
            These terms apply to all users, including visitors, customers, and contributors.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-plaster/30 rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBagIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl text-dark">Products & Pricing</h2>
          </div>
          <p className="text-charcoal text-xs md:text-sm leading-relaxed mb-3">
            All products are subject to availability. We reserve the right to discontinue any product at any time.
          </p>
          <ul className="space-y-2 text-charcoal text-xs md:text-sm ml-6 list-disc">
            <li>Prices are subject to change without notice</li>
            <li>We make every effort to display accurate product colors and details</li>
            <li>Each piece is handcrafted and may have slight variations</li>
            <li>We reserve the right to limit quantities of any product</li>
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
            <CreditCardIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl text-dark">Orders & Payments</h2>
          </div>
          <p className="text-charcoal text-xs md:text-sm leading-relaxed mb-3">
            By placing an order, you agree to provide accurate and complete information. We reserve the right to:
          </p>
          <ul className="space-y-2 text-xs md:text-sm text-charcoal ml-6 list-disc">
            <li>Refuse or cancel any order at our discretion</li>
            <li>Contact you for verification before processing</li>
            <li>Require additional information to process orders</li>
            <li>Cancel orders due to pricing errors or availability</li>
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
            Have Questions About Our Terms?
          </h2>
          <p className="text-charcoal text-xs md:text-sm mb-4">
            We're here to help clarify any concerns
          </p>
          <Link
            href="/contact"
            className="inline-flex text-xs md:text-sm items-center gap-2 bg-gold text-dark px-6 py-2.5 rounded-full hover:bg-gold/80 transition"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </div>
  );
}