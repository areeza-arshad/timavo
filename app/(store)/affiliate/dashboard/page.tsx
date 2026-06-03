'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {  
  CheckIcon, 
  UsersIcon, 
  CurrencyRupeeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ClockIcon, CopyIcon } from 'lucide-react';

interface AffiliateData {
  affiliate: {
    id: string;
    name: string;
    email: string;
    referralCode: string;
    commissionRate: number;
    status: string;
    totalEarnings: number;
    pendingEarnings: number;
    approvedEarnings: number;
    paidEarnings: number;
    totalSales: number;
  };
  commissions: Array<{
    _id: string;
    orderNumber: string;
    orderSubtotal: number;
    commissionAmount: number;
    status: string;
    createdAt: string;
    approvedAt?: string;
    paidAt?: string;
  }>;
}

export default function AffiliateDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAffiliate, setIsAffiliate] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAffiliateStatus();
  }, []);

  const checkAffiliateStatus = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      
      if (!userData.user) {
        router.push('/login');
        return;
      }
      
      const affiliateRes = await fetch(`/api/affiliates?email=${userData.user.email}`);
      const affiliates = await affiliateRes.json();
      const isApprovedAffiliate = affiliates.length > 0 && affiliates[0].status === 'approved';
      
      if (!isApprovedAffiliate) {
        toast.error('You are not an approved affiliate');
        router.push('/account');
        return;
      }
      
      setIsAffiliate(true);
      fetchDashboard(userData.user.email);
    } catch (error) {
      console.error('Error checking status:', error);
      router.push('/account');
    } finally {
      setChecking(false);
    }
  };

  const fetchDashboard = async (email: string) => {
    try {
      const res = await fetch(`/api/affiliates/dashboard?email=${email}`);
      const dashboardData = await res.json();
      
      if (!res.ok) {
        router.push('/account');
        return;
      }
      
      setData(dashboardData);
    } catch (error) {
      console.error('Error:', error);
      router.push('/account');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const code = data?.affiliate.referralCode || '';
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Referral code copied! Share it with your audience.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!isAffiliate || !data) {
    return null;
  }

  if (data.affiliate.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20 pt-32 pb-24">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-sand/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClockIcon className="h-10 w-10 text-sand" />
          </div>
          <h2 className="text-2xl font-serif mb-3">Application Under Review</h2>
          <p className="text-charcoal">
            Your affiliate application is currently being reviewed. We'll notify you once approved.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Sales', value: data.affiliate.totalSales, icon: <UsersIcon className="h-5 w-5 text-gold" />, color: 'bg-gold/20' },
    { label: 'Total Earnings', value: `PKR ${data.affiliate.totalEarnings.toFixed(0)}`, icon: <CurrencyRupeeIcon className="h-5 w-5 text-gold" />, color: 'bg-gold/20' },
    { label: 'Pending', value: `PKR ${data.affiliate.pendingEarnings.toFixed(0)}`, icon: <ClockIcon className="h-5 w-5 text-gold" />, color: 'bg-gold/20' },
    { label: 'Paid', value: `PKR ${data.affiliate.paidEarnings.toFixed(0)}`, icon: <CheckIcon className="h-5 w-5 text-gold" />, color: 'bg-gold/20' },
  ];

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24">
      <div className="container-custom max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-dark mb-2">Affiliate Dashboard</h1>
          <div className="w-16 h-px bg-gold mx-auto mb-4" />
          <p className="text-charcoal">Welcome back, {data.affiliate.name}!</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gold/20 via-gold/10 to-transparent rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-sm text-charcoal mb-2">Your Unique Referral Code</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <p className="text-3xl md:text-5xl font-mono font-bold text-gold tracking-wider uppercase">
              {data.affiliate.referralCode}
            </p>
            <button
              onClick={copyReferralCode}
              className="flex items-center gap-2 bg-gold text-dark px-5 py-2 rounded-full hover:bg-gold/80 transition text-sm"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-charcoal mt-3">
            Share this code with your audience. They can enter it at checkout to support you!
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl p-4 text-center shadow-sm"
            >
              <div className={`${stat.color} w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2`}>
                {stat.icon}
              </div>
              <p className="text-xl md:text-2xl font-bold text-dark">{stat.value}</p>
              <p className="text-xs text-charcoal">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 sm:p-6"
        >
          <h2 className="text-xl font-serif mb-4">Commission History</h2>
          
          {data.commissions.length === 0 ? (
            <p className="text-charcoal text-center py-8">No commissions yet. Start sharing your referral code!</p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr className="text-left text-sm text-charcoal">
                      <th className="pb-2">Order #</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Commission (9%)</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.commissions.map((commission) => (
                      <tr key={commission._id} className="border-b border-gray-100 text-sm">
                        <td className="py-3 font-mono text-xs">{commission.orderNumber}</td>
                        <td className="py-3">PKR {commission.orderSubtotal}</td>
                        <td className="py-3 text-gold font-medium">PKR {commission.commissionAmount.toFixed(0)}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            commission.status === 'paid' ? 'bg-green-100 text-green-600' :
                            commission.status === 'approved' ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {commission.status}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-charcoal">
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards*/}
              <div className="md:hidden space-y-4">
                {data.commissions.map((commission) => (
                  <div key={commission._id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-gold">{commission.orderNumber}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        commission.status === 'paid' ? 'bg-green-100 text-green-600' :
                        commission.status === 'approved' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {commission.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-charcoal">Order Amount:</span>
                      <span className="text-sm text-dark font-medium">PKR {commission.orderSubtotal}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-charcoal">Your Commission (9%):</span>
                      <span className="text-sm text-gold font-medium">PKR {commission.commissionAmount.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-charcoal">Date:</span>
                      <span className="text-xs text-charcoal">{new Date(commission.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}