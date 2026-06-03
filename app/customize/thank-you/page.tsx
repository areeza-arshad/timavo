'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-sand/20 flex items-center justify-center pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg mx-auto px-4"
      >
        <h1 className="text-3xl md:text-4xl font-serif mb-4">Thank You!</h1>
        <div className="w-20 h-px bg-gold mx-auto mb-6" />
        <p className="text-charcoal mb-6">
          Your customization request has been received. Our team will review your requirements 
          and get back to you within 2-3 business days.
        </p>
        <Link href="/" className="inline-block btn-primary">
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
}