'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserIcon } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [customizations, setCustomizations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserAndOrders();
  }, []);

  const fetchUserAndOrders = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const ordersRes = await fetch(`/api/orders?email=${userData.user.email}`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      const customRes = await fetch(`/api/customizations?email=${userData.user.email}`);
      if (customRes.ok) {
        const customData = await customRes.json();
        setCustomizations(customData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand/20">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

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

  return (
    <div className="min-h-screen bg-sand/20 pt-32 pb-24">
      <div className="container-custom">
        <h1 className="text-3xl md:text-4xl font-serif text-center mb-2">My Account</h1>
        <p className="text-center text-charcoal mb-12">Welcome back, {user.name}</p>
        <div className="flex flex-wrap justify-center gap-4 mb-8 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-2 transition ${
              activeTab === 'profile'
                ? 'text-gold border-b-2 border-gold'
                : 'text-charcoal hover:text-gold'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 transition ${
              activeTab === 'orders'
                ? 'text-gold border-b-2 border-gold'
                : 'text-charcoal hover:text-gold'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('customizations')}
            className={`px-6 py-2 transition ${
              activeTab === 'customizations'
                ? 'text-gold border-b-2 border-gold'
                : 'text-charcoal hover:text-gold'
            }`}
          >
            Customization Requests ({customizations.length})
          </button>
        </div>

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white p-6 md:p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl"><UserIcon/></span>
                </div>
                <h2 className="text-xl font-serif">{user.name}</h2>
                <p className="text-charcoal text-sm">{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-charcoal mb-1">Full Name</label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-charcoal mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-charcoal mb-1">Account Type</label>
                  <input
                    type="text"
                    value={user.role === 'admin' ? 'Administrator' : 'Regular Customer'}
                    disabled
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 rounded-none"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full md:w-auto px-6 py-2 bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {orders.length === 0 ? (
              <div className="bg-white p-8 text-center shadow-sm">
                <h3 className="text-xl font-serif mb-2">No Orders Yet</h3>
                <p className="text-charcoal mb-6">You haven't placed any orders yet.</p>
                <Link href="/shop" className="btn-primary inline-block">
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white p-4 md:p-6 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-charcoal">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-medium">PKR {order.totalAmount}</p>
                        <p className={`text-xs px-2 py-1 inline-block ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm font-medium mb-2">Items:</p>
                      <div className="space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>PKR {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 mt-4 pt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal">Payment Status:</span>
                        <span className="capitalize">{order.paymentStatus}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'customizations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {customizations.length === 0 ? (
              <div className="bg-white p-8 text-center shadow-sm">
                <h3 className="text-xl font-serif mb-2">No Customization Requests</h3>
                <p className="text-charcoal mb-6">You haven't submitted any customization requests yet.</p>
                <Link href="/customize" className="btn-primary inline-block">
                  Design Your Dream Jewelry
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {customizations.map((req) => (
                  <div key={req._id} className="bg-white p-4 md:p-6 shadow-sm">
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-charcoal">Request #{req._id.slice(-8)}</p>
                        <p className="text-xs text-gray-400">
                          Submitted: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${getStatusBadge(req.status)}`}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-charcoal text-xs">Product Type</p>
                        <p className="font-medium">{req.productType}</p>
                      </div>
                      <div>
                        <p className="text-charcoal text-xs">Metal Type</p>
                        <p className="font-medium">{req.metalType}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-charcoal text-xs">Your Message</p>
                      <p className="text-dark text-sm mt-1 bg-gray-50 p-3 rounded">
                        {req.message}
                      </p>
                    </div>
                    
                    {req.adminNotes && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-gold text-sm font-medium">Team Response:</p>
                        <p className="text-dark text-sm mt-1 italic">{req.adminNotes}</p>
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
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}