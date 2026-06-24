export type UserRole = "client" | "admin";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "completed";

export type PaymentMethod = "online" | "invoice";

export type PackagingType = "cardboard" | "tube" | "wood" | "metal";

export interface SweetCompositionItem {
  name_uk: string;
  name_en: string;
  weight_grams: number;
  image_url?: string;
}

export interface PricingTier {
  id: string;
  product_id: string;
  min_quantity: number;
  price: number;
}

export interface Product {
  id: string;
  title_uk: string;
  title_en: string;
  desc_uk: string;
  desc_en: string;
  images: string[];
  packaging_type: PackagingType;
  composition: SweetCompositionItem[];
  weight_grams: number;
  b2b_tags: string[];
  sweet_types: string[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  company_name: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  reference_id: string | null;
  user_id: string | null;
  status: OrderStatus;
  total_estimated_price: number;
  payment_method: PaymentMethod;
  delivery_address: string;
  company_name: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  branding_logo_url: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  branding_logo_url: string | null;
}

export interface QuoteRequest {
  id: string;
  reference_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

export interface SavedAsset {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "created_at"> & { created_at?: string };
        Update: Partial<UserProfile>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Product>;
      };
      pricing_tiers: {
        Row: PricingTier;
        Insert: Omit<PricingTier, "id"> & { id?: string };
        Update: Partial<PricingTier>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id"> & { id?: string };
        Update: Partial<OrderItem>;
      };
      quote_requests: {
        Row: QuoteRequest;
        Insert: Omit<QuoteRequest, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<QuoteRequest>;
      };
      saved_assets: {
        Row: SavedAsset;
        Insert: Omit<SavedAsset, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<SavedAsset>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
