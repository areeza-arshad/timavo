'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Sale {
  _id: string;
  name: string;
  discountType: string;
  discountValue: number;
  products: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/admin/sales');
      const data = await res.json();
      setSales(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSale = (id: string, name: string) => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Delete "{name}"?</span>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' });
              if (res.ok) {
                toast.success('Sale deleted');
                setSales(prev => prev.filter(sale => sale._id !== id));
              } else {
                toast.error('Failed to delete');
              }
            } catch (error) {
              toast.error('Something went wrong');
            }
          }}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
        >
          No
        </button>
      </div>
    ), {
      duration: 5000,
      position: 'top-center',
    });
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Link
          href="/admin/sales/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + New Sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded">
          <p className="text-gray-500">No sales created yet</p>
          <Link href="/admin/sales/new" className="text-blue-600 hover:underline mt-2 inline-block">
            Create your first sale →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <div key={sale._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{sale.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {sale.discountType === 'percentage' 
                      ? `${sale.discountValue}% OFF` 
                      : `PKR ${sale.discountValue} OFF`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {sale.products.length} product(s) | 
                    {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => deleteSale(sale._id, sale.name)} className="text-red-500">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}