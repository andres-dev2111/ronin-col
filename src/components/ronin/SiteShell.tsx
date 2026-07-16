import { useState, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./CartDrawer";
import { WhatsAppFloat } from "./WhatsAppFloat";
import { useCartSync } from "@/hooks/useCartSync";
import { Toaster } from "@/components/ui/sonner";

export function SiteShell({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  useCartSync();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header onOpenCart={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppFloat />
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}
