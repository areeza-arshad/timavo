'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  CheckIcon, 
  UserIcon,
  MailIcon,
  PhoneIcon,
  CreditCardIcon,
  HashIcon,
  DollarSignIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaInstagram } from 'react-icons/fa';

interface Affiliate {
  _id: string;
  name: string;
  email: string;
  phone: string;
  socialUsername?: string;
  paymentMethod?: string;    
  easypaisaNumber?: string;
  jazzcashNumber?: string;   
  bankName?: string;         
  bankAccountName?: string;  
  bankAccountNumber?: string;
  bankIBAN?: string;         
  referralCode?: string;
  commissionRate: number;
  status: string;
  totalEarnings: number;
  totalSales: number;
  paidEarnings: number;
  pendingEarnings: number;
  createdAt: string;
}

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const res = await fetch('/api/affiliates');
      const data = await res.json();
      setAffiliates(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissions = async (affiliateId: string) => {
    try {
      const res = await fetch(`/api/affiliates/commissions?affiliateId=${affiliateId}`);
      const data = await res.json();
      setCommissions(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateAffiliateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/affiliates?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, name: affiliates.find(a => a._id === id)?.name }),
      });
      
      if (res.ok) {
        toast.success(`Affiliate ${status}`);
        fetchAffiliates();
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const updateCommissionStatus = async (commissionId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/affiliates/commissions?id=${commissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        toast.success(`Commission ${newStatus}`);
        if (selectedAffiliate) {
          fetchCommissions(selectedAffiliate._id);
        }
      }
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const viewAffiliateDetails = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    fetchCommissions(affiliate._id);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <ClockIcon className="h-3 w-3" /> },
      approved: { color: 'bg-green-100 text-green-800', icon: <CheckCircleIcon className="h-3 w-3" /> },
      rejected: { color: 'bg-red-100 text-red-800', icon: <XCircleIcon className="h-3 w-3" /> },
    };
    return badges[status] || badges.pending;
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif">Affiliates Management</h1>
        <p className="text-charcoal text-sm mt-1">Manage affiliate applications and commissions</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gold">
          <p className="text-charcoal text-xs uppercase tracking-wide">Total Affiliates</p>
          <p className="text-2xl font-bold text-dark">{affiliates.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gold">
          <p className="text-charcoal text-xs uppercase tracking-wide">Approved</p>
          <p className="text-2xl font-bold text-dark">{affiliates.filter(a => a.status === 'approved').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gold">
          <p className="text-charcoal text-xs uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-dark">{affiliates.filter(a => a.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gold">
          <p className="text-charcoal text-xs uppercase tracking-wide">Total Earnings Paid</p>
          <p className="text-2xl font-bold text-gold">
            PKR {affiliates.reduce((sum, a) => sum + (a.paidEarnings || 0), 0).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Mobile Card View - Visible on small screens */}
        <div className="block xl:hidden space-y-4 p-4">
          {affiliates.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No affiliates found
            </div>
          ) : (
            affiliates.map((affiliate) => {
              const statusBadge = getStatusBadge(affiliate.status);
              return (
                <div key={affiliate._id} className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-5 w-5 text-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{affiliate.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[180px]">{affiliate.email}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full flex-shrink-0 mt-1 ${statusBadge.color}`}>
                        {statusBadge.icon}
                        {affiliate.status}
                      </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Referral Code</span>
                    {affiliate.referralCode ? (
                      <span className="text-sm font-mono text-gold bg-gold/10 px-2 py-1 rounded">
                        {affiliate.referralCode}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Sales</span>
                    <span className="text-lg font-semibold text-gray-900">{affiliate.totalSales || 0}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <span className="text-lg font-semibold text-gold">
                      PKR {(affiliate.totalEarnings || 0).toFixed(0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Paid Earnings</span>
                    <span className="text-lg font-semibold text-green-600">
                      PKR {(affiliate.paidEarnings || 0).toFixed(0)}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      onClick={() => viewAffiliateDetails(affiliate)}
                      className="text-gold hover:text-gold/80 p-2 rounded-lg bg-white shadow-sm"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    {affiliate.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateAffiliateStatus(affiliate._id, 'approved')}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg bg-white shadow-sm"
                          title="Approve"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateAffiliateStatus(affiliate._id, 'rejected')}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-white shadow-sm"
                          title="Reject"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden xl:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No affiliates found
                  </td>
                </tr>
              ) : (
                affiliates.map((affiliate) => {
                  const statusBadge = getStatusBadge(affiliate.status);
                  return (
                    <tr key={affiliate._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{affiliate.name}</p>
                            <p className="text-xs text-gray-500">{affiliate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {affiliate.referralCode ? (
                          <span className="text-sm font-mono text-gold bg-gold/10 px-2 py-1 rounded">
                            {affiliate.referralCode}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{affiliate.totalSales || 0}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gold">
                        PKR {(affiliate.totalEarnings || 0).toFixed(0)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        PKR {(affiliate.paidEarnings || 0).toFixed(0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                          {statusBadge.icon}
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => viewAffiliateDetails(affiliate)}
                          className="text-gold hover:text-gold/80 p-1"
                          title="View Details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {affiliate.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAffiliateStatus(affiliate._id, 'approved')}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Approve"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => updateAffiliateStatus(affiliate._id, 'rejected')}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Reject"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedAffiliate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl font-serif">{selectedAffiliate.name}</h2>
                  <p className="text-xs text-charcoal">Affiliate Details</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAffiliate(null)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                    <MailIcon className="h-4 w-4" />
                    Email
                  </div>
                  <p className="text-dark text-xs md:text-sm font-medium">{selectedAffiliate.email}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                    <PhoneIcon className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="text-dark font-medium">{selectedAffiliate.phone}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                    <FaInstagram className="h-4 w-4" />
                    Social
                  </div>
                  <p className="text-dark font-medium">{selectedAffiliate.socialUsername || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                    <HashIcon className="h-4 w-4" />
                    Referral Code
                  </div>
                  <p className="font-mono text-gold font-medium">
                    {selectedAffiliate.referralCode || 'Not approved yet'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                    <TrendingUpIcon className="h-4 w-4" />
                    Commission Rate
                  </div>
                  <p className="text-dark font-medium">{selectedAffiliate.commissionRate}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                    <CreditCardIcon className="h-4 w-4" />
                    Payment Method
                  </div>
                  <p className="text-dark font-medium capitalize">
                    {selectedAffiliate.paymentMethod || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Payment Details Section - Dynamic based on payment method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* EasyPaisa Details */}
                {selectedAffiliate.paymentMethod === 'easypaisa' && selectedAffiliate.easypaisaNumber && (
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                      <CreditCardIcon className="h-4 w-4" />
                      EasyPaisa Account
                    </div>
                    <p className="text-dark font-medium">{selectedAffiliate.easypaisaNumber}</p>
                  </div>
                )}

                {/* JazzCash Details */}
                {selectedAffiliate.paymentMethod === 'jazzcash' && selectedAffiliate.jazzcashNumber && (
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                      <CreditCardIcon className="h-4 w-4" />
                      JazzCash Account
                    </div>
                    <p className="text-dark font-medium">{selectedAffiliate.jazzcashNumber}</p>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {selectedAffiliate.paymentMethod === 'bank_transfer' && (
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-charcoal text-sm mb-2">
                      <CreditCardIcon className="h-4 w-4" />
                      Bank Account Details
                    </div>
                    <div className="space-y-1 text-sm mt-2">
                      <p><span className="text-charcoal/60">Bank Name:</span> {selectedAffiliate.bankName || '-'}</p>
                      <p><span className="text-charcoal/60">Account Holder:</span> {selectedAffiliate.bankAccountName || '-'}</p>
                      <p><span className="text-charcoal/60">Account Number:</span> {selectedAffiliate.bankAccountNumber || '-'}</p>
                      {selectedAffiliate.bankIBAN && (
                        <p><span className="text-charcoal/60">IBAN:</span> {selectedAffiliate.bankIBAN}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Earnings Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg p-4 text-center">
                  <p className="text-charcoal text-sm">Total Sales</p>
                  <p className="text-2xl font-bold text-dark">{selectedAffiliate.totalSales || 0}</p>
                </div>
                <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg p-4 text-center">
                  <p className="text-charcoal text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold text-gold">
                    PKR {(selectedAffiliate.totalEarnings || 0).toFixed(0)} 
                  </p>
                </div>
                <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-lg p-4 text-center">
                  <p className="text-charcoal text-sm">Paid Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    PKR {(selectedAffiliate.paidEarnings || 0).toFixed(0)}  
                  </p>
                </div>
              </div>

              {/* Commission History */}
              <h3 className="font-serif text-lg mb-3">Commission History</h3>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr className="text-left">
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Subtotal</th>
                      <th className="px-4 py-3">Commission</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No commissions yet
                        </td>
                      </tr>
                    ) : (
                      commissions.map((comm) => (
                        <tr key={comm._id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gold">{comm.orderNumber}</td>
                          <td className="px-4 py-3">PKR {comm.orderSubtotal}</td>
                          <td className="px-4 py-3 text-gold font-medium">PKR {comm.commissionAmount.toFixed(0)}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getPaymentStatusBadge(comm.status)}`}>
                              {comm.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-charcoal">
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 space-x-2">
                            {comm.status === 'pending' && (
                              <button
                                onClick={() => updateCommissionStatus(comm._id, 'approved')}
                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Approve
                              </button>
                            )}
                            {comm.status === 'approved' && (
                              <button
                                onClick={() => updateCommissionStatus(comm._id, 'paid')}
                                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Mark Paid
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {commissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg">
                    No commissions yet
                  </div>
                ) : (
                  commissions.map((comm) => (
                    <div key={comm._id} className="bg-white rounded-lg border p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs text-gold font-medium">{comm.orderNumber}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getPaymentStatusBadge(comm.status)}`}>
                          {comm.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Subtotal</p>
                          <p className="font-medium">PKR {comm.orderSubtotal}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Commission</p>
                          <p className="text-gold font-medium">PKR {comm.commissionAmount.toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Date</p>
                          <p className="text-xs">{new Date(comm.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Actions</p>
                          <div className="flex gap-2 mt-1">
                            {comm.status === 'pending' && (
                              <button
                                onClick={() => updateCommissionStatus(comm._id, 'approved')}
                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Approve
                              </button>
                            )}
                            {comm.status === 'approved' && (
                              <button
                                onClick={() => updateCommissionStatus(comm._id, 'paid')}
                                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}