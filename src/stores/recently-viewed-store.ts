import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_RECENT = 8;

interface RecentlyViewedState {
  ids: string[];
  record: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      record: (id) =>
        set((state) => ({
          ids: [id, ...state.ids.filter((x) => x !== id)].slice(0, MAX_RECENT),
        })),
    }),
    { name: "alpha-boguslav-recent" }
  )
);
