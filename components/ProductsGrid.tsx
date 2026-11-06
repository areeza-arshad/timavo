'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const HOME_LIMIT = 6; // homepage par kitne naye products dikhane hain

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  isSale?: boolean;
  category?: string;
  createdAt?: string;
}

// Naye pehle: createdAt ho to us se, warna _id se (MongoDB ki _id mein time hota hai)
function sortNewestFirst(list: Product[]) {
  return [...list].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b._id.localeCompare(a._id);
  });
}

function GridContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const newest = sortNewestFirst(products);

  // Category select ho to us category ke saare products, warna sirf 6 naye
  const visible = selectedCategory
    ? newest.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    : newest.slice(0, HOME_LIMIT);

  return (
    <section className="bg-sand/30 px-4 py-10 md:px-8">
      <h2 className="text-3xl md:text-4xl font-serif font-light text-dark text-center mb-10 md:mb-12">
        {selectedCategory ?? 'Explore our products'}
        <div className="w-16 h-px bg-gold mx-auto mt-4" />
        <p className="text-charcoal text-sm max-w-md mx-auto font-sans mt-4">
          See what's new here, Explore our new arrival
        </p>
      </h2>
      

      {loading ? (
        <p className="text-center text-charcoal">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-center text-charcoal">
          No products founds
        </p>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 mt-5">
          {visible.map((p) => (
            <Link
              key={p._id}
              href={`/product/${p._id}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="truncate font-medium text-dark">{p.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="text-dark">Rs. {p.price}</span>
                  {p.isSale && p.originalPrice && (
                    <span className="text-charcoal line-through">
                      Rs. {p.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!selectedCategory && !loading && products.length > HOME_LIMIT && (
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-block border border-dark text-dark px-8 py-3 hover:bg-dark hover:text-cream transition-all duration-300 text-sm tracking-wide"
          >
            New Arrivals →
          </Link>
        </div>
      )}
    </section>
  );
}

// Ye khud products fetch karta hai, to bas <ProductsGrid /> likhna kafi hai
export default function ProductsGrid() {
  return (
    <Suspense fallback={null}>
      <GridContent />
    </Suspense>
  );
}