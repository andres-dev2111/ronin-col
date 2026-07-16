const WHATSAPP_NUMBER = "573001234567"; // +57 300 123 4567
const WHATSAPP_MSG = "Hola RONIN, quiero saber más sobre sus productos.";

export function WhatsAppFloat() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 h-14 w-14 md:h-16 md:w-16 rounded-full bg-[#25D366] hover:bg-[#20b858] shadow-2xl flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-8 w-8 md:h-9 md:w-9 text-white"
        fill="currentColor"
      >
        <path d="M19.11 17.63c-.28-.14-1.64-.81-1.9-.9-.25-.09-.44-.14-.62.14-.19.28-.71.9-.87 1.08-.16.19-.32.21-.6.07-.28-.14-1.18-.43-2.25-1.39-.83-.74-1.4-1.65-1.56-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.62-1.5-.85-2.06-.22-.54-.45-.47-.62-.48h-.53c-.19 0-.49.07-.75.35-.25.28-.98.96-.98 2.34s1 2.72 1.14 2.9c.14.19 1.98 3.03 4.8 4.25.67.29 1.19.46 1.6.59.67.21 1.28.18 1.77.11.54-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.11-.25-.18-.53-.32zM16.02 5.33c-5.9 0-10.7 4.8-10.7 10.7 0 1.88.49 3.72 1.43 5.34L5 27.33l6.13-1.6a10.65 10.65 0 0 0 4.88 1.18h.01c5.9 0 10.7-4.8 10.7-10.7s-4.8-10.88-10.7-10.88zm0 19.55h-.01a8.86 8.86 0 0 1-4.52-1.24l-.32-.19-3.63.95.97-3.54-.21-.34a8.86 8.86 0 0 1-1.36-4.72c0-4.9 3.99-8.89 8.9-8.89 2.37 0 4.6.93 6.28 2.61a8.83 8.83 0 0 1 2.6 6.29c0 4.9-3.99 8.87-8.7 8.87z" />
      </svg>
    </a>
  );
}
