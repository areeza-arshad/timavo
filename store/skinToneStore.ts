// store/skinToneStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SkinToneStore {
  tone: 'fair' | 'medium' | 'dark' | null;
  setSkinTone: (tone: 'fair' | 'medium' | 'dark' | null) => void;
}

export const useSkinToneStore = create<SkinToneStore>()(
  persist(
    (set) => ({
      tone: null,
      setSkinTone: (tone) => set({ tone }),
    }),
    { name: 'skin-tone-storage' }
  )
);