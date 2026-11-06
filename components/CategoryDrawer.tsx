'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoryDrawer({
  buttonClassName = 'fixed top-5 left-32 z-40 hidden md:block',
}: {
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const unique = Array.from(
            new Set(
              data.map((p: { category?: string }) => p.category).filter(Boolean)
            )
          ) as string[];
          setCategories(unique);
        }
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  return (
    <>
      {/* ☰ button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open categories"
        className={`${buttonClassName} text-gold transition hover:text-gold/60`}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dark overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-[70] h-full w-72 overflow-y-auto bg-cream p-6 shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close categories"
          className="mb-6"
        >
          <svg className="h-6 w-6 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-4 font-serif text-xl text-dark">Categories</h2>

        <ul className="space-y-3">
          <li>
            <Link href="/" onClick={() => setOpen(false)} className="font-sans text-dark transition hover:text-gold">
              All Products
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c}>
              <Link
                href={`/?category=${encodeURIComponent(c)}`}
                onClick={() => setOpen(false)}
                className="font-sans text-dark transition hover:text-gold"
              >
                {c}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}