'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Customization {
  _id: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
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

export default function TrackRequestPage() {
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(`/api/customizations?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      
      console.log('Fetched data:', data); 
      
      setRequests(data);
      setSearched(true);
      
      if (data.length === 0) {
        toast.error('No customization requests found for this email');
      } else {
        toast.success(`Found ${data.length} request(s)`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch requests. Please try again.');
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
    return texts[status] || status.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-cream pt-32 pb-24">
      <div className="container-custom max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-light mb-4">
            Track Your Customization Request
          </h1>
          <div className="w-20 h-px bg-gold mx-auto mb-6" />
          <p className="text-charcoal">
            Enter your email address to check the status of your customization requests
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 md:p-8 shadow-sm mb-8"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 focus:border-gold outline-none rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-dark text-cream px-8 py-3 hover:bg-gold transition-all duration-300 disabled:opacity-50 whitespace-nowrap rounded"
            >
              {loading ? 'Searching...' : 'Track My Requests'}
            </button>
          </form>
        </motion.div>

        {searched && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
                <p className="text-charcoal mt-4">Searching...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white p-8 rounded-lg">
                <p className="text-charcoal text-lg mb-4">No customization requests found for this email.</p>
                <p className="text-sm text-gray-500 mb-6">
                  Make sure you entered the same email you used when submitting your request.
                </p>
                <a href="/customize" className="text-gold hover:underline inline-block">
                  Create your first request →
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-center text-charcoal text-sm mb-4">
                  Found {requests.length} request(s) for <strong>{email}</strong>
                </p>
                {requests.map((req, index) => (
                  <motion.div
                    key={req._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                      <div>
                        <h3 className="font-serif text-lg">
                          Customization Request #{index + 1}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Request ID: {req._id.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(req.status)}`}>
                        {getStatusText(req.status)}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-charcoal text-xs uppercase tracking-wide">Product Type</p>
                        <p className="font-medium text-dark mt-1">{req.productType}</p>
                      </div>
                      <div>
                        <p className="text-charcoal text-xs uppercase tracking-wide">Metal Type</p>
                        <p className="font-medium text-dark mt-1">{req.metalType}</p>
                      </div>
                      {req.gemstone && (
                        <div>
                          <p className="text-charcoal text-xs uppercase tracking-wide">Gemstone</p>
                          <p className="font-medium text-dark mt-1">{req.gemstone}</p>
                        </div>
                      )}
                      {req.budget && (
                        <div>
                          <p className="text-charcoal text-xs uppercase tracking-wide">Budget</p>
                          <p className="font-medium text-dark mt-1">${req.budget}</p>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-charcoal text-xs uppercase tracking-wide">Your Message</p>
                      <p className="text-dark text-sm mt-1 bg-gray-50 p-3 rounded">
                        {req.message}
                      </p>
                    </div>

                    {req.adminNotes && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-gold text-sm font-medium flex items-center gap-2">
                          Team Response:
                        </p>
                        <p className="text-dark text-sm mt-2 italic bg-cream p-3 rounded">
                          "{req.adminNotes}"
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between">
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
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}