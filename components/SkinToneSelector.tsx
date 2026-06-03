'use client';
import { useRouter } from 'next/navigation';
import { useSkinToneStore } from '@/store/skinToneStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SkinToneSelector({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { tone, setSkinTone } = useSkinToneStore();

  if (!isOpen) return null;

  const tones = [
    { id: 'fair', name: 'Fair', color: '#FDEBD0', description: 'Porcelain to ivory tones' },
    { id: 'medium', name: 'Medium', color: '#E8C5A0', description: 'Beige to olive tones' },
    { id: 'dark', name: 'Dark', color: '#8B5A2B', description: 'Tan to deep tones' },
  ];

  const handleSelect = (toneId: 'fair' | 'medium' | 'dark') => {
    setSkinTone(toneId);
    onClose();
    router.push(`/shop?skinTone=${toneId}`);
  };

  const handleClear = () => {
    setSkinTone(null);
    onClose();
    router.push('/shop');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-cream w-full max-w-md mx-auto rounded-2xl shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-xl md:text-2xl font-serif">Find Your Perfect Match</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-charcoal" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <p className="text-charcoal text-sm mb-6">
            Select your skin tone to see jewelry recommendations that complement your natural beauty
          </p>
          
          <div className="space-y-3 mb-6">
            {tones.map((toneOption) => (
              <button
                key={toneOption.id}
                onClick={() => handleSelect(toneOption.id as any)}
                className={`w-full p-3 md:p-4 border rounded-xl transition-all duration-300 group ${
                  tone === toneOption.id 
                    ? 'border-gold bg-gold/5' 
                    : 'border-gray-200 hover:border-gold'
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: toneOption.color }}
                  />
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm md:text-base group-hover:text-gold transition">
                      {toneOption.name}
                    </p>
                    <p className="text-xs text-charcoal">{toneOption.description}</p>
                  </div>
                  {tone === toneOption.id && (
                    <svg className="w-5 h-5 text-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {tone && (
            <button
              onClick={handleClear}
              className="w-full mb-4 py-2 text-sm text-charcoal hover:text-red-500 transition border border-gray-200 hover:border-red-200 rounded-lg"
            >
              Clear selected tone
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 md:py-3 bg-dark text-cream rounded-lg hover:bg-gold hover:text-dark transition-all duration-300 text-sm font-medium"
          >
            Close
          </button>
          <p className="text-xs text-charcoal/50 text-center mt-4">
            Select a tone to see personalized recommendations
          </p>
        </div>
      </div>
    </div>
  );
}