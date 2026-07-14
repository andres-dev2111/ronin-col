import { useState, type ReactNode } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Item {
  title: string;
  icon?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
}

interface Props {
  items: Item[];
  className?: string;
}

export function Accordion({ items, className }: Props) {
  return (
    <div className={cn("border-t border-border/60", className)}>
      {items.map((it) => (
        <AccordionRow key={it.title} item={it} />
      ))}
    </div>
  );
}

function AccordionRow({ item }: { item: Item }) {
  const [open, setOpen] = useState(!!item.defaultOpen);
  return (
    <div className="border-b border-border/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left text-sm uppercase tracking-[0.15em] font-semibold hover:text-primary transition"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
          {item.title}
        </span>
        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden text-sm text-muted-foreground leading-relaxed">
          {item.content}
        </div>
      </div>
    </div>
  );
}
