'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PhoneIcon, UserIcon, SparklesIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { GemIcon, ImageIcon } from 'lucide-react';

interface Customization {
  _id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  productType: string;
  metalType: string;
  gemstone: string;
  message: string;
  budget: number;
  status: string;
  adminNotes: string;
  referenceImage: string;
  createdAt: string;
}

export default function AdminCustomizations() {
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Customization | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchCustomizations();
  }, []);

  const fetchCustomizations = async () => {
    try {
      const res = await fetch('/api/customizations');
      const data = await res.json();
      setCustomizations(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes: string) => {
    try {
      const res = await fetch(`/api/customizations?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNotes: notes }),
      });

      if (res.ok) {
        toast.success('Request updated successfully');
        fetchCustomizations();
        setSelectedRequest(null);
      } else {
        toast.error('Failed to update');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <ClockIcon className="h-3 w-3" /> },
      reviewing: { color: 'bg-blue-100 text-blue-800', icon: <EyeIcon className="h-3 w-3" /> },
      approved: { color: 'bg-green-100 text-green-800', icon: <CheckCircleIcon className="h-3 w-3" /> },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: <SparklesIcon className="h-3 w-3" /> },
      completed: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircleIcon className="h-3 w-3" /> },
      rejected: { color: 'bg-red-100 text-red-800', icon: <XCircleIcon className="h-3 w-3" /> },
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-800', icon: null };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/30 px-4 py-6 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-dark">Customization Requests</h1>
          <p className="text-sm text-charcoal/70 mt-1">Manage and track custom jewelry requests</p>
        </div>
        <div className="bg-gold/10 px-4 py-2 rounded-lg">
          <p className="text-sm text-charcoal">
            Total: <span className="font-bold text-gold">{customizations.length}</span> requests
          </p>
        </div>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden xl:block bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gold/5 to-gold/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Message</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-charcoal uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customizations.map((req) => {
                const statusBadge = getStatusBadge(req.status);
                return (
                  <tr key={req._id} className="hover:bg-sand/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-dark">{req.userName}</p>
                        <p className="text-xs text-charcoal/60">{req.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-charcoal line-clamp-2 max-w-md">
                        {req.message.substring(0, 10)}...
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                        {statusBadge.icon}
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setAdminNotes(req.adminNotes || '');
                          setNewStatus(req.status);
                        }}
                        className="inline-flex items-center gap-1 text-gold hover:text-gold/80 font-medium transition-colors"
                      >
                        <EyeIcon className="h-5 w-5" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="xl:hidden space-y-4">
        {customizations.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-charcoal/60">
            No customization requests found
          </div>
        ) : (
          customizations.map((req) => {
            const statusBadge = getStatusBadge(req.status);
            return (
              <div key={req._id} className="bg-white rounded-xl shadow-md p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark truncate">{req.userName}</p>
                    <p className="text-xs text-charcoal/60 truncate">{req.userEmail}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${statusBadge.color}`}>
                    {statusBadge.icon}
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-charcoal/60">
                  <ClockIcon className="h-4 w-4" />
                  {new Date(req.createdAt).toLocaleDateString()}
                </div>
                <div className="bg-sand/20 rounded-lg p-3">
                  <p className="text-sm text-charcoal line-clamp-3">
                    {req.message}
                  </p>
                </div>
                {req.budget > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-charcoal/60">Budget</span>
                    <span className="text-sm font-semibold text-gold">PKR {req.budget.toLocaleString()}</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedRequest(req);
                    setAdminNotes(req.adminNotes || '');
                    setNewStatus(req.status);
                  }}
                  className="w-full bg-gold/10 text-gold py-2 rounded-lg font-medium text-sm hover:bg-gold/20 transition-colors flex items-center justify-center gap-2"
                >
                  <EyeIcon className="h-4 w-4" />
                  View Details
                </button>
              </div>
            );
          })
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-lg sm:text-xl font-serif text-dark">Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gradient-to-r from-sand/20 to-sand/10 rounded-xl p-4">
                <h3 className="font-serif text-dark mb-3 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gold" />
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-charcoal/60">Name:</span> {selectedRequest.userName}</p>
                  <p><span className="text-charcoal/60">Email:</span> {selectedRequest.userEmail}</p>
                  {selectedRequest.userPhone && (
                    <p><span className="text-charcoal/60">Phone:</span> {selectedRequest.userPhone}</p>
                  )}
                </div>
              </div>

              {selectedRequest.referenceImage && (
                <div className="bg-gradient-to-r from-sand/20 to-sand/10 rounded-xl p-4">
                  <h3 className="font-serif text-dark mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-gold" />
                    Reference Image
                  </h3>
                  <a
                    href={selectedRequest.referenceImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={selectedRequest.referenceImage}
                      alt="Reference"
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                    />
                  </a>
                  <p className="text-xs text-charcoal/50 mt-2 text-center">
                    Click image to view full size
                  </p>
                </div>
              )}

              <div className="bg-gradient-to-r from-sand/20 to-sand/10 rounded-xl p-4">
                <h3 className="font-serif text-dark mb-2 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-gold" />
                  Customer Message
                </h3>
                <p className="text-dark text-sm bg-white rounded-lg p-3 border border-sand/30 whitespace-pre-wrap">
                  {selectedRequest.message}
                </p>
              </div>

              {selectedRequest.budget > 0 && (
                <div className="bg-gradient-to-r from-gold/5 to-gold/10 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-charcoal/60">Budget</span>
                    <span className="text-lg font-semibold text-gold">PKR {selectedRequest.budget.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Update Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Admin Notes (will be shared with customer)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => updateStatus(selectedRequest._id, newStatus, adminNotes)}
                  className="bg-gold text-dark font-medium py-3 rounded-xl hover:bg-gold/90 transition-colors flex-1"
                >
                  Update Request
                </button>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="border border-gray-300 text-charcoal font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}