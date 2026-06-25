import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuotePrefillData = {
  referenceId: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
};

interface QuotePrefillState {
  active: QuotePrefillData | null;
  setFromQuote: (quote: QuotePrefillData) => void;
  clear: () => void;
}

export const useQuotePrefillStore = create<QuotePrefillState>()(
  persist(
    (set) => ({
      active: null,
      setFromQuote: (quote) => set({ active: quote }),
      clear: () => set({ active: null }),
    }),
    { name: "alpha-boguslav-quote-prefill" }
  )
);
