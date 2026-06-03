'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

export default function RefundPolicyPage() {
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
            <ShieldCheckIcon className="h-4 w-4 text-gold" />
            <span className="text-xs text-gold tracking-wide uppercase font-medium">Return Policy</span>
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl lg:text-6xl text-gold mb-4">
            Refund Policy
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
            <VideoCameraIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl text-dark">Video Proof Required for Broken Items</h2>
          </div>
          <p className="text-charcoal leading-relaxed mb-3 text-sm">
            If you receive a broken or damaged item, we require a <strong className="text-gold">clear unboxing video</strong> as proof. 
            Please make sure to:
          </p>
          <ul className="space-y-2 text-sm text-charcoal ml-6 list-disc">
            <li>Record the entire unboxing process without any cuts</li>
            <li>Clearly display the damaged item</li>
            <li>Ensure good lighting and clear visibility</li>
          </ul>
          <p className="text-charcoal text-sm mt-3 bg-white/30 rounded-lg p-3">
            Claims without video proof will not be accepted. Please contact us within 48 hours of delivery.
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
            <CameraIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-xl text-dark">How to Submit a Claim</h2>
          </div>
          <ul className="space-y-3 text-sm text-charcoal">
            <li>1: Take clear photos of the damaged item</li>
            <li>2: Send unboxing video to <strong className="text-gold">timavooficial@gmail.com</strong> OR <strong className='text-gold'>+92 332 8197729</strong></li>
            <li>3: Include your name and order number in the email or in contact</li>
            <li>4: We will review and respond within 2-3 business days</li>
          </ul>
          <div className="mt-4 p-3 bg-gold/10 rounded-lg">
            <p className="text-sm text-dark font-medium">Email: timavooficial@gmail.com</p>
            <p className="text-sm text-dark">Phone: +92 332 8197729</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-rose/40 via-sand/30 to-plaster/30 rounded-2xl p-8 text-center"
        >
          <h2 className="font-serif text-xl text-dark mb-2">
            Need Help?
          </h2>
          <p className="text-charcoal text-sm mb-4">
            Our support team is here to assist you
          </p>
          <Link
            href="/contact-information"
            className="inline-flex items-center gap-2 bg-gold text-dark px-6 py-2.5 rounded-full hover:bg-gold/80 transition text-sm"
          >
            Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  );
}