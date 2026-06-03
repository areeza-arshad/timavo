'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const pathname = usePathname();
  
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAdminPage) {
    return null;
  }

  return (
    <footer className="bg-cream text-dark">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-8 md:py-8">
          <div className="text-gold font-serif text-lg md:text-center">
            Quick links
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 font-sans">
            <Link href="/shipping" className="text-dark/70 hover:text-gold text-sm transition-colors">
              Shipping policy
            </Link>
            <Link href="/privacy" className="text-dark/70 hover:text-gold text-sm transition-colors">
              Privacy policy
            </Link>
            <Link href="/terms-of-service" className="text-dark/70 hover:text-gold text-sm transition-colors">
              Terms of service
            </Link>
            <Link href="/refund-policy" className="text-dark/70 hover:text-gold text-sm transition-colors">
              Refund policy
            </Link>
            <Link href="/contact-information" className="text-dark/70 hover:text-gold text-sm transition-colors">
              Contact information
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex flex-col flex-1">
              <h3 className="text-lg font-serif text-gold mb-3">Subscribe to our emails</h3>
              <form className="relative max-w-md">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-5 py-3 text-dark bg-white border border-gold/30 rounded-full text-sm outline-none focus:border-gold transition-colors pr-28"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-gold text-dark px-5 py-2 rounded-full text-sm font-medium hover:bg-gold/80 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
            <div className="flex items-center md:items-end gap-4">
              <a href="https://www.facebook.com/profile.php?id=61586124353721&mibextid=ZbWKwL" target='_blank' className="text-dark/50 hover:text-gold transition-colors" aria-label="Facebook">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/timavo.official?igsh=MWNsd3Z2djc5MTB0" target='_blank' className="text-dark/50 hover:text-gold transition-colors" aria-label="Instagram">
                 <FaInstagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@timavo.official?_r=1&_d=ehed6b5520hfc1&sec_uid=MS4wLjABAAAAXtpy3pucYPypxR-YKa7cqB4CYpvCj_KxoWAplm03kBatKzy5d4I_NmPDxHASXFms&share_author_id=7503389442284241927&sharer_language=en&source=h5_m&u_code=ek906mk5i6gabm&timestamp=1779296874&user_id=7503389442284241927&sec_user_id=MS4wLjABAAAAXtpy3pucYPypxR-YKa7cqB4CYpvCj_KxoWAplm03kBatKzy5d4I_NmPDxHASXFms&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7468202655384700679&share_link_id=7de206f8-7adc-45a7-8151-f50e4aea4441&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1" className="text-dark/50 hover:text-gold transition-colors" target='_blank' aria-label="TikTok">
                <FaTiktok className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gold/20 pt-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-center text-dark/50 text-xs">
              © {new Date().getFullYear()} Timavo. All rights reserved.
            </p>
            <Link href="/contact">
              <div className='text-center text-dark text-sm capitalize'> 
                contact us
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}