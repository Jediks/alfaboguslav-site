import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuoteRequest {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

interface QuoteState {
  quotes: QuoteRequest[];
  addQuote: (quote: QuoteRequest) => void;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      quotes: [],
      addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
    }),
    { name: "alpha-boguslav-quotes" }
  )
);
