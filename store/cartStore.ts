// // store/cartStore.ts
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export interface CartItem {
//   productId: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image: string;
//   selectedSize?: string;
// }

// interface CartStore {
//   items: CartItem[];
//   addItem: (item: CartItem) => void;
//   removeItem: (productId: string, selectedSize?: string) => void;
//   updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
//   clearCart: () => void;
//   getTotalItems: () => number;
//   getTotalPrice: () => number;
// }

// export const useCartStore = create<CartStore>()(
//   persist(
//     (set, get) => ({
//       items: [],
      
//       addItem: (item) => {
//         const { items } = get();
//         // ✅ Check both productId AND selectedSize
//         const existingItem = items.find(i => 
//           i.productId === item.productId && i.selectedSize === item.selectedSize
//         );
        
//         if (existingItem) {
//           set({
//             items: items.map(i =>
//               i.productId === item.productId && i.selectedSize === item.selectedSize
//                 ? { ...i, quantity: i.quantity + item.quantity }
//                 : i
//             )
//           });
//         } else {
//           set({ items: [...items, item] });
//         }
//       },
      
//       removeItem: (productId, selectedSize) => {
//         set({ 
//           items: get().items.filter(i => 
//             i.productId !== productId || 
//             (selectedSize && i.selectedSize !== selectedSize)
//           ) 
//         });
//       },
      
//       updateQuantity: (productId, quantity, selectedSize) => {
//         if (quantity <= 0) {
//           get().removeItem(productId, selectedSize);
//         } else {
//           set({
//             items: get().items.map(i =>
//               i.productId === productId && i.selectedSize === selectedSize
//                 ? { ...i, quantity }
//                 : i
//             )
//           });
//         }
//       },
      
//       clearCart: () => set({ items: [] }),
      
//       getTotalItems: () => {
//         return get().items.reduce((total, item) => total + item.quantity, 0);
//       },
      
//       getTotalPrice: () => {
//         return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
//       },
//     }),
//     {
//       name: 'cart-storage',
//     }
//   )
// );



// store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => 
          i.productId === item.productId && i.selectedSize === item.selectedSize
        );
        
        if (existingItem) {
          set({
            items: items.map(i =>
              i.productId === item.productId && i.selectedSize === item.selectedSize
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          });
        } else {
          set({ items: [...items, item] });
        }
      },
      
      removeItem: (productId, selectedSize) => {
        set({ 
          items: get().items.filter(i => 
            !(i.productId === productId && i.selectedSize === selectedSize)
          ) 
        });
      },
      
      updateQuantity: (productId, quantity, selectedSize) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedSize);
        } else {
          set({
            items: get().items.map(i =>
              i.productId === productId && i.selectedSize === selectedSize
                ? { ...i, quantity }
                : i
            )
          });
        }
      },
      
      // clearCart: () => set({ items: [] }),
      clearCart: () => { 
        console.trace('🟡 Cart cleared! Who called clearCart?');
        set({ items: [] }); 
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);