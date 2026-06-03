'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserPlusIcon, 
  LinkIcon, 
  CurrencyRupeeIcon,
  UsersIcon,
  GiftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { CurrencyIcon, UserCheckIcon } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      title: 'Sign Up',
      description: 'Fill out the affiliate application form with your details',
      icon: <UserPlusIcon className="h-8 w-8" />,
      details: [
        'Full name',
        'Email address',
        'Phone number',
        'Instagram/TikTok username',
        'EasyPaisa number for payouts'
      ]
    },
    {
      title: 'Get Approved',
      description: 'Our team reviews your application within 3-6 business days',
      icon: <UserCheckIcon className="h-8 w-8" />,
      details: [
        'We check your social presence',
        'Application status: Pending and then Approved',
        'You receive email notification',
        'Get your unique referral code'
      ]
    },
    {
      title: 'Share Your Code',
      description: 'Share your unique referral code with your audience',
      icon: <LinkIcon className="h-8 w-8" />,
      details: [
        'Share on Instagram, TikTok, YouTube',
        'Post in Facebook groups',
        'Share with friends and family',
        'Add to your bio/links'
      ]
    },
    {
      title: 'Earn Commission',
      description: 'Earn commission on every sale made using your code',
      icon: <CurrencyIcon className="h-8 w-8" />,
      details: [
        '% commission on every sale',
        'Real-time tracking in dashboard',
        'No minimum payout limit',
        'Transparent earnings system'
      ]
    }
  ];

  const benefits = [
    {
      icon: <UsersIcon className="h-6 w-6" />,
      title: 'No Cost to Join',
      description: 'Free to join, no hidden fees'
    },
    {
      icon: <GiftIcon className="h-6 w-6" />,
      title: 'EasyPaisa Payouts',
      description: 'Get paid directly to your EasyPaisa account'
    },
    {
      icon: <CurrencyRupeeIcon className="h-6 w-6" />,
      title: 'Get Commission',
      description: 'On every successful sale'
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      title: 'Real-time Tracking',
      description: 'Track earnings in your dashboard'
    }
  ];

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24">
      <div className="container-custom max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-dark mb-4">
            How It Works
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mb-6" />
          <p className="text-charcoal max-w-2xl mx-auto">
            Join our affiliate program and start earning commission on every sale
          </p>
        </motion.div>

        <div className="mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-sand/30 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-gold">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-serif text-dark">{step.title}</h3>
                </div>
                <p className="text-charcoal text-sm mb-4">{step.description}</p>
                <ul className="space-y-1">
                  {step.details.map((detail, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <span className="text-gold">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-sand/30 rounded-xl p-8 mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif text-dark mb-2">Why Join Timavo Affiliate?</h2>
            <div className="w-16 h-px bg-gold mx-auto" />
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3 text-gold">
                  {benefit.icon}
                </div>
                <h3 className="font-serif text-dark mb-1">{benefit.title}</h3>
                <p className="text-xs text-charcoal">{benefit.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/affiliate"
              className="inline-block bg-gold text-dark px-8 py-3 rounded-full hover:bg-gold/90 transition font-medium"
            >
              Apply Now →
            </Link>
            <Link
              href="/shop"
              className="inline-block border border-dark text-dark px-8 py-3 rounded-full hover:bg-dark hover:text-cream transition"
            >
              Browse Products
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}