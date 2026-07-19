const WHATSAPP_NUMBER = "573053405157"; // +57 305 340 5157
const WHATSAPP_MSG = "Hola RONIN, quiero saber más sobre sus productos.";

export function WhatsAppFloat() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#25D366] hover:bg-[#1ebe57] shadow-xl flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
    >
      {/* Official WhatsApp glyph — white phone on green circle */}
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="h-7 w-7 md:h-8 md:w-8"
        fill="#ffffff"
      >
        <path d="M22.5 18.6c-.35-.18-2.06-1.02-2.38-1.13-.32-.12-.55-.18-.78.17-.23.35-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.18-1.48-.55-2.82-1.74-1.04-.93-1.75-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.4.53-.6.18-.2.23-.35.35-.58.12-.23.06-.44-.03-.62-.09-.18-.78-1.89-1.07-2.58-.28-.68-.57-.59-.78-.6l-.66-.01c-.23 0-.6.09-.92.44-.32.35-1.2 1.17-1.2 2.85s1.23 3.31 1.4 3.54c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.65.29-.81.29-1.5.2-1.65-.08-.14-.32-.23-.67-.4z" />
        <path d="M27.3 4.7A15.9 15.9 0 0 0 16 0C7.16 0 0 7.16 0 16c0 2.82.74 5.57 2.14 8L0 32l8.2-2.14A15.94 15.94 0 0 0 16 32c8.84 0 16-7.16 16-16 0-4.27-1.67-8.29-4.7-11.3zM16 29.3c-2.51 0-4.97-.67-7.12-1.94l-.51-.3-4.87 1.27 1.3-4.74-.33-.53A13.28 13.28 0 0 1 2.7 16C2.7 8.66 8.66 2.7 16 2.7c3.55 0 6.89 1.38 9.4 3.9A13.2 13.2 0 0 1 29.3 16c0 7.34-5.96 13.3-13.3 13.3z" />
      </svg>
    </a>
  );
}
