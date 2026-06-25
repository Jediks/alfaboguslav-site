import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE = 3;

interface CompareState {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => {
          if (state.ids.includes(id)) {
            return { ids: state.ids.filter((x) => x !== id) };
          }
          if (state.ids.length >= MAX_COMPARE) {
            return state;
          }
          return { ids: [...state.ids, id] };
        }),
      remove: (id) =>
        set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "alpha-boguslav-compare" }
  )
);
