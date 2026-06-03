'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SparklesIcon, ArrowRightIcon, HeartIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function CustomizePromo() {
  return (
    <section className="py-16 md:py-24 bg-sand">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-dark shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-sand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-plaster/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="absolute top-10 left-10 text-gold/20 animate-pulse">
            <SparklesIcon className="h-8 w-8" />
          </div>
          <div className="absolute bottom-10 right-10 text-gold/20 animate-pulse delay-1000">
            <HeartIcon className="h-8 w-8" />
          </div>
          <div className="absolute top-1/2 left-1/4 text-gold/15 animate-pulse delay-500">
            <PencilIcon className="h-6 w-6" />
          </div>

          <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6"
            >
              <SparklesIcon className="h-4 w-4 text-gold" />
              <span className="text-xs text-gold tracking-wide uppercase font-medium">
                Customization
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-light text-cream mb-4"
            >
              Design Your Dream Jewelry
            </motion.h2>

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="h-px bg-gold mx-auto mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-cream/80 text-xs md:text-base max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              Turn your vision into reality. Work with our master artisans to create 
              a one-of-a-kind piece that tells your unique story. From custom engravings 
              to bespoke designs, we bring your dreams to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 mb-8"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <SparklesIcon className="h-4 w-4 text-gold" />
                </div>
                <span className="text-cream/70 text-sm">Custom Design</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <HeartIcon className="h-4 w-4 text-gold" />
                </div>
                <span className="text-cream/70 text-sm">Personalized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                  <PencilIcon className="h-4 w-4 text-gold" />
                </div>
                <span className="text-cream/70 text-sm">Expert Guidance</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              <Link
                href="/customize"
                className="inline-flex items-center gap-2 bg-gold text-dark px-6 py-2.5 md:px-8 md:py-3.5 rounded-full hover:bg-gold/90 transition-all duration-300 group"
              >
                <span className="font-medium tracking-wide text-center text-sm md:text-base">Start Your Custom Design</span>
                <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-cream/40 text-xs mt-6"
            >
              Free consultation • No obligation • 100% handmade
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}