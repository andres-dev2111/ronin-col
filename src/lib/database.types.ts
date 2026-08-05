// Auto-generated types matching the Supabase schema.
// Regenerate with: npx supabase gen types typescript --local > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          handle: string;
          title: string;
          description: string | null;
          images: Json; // [{url: string, altText: string | null}]
          tags: string[];
          status: "active" | "draft" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string | null;
          title: string;
          price: number;
          compare_at_price: number | null;
          currency_code: string;
          selected_options: Json; // [{name: string, value: string}]
          position: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_variants"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
      };
      inventory: {
        Row: {
          id: string;
          variant_id: string;
          quantity: number;
          reserved: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inventory"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inventory"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          document_type: "CC" | "CE" | "NIT" | "PAS";
          document_number: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          department: string;
          postal_code: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          order_number: number;
          customer_id: string | null;
          status: "pending" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";
          payment_status: "pending" | "approved" | "rejected" | "refunded" | "in_process";
          payment_method: string | null;
          payment_reference: string | null;
          subtotal: number;
          shipping_cost: number;
          total: number;
          currency_code: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["orders"]["Row"], "id" | "order_number" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          variant_id: string;
          product_title: string;
          variant_title: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: Omit<Database["public"]["Tables"]["order_items"]["Row"], "id" | "total_price">;
        Update: never;
      };
      shipping_config: {
        Row: {
          id: string;
          label: string;
          fixed_cost: number;
          free_shipping_above: number | null;
          currency_code: string;
          active: boolean;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["shipping_config"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["shipping_config"]["Insert"]>;
      };
    };
    Views: {
      inventory_available: {
        Row: {
          variant_id: string;
          quantity: number;
          reserved: number;
          available: number;
        };
      };
    };
  };
}
