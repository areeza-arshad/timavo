'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Customization {
  _id: string;
  userName: string;
  userEmail: string;
  productType: string;
  metalType: string;
  gemstone?: string;
  message: string;
  budget?: number;
  status: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserCustomizations() {
  const router = useRouter();
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCustomizations();
  }, []);

  const fetchUserCustomizations = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      
      const userData = await userRes.json();
      
      const customRes = await fetch(`/api/customizations?email=${userData.user.email}`);
      const data = await customRes.json();
      setCustomizations(data);
    } catch (error) {
      console.error('Error fetching customizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewing: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Pending Review',
      reviewing: 'Under Review',
      approved: 'Approved',
      in_progress: 'In Progress',
      completed: 'Completed ✓',
      rejected: 'Not Approved',
    };
    return texts[status] || status.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-24">
      <div className="container-custom max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-serif">My Customization Requests</h1>
            <p className="text-charcoal text-sm mt-1">Track the progress of your custom jewelry orders</p>
          </div>
          <Link href="/customize" className="btn-primary text-sm">
            New Request +
          </Link>
        </div>

        {customizations.length === 0 ? (
          <div className="text-center py-12 bg-white p-8 rounded-lg">
            <p className="text-charcoal mb-4">You haven't submitted any customization requests yet.</p>
            <Link href="/customize" className="text-gold hover:underline">
              Design Your Dream Jewelry →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {customizations.map((req, index) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif text-lg">Request #{req._id.slice(-8)}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(req.status)}`}>
                    {getStatusText(req.status)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-charcoal text-xs uppercase">Product Type</p>
                    <p className="font-medium text-dark mt-1">{req.productType}</p>
                  </div>
                  <div>
                    <p className="text-charcoal text-xs uppercase">Metal Type</p>
                    <p className="font-medium text-dark mt-1">{req.metalType}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-charcoal text-xs uppercase">Your Message</p>
                  <p className="text-dark text-sm mt-1 bg-gray-50 p-3 rounded">
                    {req.message}
                  </p>
                </div>

                {req.adminNotes && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-gold text-sm font-medium flex items-center gap-2">
                      <span></span> Team Response:
                    </p>
                    <p className="text-dark text-sm mt-2 italic bg-cream p-3 rounded">
                      "{req.adminNotes}"
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      req.status === 'completed' ? 'bg-green-500' : 
                      req.status === 'rejected' ? 'bg-red-500' : 
                      'bg-gold'
                    }`} />
                    <span className="text-xs text-charcoal">
                      Last updated: {new Date(req.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}