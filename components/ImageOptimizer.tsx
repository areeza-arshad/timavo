'use client'; // 👈 Important! 

import { useEffect } from 'react';

export default function ImageOptimizer() {
  useEffect(() => {
    // Cloudinary URLs mein automatically f_auto,q_auto add karein
    const optimizeImages = () => {
      document.querySelectorAll('img[src*="res.cloudinary.com"]').forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.includes('f_auto') && !src.includes('q_auto')) {
          // URL mein /upload/ ke baad f_auto,q_auto add karein
          const optimizedSrc = src.replace('/upload/', '/upload/f_auto,q_auto,c_limit,w_800/');
          img.setAttribute('src', optimizedSrc);
        }
      });
    };

    // Pehle se existing images optimize karein
    optimizeImages();

    // Naye images ke liye observer
    const observer = new MutationObserver(() => {
      optimizeImages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null; // Ye component kuch render nahi karega
}