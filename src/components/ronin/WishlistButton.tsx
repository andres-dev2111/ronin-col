import { toast } from "sonner";
import { KamonIcon } from "./KamonIcon";
import { useWishlistStore } from "@/stores/wishlistStore";
import { cn } from "@/lib/utils";

interface Props {
  productId: string;
  productTitle?: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, productTitle, className, size = "md" }: Props) {
  const has = useWishlistStore((s) => s.ids.includes(productId));
  const toggle = useWishlistStore((s) => s.toggle);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(productId);
    if (!has) toast.success(`Añadido a favoritos${productTitle ? `: ${productTitle}` : ""}`);
  };

  return (
    <button
      onClick={handle}
      aria-label={has ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={has}
      className={cn(
        "grid place-items-center rounded-full bg-background/90 backdrop-blur-sm border border-border/60 hover:border-primary transition",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        className,
      )}
    >
      <KamonIcon filled={has} className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </button>
  );
}
