'use client';
import { useEffect, useState } from 'react';
import { EyeIcon, PackageIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon, CreditCardIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    selectedSize?: string;
  }>;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  paymentScreenshot?: string;
  referralCode?: string;
  status: string;
  orderNote?: string;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    setUpdatingPayment(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      if (res.ok) {
        toast.success(`Payment status updated to ${newStatus.replace('_', ' ')}`);
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            paymentStatus: newStatus,
          });
        }
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <ClockIcon className="h-3 w-3" /> },
      processing: { color: 'bg-blue-100 text-blue-800', icon: <PackageIcon className="h-3 w-3" /> },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: <TruckIcon className="h-3 w-3" /> },
      delivered: { color: 'bg-green-100 text-green-800', icon: <CheckCircleIcon className="h-3 w-3" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircleIcon className="h-3 w-3" /> },
    };
    return badges[status] || badges.pending;
  };

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800',
      advance_paid: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
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
        <h1 className="text-2xl font-serif">Orders Management</h1>
        <p className="text-charcoal text-sm mt-1">View and manage customer orders</p>
      </div>

      <div className="hidden xl:block bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gold">
                      {order.orderNumber}
                    </td>
                    <td className="px-2 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer.name}</p>
                        <p className="text-xs text-gray-500">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-sm text-gray-900">
                      PKR {order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-2 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusBadge.color}`}>
                        {statusBadge.icon}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-gold hover:text-gold/80 inline-flex items-center gap-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="xl:hidden space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusBadge = getStatusBadge(order.status);
            return (
              <div key={order._id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono text-gold text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-gold p-1"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-2 mb-3">
                  <p className="text-sm font-medium text-dark">{order.customer.name}</p>
                  <p className="text-xs text-gray-500">{order.customer.email}</p>
                  <p className="text-gold font-medium text-sm">PKR {order.totalAmount.toFixed(2)}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getPaymentStatusBadge(order.paymentStatus)}`}>
                    {order.paymentStatus.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${statusBadge.color}`}>
                    {statusBadge.icon}
                    {order.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-serif">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-charcoal uppercase tracking-wide">Order Number</p>
                  <p className="text-sm font-mono text-gold mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-charcoal uppercase tracking-wide">Order Date</p>
                  <p className="text-sm text-dark mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-charcoal uppercase tracking-wide">Payment Method</p>
                  <p className="text-sm text-dark mt-1 capitalize">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-charcoal uppercase tracking-wide">Payment Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getPaymentStatusBadge(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {selectedOrder.transactionId && (
                  <div>
                    <p className="text-xs text-charcoal uppercase tracking-wide">Transaction ID</p>
                    <p className="text-sm text-dark mt-1">{selectedOrder.transactionId}</p>
                  </div>
                )}
                {selectedOrder.referralCode && (
                  <div>
                    <p className="text-xs text-charcoal uppercase tracking-wide">Referral Code</p>
                    <p className="text-sm text-gold font-mono mt-1">{selectedOrder.referralCode}</p>
                  </div>
                )}
              </div>

              {selectedOrder.paymentScreenshot && (
                <div className="border-t pt-4">
                  <h3 className="font-serif text-lg mb-3">Payment Screenshot</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <button
                      onClick={() => window.open(selectedOrder.paymentScreenshot, '_blank')}
                      className="flex items-center gap-2 text-gold hover:text-gold/80 transition mb-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Open Full Image
                    </button>
                    <img 
                      src={selectedOrder.paymentScreenshot} 
                      alt="Payment Screenshot" 
                      className="mt-2 max-w-full max-h-64 object-contain rounded-lg border cursor-pointer"
                      onClick={() => window.open(selectedOrder.paymentScreenshot, '_blank')}
                    />
                  </div>
                </div>
              )}
              {selectedOrder.paymentStatus !== 'completed' && (
                <div className="bg-gold/10 rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm font-medium text-dark">Payment Status</p>
                      <p className="text-xs text-charcoal mt-1">
                        Current: <span className="capitalize">{selectedOrder.paymentStatus.replace('_', ' ')}</span>
                      </p>
                      <p className="text-xs text-gold mt-1">
                        Advance Paid: PKR {selectedOrder.advanceAmount.toFixed(2)}
                      </p>
                     
                      {selectedOrder.totalAmount >= 1000 && selectedOrder.paymentStatus === 'advance_paid' && (
                        <p className="text-xs text-charcoal mt-1">
                          Remaining: PKR {selectedOrder.remainingAmount.toFixed(2)} (to collect on delivery)
                        </p>
                      )}
                      
                      {selectedOrder.totalAmount < 1000 && (
                        <p className="text-xs text-green-600 mt-1">
                          Full advance paid: PKR {selectedOrder.totalAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {selectedOrder.paymentStatus === 'pending' && (
                        <button
                          onClick={() => updatePaymentStatus(selectedOrder._id, 'advance_paid')}
                          disabled={updatingPayment}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center gap-2"
                        >
                          <CreditCardIcon className="h-4 w-4" />
                          Mark as Advance Paid
                        </button>
                      )}
                      {selectedOrder.paymentStatus === 'advance_paid' && (
                        <button
                          onClick={() => updatePaymentStatus(selectedOrder._id, 'completed')}
                          disabled={updatingPayment}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition flex items-center gap-2"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          {selectedOrder.totalAmount >= 1000 ? 'Mark as Fully Paid' : 'Mark as Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="border-t pt-4">
                <h3 className="font-serif text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-charcoal">Name</p>
                    <p className="text-sm text-dark">{selectedOrder.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal">Email</p>
                    <p className="text-sm text-dark">{selectedOrder.customer.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal">Phone</p>
                    <p className="text-sm text-dark">{selectedOrder.customer.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-charcoal">Delivery Address</p>
                    <p className="text-sm text-dark">{selectedOrder.customer.address}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.orderNote && (
                <div className="border-t pt-4">
                  <h3 className="font-serif text-lg mb-2">Order Notes</h3>
                  <p className="text-sm text-charcoal bg-gray-50 p-3 rounded-lg">{selectedOrder.orderNote}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-serif text-lg mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-dark">{item.name}</p>
                        <div className="flex gap-3 text-xs text-charcoal mt-1">
                          <span>Qty: {item.quantity}</span>
                          {item.selectedSize && (
                            <span className="text-gold">Size: {item.selectedSize}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gold font-medium">PKR {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal">Subtotal</span>
                    <span className="text-dark">PKR {(selectedOrder.totalAmount - 250).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal">Shipping</span>
                    <span className="text-dark">PKR 250</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal">Advance Paid</span>
                    <span className="text-gold font-medium">PKR {selectedOrder.advanceAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal">Remaining</span>
                    <span className="text-dark">PKR {selectedOrder.remainingAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-serif text-base">Total</span>
                    <span className="font-serif text-xl text-gold">PKR {selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-serif text-lg mb-3">Update Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder._id, status)}
                      disabled={updatingStatus || selectedOrder.status === status}
                      className={`px-3 py-1.5 text-sm rounded-full capitalize transition ${
                        selectedOrder.status === status
                          ? 'bg-gold text-dark'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}