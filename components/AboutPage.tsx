'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  ArrowRightIcon,
  StarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="bg-cream border-t overflow-hidden pt-10 pb-24">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 bg-rose/30 rounded-full px-4 py-1.5">
            <HeartIcon className="h-4 w-4 text-gold" />
            <span className="text-xs text-gold tracking-wide uppercase font-medium">Our Story</span>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center mb-10 md:px-4"
        >
          <motion.div variants={fadeUp} className="order-2 md:order-1">
            <h2 className="font-serif text-3xl md:text-4xl text-dark mb-4">
              Meet the Face Behind Timavo
            </h2>
            <div className="w-16 h-px bg-gold mb-6" />
            <p className="text-charcoal mb-4 leading-relaxed">
              Hi, I’m Fatima, a 22-year-old business girlie building a dream brand completely from scratch. What started as an idea is slowly turning into a world filled with creativity, stories, and meaningful designs
            </p>
            <p className="text-charcoal mb-6 leading-relaxed">
              I create beaded jewellery inspired by skin tones, personalities, moods, and aesthetics so every piece feels personal. My goal is to make jewellery that helps people express themselves, not just follow trends. 
            </p>
            <p className="text-charcoal mb-6 leading-relaxed">
              This journey is more than starting a business it’s about creating something real, one bead at a time.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-rose/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-gold"></div>
                <span className="text-xs text-charcoal">Hand-sketched designs</span>
              </div>
              <div className="flex items-center gap-2 bg-sand/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-gold"></div>
                <span className="text-xs text-charcoal">Premium materials</span>
              </div>
              <div className="flex items-center gap-2 bg-plaster/10 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-gold"></div>
                <span className="text-xs text-charcoal">Quality assured</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="relative order-1 md:order-2">
            <div className="relative overflow-hidden">
              <img
                src="bg.jpeg"
                alt="Jewelry making process"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose/20 to-transparent" />
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-sand/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold/10 rounded-full blur-2xl" />
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-rose/20 rounded-3xl p-8 md:p-12 mb-10"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "100+", label: "Happy Customers", icon: <UsersIcon className="h-6 w-6 text-gold mx-auto mb-2" /> },
              { number: "100%", label: "Handmade Quality", icon: <HeartIcon className="h-6 w-6 text-gold mx-auto mb-2" /> },
              { number: "4.9★", label: "Average Rating", icon: <StarIcon className="h-6 w-6 text-gold mx-auto mb-2" /> },
              { number: "50+", label: "Unique Designs", icon: <SparklesIcon className="h-6 w-6 text-gold mx-auto mb-2" /> }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <div className="text-3xl md:text-4xl font-serif text-gold mb-1">
                  {stat.number}
                </div>
                <p className="text-charcoal text-xs uppercase tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-rose/30 via-sand/20 to-plaster/30 rounded-3xl p-8 md:p-12 text-center"
        >
          <h2 className="font-serif text-2xl md:text-3xl text-dark mb-3">
            Ready to Start Your Journey?
          </h2>
          <p className="text-charcoal mb-6 max-w-md mx-auto">
            Explore our collection and find the piece that speaks to your soul.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gold text-dark px-6 py-3 rounded-full hover:bg-gold/80 transition group"
            >
              <span>Shop Now</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/customize"
              className="inline-flex items-center gap-2 border border-dark text-dark px-6 py-3 rounded-full hover:bg-dark hover:text-cream transition group"
            >
              <span>Custom Design</span>
              <SparklesIcon className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}