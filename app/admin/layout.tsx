'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    checkAuth();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  };

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
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-sand/20">
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 md:hidden bg-dark text-cream p-2 rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={`
          fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:w-64 w-full
        `}
      >
        <AdminSidebar user={user} onLogout={handleLogout} />
      </div>

      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-35 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`md:ml-64 transition-all duration-300 ${isSidebarOpen && isMobile ? 'overflow-hidden' : ''}`}>
        <div className="bg-cream shadow-md px-4 md:px-8 pt-4 pb-4 flex justify-center items-center">
          <div className="md:hidden">
            {/* Spacer for mobile menu button */}
          </div>
          <h1 className="text-lg font-serif text-center text-gold">Admin Panel</h1>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}