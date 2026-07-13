interface LogoProps {
  className?: string;
}

/**
 * RONIN wordmark. The "I" is replaced by a solid red katana silhouette
 * (handle up, blade down) inspired by the brand reference.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={`text-display inline-flex items-center tracking-widest leading-none ${className ?? ""}`}
    >
      <span>RON</span>
      <Katana />
      <span>N</span>
    </span>
  );
}

function Katana() {
  return (
    <svg
      viewBox="0 0 20 120"
      aria-hidden="true"
      focusable="false"
      className="inline-block h-[1.15em] w-[0.34em] mx-[0.04em] text-primary"
      fill="currentColor"
    >
      {/* Kashira (pommel) */}
      <rect x="7" y="2" width="6" height="3" rx="0.5" />
      {/* Handle (tsuka) with diamond wrap */}
      <rect x="7.5" y="5" width="5" height="26" />
      <g fill="#0A0A0A">
        <polygon points="10,7 12,10 10,13 8,10" />
        <polygon points="10,14 12,17 10,20 8,17" />
        <polygon points="10,21 12,24 10,27 8,24" />
      </g>
      {/* Tsuba (guard) */}
      <rect x="3" y="31" width="14" height="3" rx="0.5" />
      {/* Habaki collar */}
      <rect x="8" y="34" width="4" height="2" />
      {/* Blade — slight curve toward the tip */}
      <path d="M9 36 L11 36 L12 108 L10 118 L8 108 Z" />
    </svg>
  );
}
