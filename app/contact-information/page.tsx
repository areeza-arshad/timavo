'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function ContactInformationPage() {
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
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-gold" />
            <span className="text-xs text-gold tracking-wide uppercase font-medium">Get in Touch</span>
          </div>
          <h1 className="font-cursive text-4xl md:text-5xl lg:text-6xl text-gold mb-4">
            Contact Information
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mb-6" />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-rose/30 rounded-2xl p-6 text-center shadow-md transition">
            <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <EnvelopeIcon className="h-7 w-7 text-gold" />
            </div>
            <h3 className="font-serif text-xl text-dark mb-2">Email Us</h3>
            <p className="text-charcoal text-sm mb-2">For general inquiries</p>
            <a href="mailto:timavoofficial@gmail.com" className="text-gold hover:underline text-sm">
              timavoofficial@gmail.com
            </a>
          </div>
          <div className="bg-rose/30 rounded-2xl p-6 text-center shadow-md transition">
            <div className="w-14 h-14 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="h-7 w-7 text-gold" />
            </div>
            <h3 className="font-serif text-xl text-dark mb-2">Follow Us</h3>
            <div className="flex justify-center gap-4">
              <a href="https://www.instagram.com/timavo.official?igsh=MWNsd3Z2djc5MTB0" target='_blank' className="text-charcoal hover:text-gold transition">Instagram</a>
              <a href="https://www.facebook.com/profile.php?id=61586124353721&mibextid=ZbWKwL" target='_blank' className="text-charcoal hover:text-gold transition">Facebook</a>
              <a href="https://www.tiktok.com/@timavo.official?_r=1&_d=ehed6b5520hfc1&sec_uid=MS4wLjABAAAAXtpy3pucYPypxR-YKa7cqB4CYpvCj_KxoWAplm03kBatKzy5d4I_NmPDxHASXFms&share_author_id=7503389442284241927&sharer_language=en&source=h5_m&u_code=ek906mk5i6gabm&timestamp=1779296874&user_id=7503389442284241927&sec_user_id=MS4wLjABAAAAXtpy3pucYPypxR-YKa7cqB4CYpvCj_KxoWAplm03kBatKzy5d4I_NmPDxHASXFms&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7468202655384700679&share_link_id=7de206f8-7adc-45a7-8151-f50e4aea4441&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1" target='_blank' className="text-charcoal hover:text-gold transition">Tiktok</a>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-plaster/30 rounded-2xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="h-6 w-6 text-gold" />
            <h2 className="font-serif text-2xl text-dark">Business Hours</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-gold/20">
              <span className="text-gold">7:00 AM - 9:00 PM</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="bg-sand/30 rounded-2xl p-6 md:p-8 mb-8 text-center"
        >
          <p className="text-charcoal leading-relaxed">
            We typically respond to all inquiries within <strong className="text-gold">24 hours</strong> during business days.
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
            Send Us a Message
          </h2>
          <p className="text-charcoal text-xs md:text-sm mb-4">
            Have a specific question? We're here to help
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gold text-dark px-6 py-2.5 rounded-full hover:bg-gold/80 transition text-xs md:text-sm"
          >
            Contact Form
          </Link>
        </motion.div>
      </div>
    </div>
  );
}