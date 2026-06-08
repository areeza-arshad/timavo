'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  FolderTree, 
  Star, 
  PenTool,
  LogOut,
  ShoppingCart,
  Settings,
  PercentIcon,
} from 'lucide-react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

interface AdminSidebarProps {
  user: any;
  onLogout: () => void;
}

export default function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
    onLogout();
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Affiliates', path: '/admin/affiliates', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Customizations', path: '/admin/customizations', icon: PenTool },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'FAQs', path: '/admin/faqs', icon: QuestionMarkCircleIcon },
    { name: 'Sales', path: '/admin/sales', icon: PercentIcon },
    { name: 'Settings', path: '/admin/settings', icon: Settings },

  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  return (
    <div className="h-full w-full md:w-64 bg-dark text-cream flex flex-col shadow-xl">
      <div className="p-6 border-b border-cream/20">
        <h1 className="text-xl font-serif">Timavo Admin</h1>
      </div>

      <div className="p-6 border-b border-cream/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
            <span className="text-gold text-lg font-bold uppercase">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-cream/50">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto custom-scroll">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gold text-dark'
                      : 'hover:bg-cream/10 text-cream'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-6 border-t border-cream/20">
        <button
          onClick={() => window.location.href = '/shop'}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-3 bg-cream/10 rounded-lg hover:bg-cream/20 transition text-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          Back to Shop
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}