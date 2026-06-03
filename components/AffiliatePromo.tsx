'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CurrencyDollarIcon, 
  UsersIcon, 
  GiftIcon, 
  ArrowRightIcon,
  SparklesIcon,
  ChartBarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function AffiliatePromo() {
  return (
    <section className="py-20 bg-sand overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          
          <div className="absolute inset-0 bg-dark/95" />

          <div className="absolute top-0 right-0 w-96 h-96 bg-sand/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-plaster/10 rounded-full blur-3xl" />
          
         
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-10 right-20 text-gold/10 text-4xl"
          >
            💰
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-10 text-gold/10 text-3xl"
          >
            💎
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute top-1/2 right-1/4 text-gold/5 text-5xl"
          >
            ✨
          </motion.div>

          <div className="relative z-10 px-6 py-16 md:py-20 md:px-12">
            <div className="text-center max-w-3xl mx-auto">
              
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
              >
                <SparklesIcon className="h-4 w-4 text-gold" />
                <span className="text-xs text-gold tracking-wide uppercase font-medium">
                  Limited Time Opportunity
                </span>
              </motion.div>

              {/* WILL CHANGE THE COMMISSION RATE LATER */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-cream mb-4"
              >
                Earn 9% Commission
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-gold text-lg md:text-xl mb-4"
              >
                Join Our Affiliate Program
              </motion.p>

              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 60 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="h-px bg-gold mx-auto mb-6"
              />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="text-cream/70 text-xs md:text-base max-w-2xl mx-auto mb-10 leading-relaxed"
              >
                Share the beauty of Timavo with your community and earn with us on every sale. 
                Perfect for influencers, bloggers, and jewelry lovers who want to turn 
                their passion into profit.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
              >
                <div className="text-center p-4 rounded-xl bg-sand/10 backdrop-blur-sm border border-sand/20">
                  {/* I WILL CHANGE THIS LATER */}
                  <div className="text-2xl text-gold mb-1">9%</div>
                  <p className="text-cream/60 text-xs uppercase tracking-wide">Commission Rate</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-plaster/10 backdrop-blur-sm border border-plaster/20">
                  <div className="text-2xl text-gold mb-1">PKR 0</div>
                  <p className="text-cream/60 text-xs uppercase tracking-wide">Startup Cost</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="flex flex-wrap justify-center gap-6 mb-10"
              >
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-gold" />
                  <span className="text-cream/70 text-sm">Easypaisa Payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <GiftIcon className="h-5 w-5 text-gold" />
                  <span className="text-cream/70 text-sm">Exclusive Perks</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, type: 'spring' }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/affiliate"
                  className="inline-flex items-center justify-center gap-2 bg-gold text-dark px-6 py-2.5 md:px-8 md:py-3.5 rounded-full hover:bg-gold/90 transition-all duration-300 group font-medium"
                >
                  <span className='text-sm md:text-base'>Join Affiliate Program</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/affiliate/how-it-works"
                  className="inline-flex items-center justify-center gap-2 bg-transparent border border-gold text-gold text-sm md:text-base px-8 py-3.5 rounded-full hover:bg-gold/10 transition-all duration-300"
                >
                  Learn More
                </Link>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1 }}
                className="text-cream/20 text-xs mt-8"
              >
                No minimum payout • Real-time statistics • Dedicated support
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}