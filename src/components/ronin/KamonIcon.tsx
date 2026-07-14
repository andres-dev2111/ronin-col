import { cn } from "@/lib/utils";

interface KamonIconProps {
  filled?: boolean;
  className?: string;
}

/**
 * Kamon-inspired 5-petal Japanese flower crest.
 * Outlined by default, fully filled with the brand red when `filled`.
 */
export function KamonIcon({ filled = false, className }: KamonIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("h-5 w-5", filled ? "text-primary" : "text-current", className)}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
      strokeLinejoin="round"
    >
      {/* Five petals arranged radially around center */}
      <g transform="translate(24 24)">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            transform={`rotate(${deg})`}
            d="M0 -18 C 5.5 -18 9 -13 9 -8 C 9 -3 5 0 0 0 C -5 0 -9 -3 -9 -8 C -9 -13 -5.5 -18 0 -18 Z"
          />
        ))}
        {/* center disc */}
        <circle r="3.4" fill={filled ? "var(--color-background)" : "currentColor"} stroke="none" />
      </g>
    </svg>
  );
}
