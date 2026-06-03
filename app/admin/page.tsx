'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  UserCheck,
  DollarSign,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalAffiliates: 0,
    pendingAffiliates: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      
      if (!res.ok) {
        router.push('/login');
        toast.error('Please login first');
        return;
      }
      
      const data = await res.json();
      
      if (!data.user || data.user?.role !== 'admin') {
        router.push('/');
        toast.error('Admin access only');
        return;
      }
      
      setUser(data.user);
      fetchStats();
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      let products = [];
      try {
        const productsRes = await fetch('/api/products');
        if (productsRes.ok) {
          products = await productsRes.json();
        }
      } catch (e) {}

      let orders = [];
      let pendingOrders = 0;
      let totalRevenue = 0;
      try {
        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          orders = await ordersRes.json();
          pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
          totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        }
      } catch (e) {}

      let affiliates = [];
      let pendingAffiliates = 0;
      try {
        const affiliatesRes = await fetch('/api/affiliates');
        if (affiliatesRes.ok) {
          affiliates = await affiliatesRes.json();
          pendingAffiliates = affiliates.filter((a: any) => a.status === 'pending').length;
        }
      } catch (e) {}

      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalAffiliates: Array.isArray(affiliates) ? affiliates.length : 0,
        pendingAffiliates: pendingAffiliates,
        pendingOrders: pendingOrders,
        totalRevenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-sand/50', iconColor: 'text-gold' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'bg-sand/50', iconColor: 'text-gold' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-sand/50', iconColor: 'text-gold' },
    { title: 'Total Affiliates', value: stats.totalAffiliates, icon: Users, color: 'bg-sand/50', iconColor: 'text-gold' },
    { title: 'Pending Affiliates', value: stats.pendingAffiliates, icon: UserCheck, color: 'bg-sand/50', iconColor: 'text-gold' },
    { title: 'Total Revenue', value: `PKR ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-sand/50', iconColor: 'text-gold' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-charcoal">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-serif text-dark">Dashboard</h1>
        <p className="text-charcoal text-sm">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-sand/50 rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-charcoal text-xs uppercase tracking-wide">{stat.title}</p>
                  <p className="text-xl font-bold text-dark mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}