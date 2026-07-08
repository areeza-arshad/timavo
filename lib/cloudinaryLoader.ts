interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({ src, width, quality }: CloudinaryLoaderProps) {
  if (src.includes('f_auto') && src.includes('q_auto')) {
    return src;
  }


  if (src.includes('res.cloudinary.com')) {
    const params = [
      'f_auto',
      'q_auto',
      'c_limit',
      `w_${width}`,
      `q_${quality || 'auto'}`
    ];
    
    const parts = src.split('/upload/');
    
    if (parts.length === 2) {
      return `${parts[0]}/upload/${params.join(',')}/${parts[1]}`;
    }
  }

  return src;
}