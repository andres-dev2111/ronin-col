interface LogoProps {
  className?: string;
}

/**
 * RONIN wordmark with a minimalist red katana replacing the "I".
 * The katana blade is a thin vertical line with a small tsuba (guard)
 * and a wrapped handle — samurai spirit, brutalist execution.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span className={`text-display inline-flex items-baseline tracking-widest ${className ?? ""}`}>
      <span>RON</span>
      <Katana />
      <span>N</span>
    </span>
  );
}

function Katana() {
  return (
    <svg
      viewBox="0 0 12 60"
      aria-hidden="true"
      focusable="false"
      className="inline-block h-[0.95em] w-[0.28em] mx-[0.02em] translate-y-[0.05em]"
    >
      {/* Blade */}
      <rect x="5" y="2" width="2" height="34" fill="currentColor" className="text-primary" />
      {/* Kissaki tip */}
      <polygon points="5,2 7,2 6,0" fill="currentColor" className="text-primary" />
      {/* Tsuba (guard) */}
      <rect x="1" y="36" width="10" height="2" fill="currentColor" className="text-primary" />
      {/* Handle (tsuka) */}
      <rect x="4" y="38" width="4" height="20" fill="currentColor" className="text-foreground" />
      {/* Handle wraps */}
      <rect x="4" y="42" width="4" height="1" fill="currentColor" className="text-background" />
      <rect x="4" y="48" width="4" height="1" fill="currentColor" className="text-background" />
      <rect x="4" y="54" width="4" height="1" fill="currentColor" className="text-background" />
      {/* Kashira (pommel) */}
      <rect x="3" y="58" width="6" height="2" fill="currentColor" className="text-primary" />
    </svg>
  );
}
