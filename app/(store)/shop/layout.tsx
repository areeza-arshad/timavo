'use client';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream min-h-screen">
      {children}
    </div>
  );
}