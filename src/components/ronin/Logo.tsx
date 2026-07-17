import logoSrc from "@/assets/ronin-logo.png";

interface LogoProps {
  className?: string;
}

/**
 * Official RONIN wordmark (transparent PNG with the red katana replacing the "I").
 */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="RONIN"
      className={`h-full w-auto object-contain select-none ${className ?? ""}`}
      draggable={false}
    />
  );
}
