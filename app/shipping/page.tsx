'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ArrowLeftIcon,
  MapPinIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function ShippingPage() {
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
            <TruckIcon className="h-4 w-4 text-gold" />
            <span className="text-xs text-gold tracking-wide uppercase font-medium">Shipping Information</span>
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl lg:text-6xl text-gold mb-4">
            Shipping Policy
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
            <ClockIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl md:text-2xl text-dark">Order Processing Time</h2>
          </div>
          <p className="text-charcoal text-xs md:text-sm leading-relaxed mb-3">
            All orders are processed within <strong className="text-gold">5-7 business days</strong> (excluding weekends and holidays). 
            You will receive a confirmation email with information once your order has been confirmed.
          </p>
          <p className="uppercase text-gold text-xs md:text-sm bg-white/30 font-medium rounded-lg p-3">
            No urgent orders
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-rose/40 via-sand/30 to-plaster/30 rounded-2xl p-8 text-center"
        >
          <h2 className="font-serif text-xl text-dark mb-2">
            Still have questions?
          </h2>
          <p className="text-charcoal text-xs md:text-sm mb-4">
            Our customer support team is here to help
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