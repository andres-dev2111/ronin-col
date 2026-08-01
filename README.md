# Ronin Identity

# Estructura de carpetas:

#   assets/           → CSS, JS, SVGs, imágenes estáticas

#   blocks/           → Bloques reutilizables (app blocks)

#   cloudflare-worker/→ Workers de Cloudflare (si aplica)

#   config/           → settings_schema.json, settings_data.json

#   layout/           → theme.liquid (layout base)

#   locales/          → Traducciones (es.default.json es el principal)

#   sections/         → Secciones Liquid del tema

#   snippets/         → Fragmentos reutilizables (ronin-logo.liquid, etc.)

#   templates/        → Plantillas de página (index.json, product.json, etc.)

#

# Identidad de Marca:

#   Color primario:   #C8102E (Rojo Samurái)

#   Color de fondo:   #0a0a0a (Negro profundo)

#   Fuente display:   Bebas Neue (títulos)

#   Fuente cuerpo:    Inter (body, botones)

#

# Secciones RONIN custom:

#   ronin-announcement-bar  → Barra de anuncios rotativa

#   ronin-header            → Header sticky con carrito, búsqueda y perfil

#   ronin-hero-banner       → Hero cinematográfico con stats de confianza

#   ronin-categories        → Grid de 4 categorías con hover

#   ronin-featured-products → Productos de colección dinámica

#   ronin-promo-banner      → Banner editorial con ticker "RONIN"

#   ronin-lookbook          → Galería con filtros y modal Get The Look

#   ronin-footer            → Footer con newsletter, ticker y columnas

# Requerimientos y Especificaciones de la Tienda "RONIN"

A continuación se detalla toda la estructura, características, funciones y el diseño necesario para que la tienda **Ronin** sea 100% funcional y coherente con la identidad de la marca.

---

## 1. Identidad de Marca y Diseño Visual

**Concepto de Marca:** Streetwear premium para hombres urbanos que no necesitan permiso. Actitud rebelde ("Sin amo. Sin límites"), enfoque en calidad (Algodón 320GSM, estampados duraderos).

### 🎨 Paleta de Colores

- **Color Primario (Acentos y Botones):** Rojo Samurái (`#C8102E`)

- **Fondo Principal:** Negro Profundo (`#0A0A0A`)

- **Fondo Secundario (Tarjetas, Secciones):** Gris Oscuro / Carbón (`#111111` a `#1A1A1A`)

- **Texto Principal:** Blanco (`#FFFFFF`)

### 🔤 Tipografía

- **Títulos y Encabezados (Display):** `Bebas Neue` (Fuerte, condensada, urbana).

- **Cuerpo de texto y Botones:** `Inter` (Limpia, moderna, altamente legible).

---

## 2. Requerimientos Funcionales por Página

### A. Cabecera (Header) y Navegación

- **Barra de Anuncios (Rotativa):** Muestra mensajes clave dinámicos. Ejemplo: *"⚡ ENVÍO GRATIS en compras mayores a $150.000"*, *"🔥 NUEVA TEMPORADA"*.

- **Menú Principal:** Navegación limpia y pegajosa (*sticky*) al hacer scroll.

- **Iconos Funcionales:** Búsqueda, Cuenta de Usuario y Carrito (Desplegable/Notificación).

### B. Página de Inicio (Home Page)

Debe contar con las siguientes secciones en orden:

1. **Hero Banner Cinematográfico:** Imagen principal de gran impacto con el texto *"Viste Como Ronin"*. Incluye dos botones de llamado a la acción (Comprar Ahora / Ver Lookbook) y métricas de confianza en pantalla (+5K Ronines, 320g, 100% Sin amo).

2. **Cuadrícula de Categorías (Elige Tu Armadura):** 4 bloques interactivos con efecto *hover* para redirigir a las colecciones principales (Esencial, Premium, Nuevo, Limited).

3. **Productos Destacados (Más Vendidos):** Carrusel o grilla mostrando un máximo de 4 productos de mayor venta. Con etiquetas automáticas de "NUEVO" (basado en la fecha de creación) y "OFERTA".

4. **Banner Promocional (Drop Exclusivo):** Un banner editorial para impulsar ventas de Hoodies y Camisetas Oversize, acompañado de una marquesina (ticker) de texto en movimiento.

5. **Lookbook (La Comunidad):** Una galería interactiva donde los clientes pueden tocar una foto (ej. Look Street, Look Dark) para ver los productos que componen ese "outfit" y comprarlos directamente.

### C. Página de Producto (Product Page)

- **Galería de Imágenes:** Estilo oscuro premium (`#111111`).

- **Selector de Variantes:** Tallas y Colores (preferiblemente botones/píldoras, no selectores desplegables básicos).

- **Indicador de Stock:** Crea urgencia.

- **Botones de Acción:** Botón principal en Rojo Samurái (`#C8102E`).

- **Trust Badges:** Iconos que brinden seguridad en el pago y envío.

- **Recomendaciones Cruzadas:** Sección *"Completa el Look"* o *"Te puede interesar"*.

### D. Colecciones y Búsqueda

- Filtros laterales dinámicos (Talla, Precio, Tipo).

- Botón de **"Añadir Rápido" (Quick Add)** directamente desde la tarjeta del producto sin necesidad de entrar a la página.

### E. Footer (Pie de página)

- Formulario de suscripción al Newsletter ("Únete a la comunidad Ronin").

- Marquesina (Ticker) horizontal en movimiento con la frase "SIN AMO · SIN LÍMITES · STREETWEAR PREMIUM · RONIN".

- Enlaces de políticas, contacto y enlaces sociales (Instagram, TikTok).

---

## 3. Requerimientos de Configuración en Shopify (Backend)

Para que todos los botones y secciones del tema funcionen automáticamente sin mostrar errores 404, **debes crear lo siguiente en tu panel de administrador de Shopify**:

### 🛍️ Colecciones a Crear:

Debes crear estas colecciones, y en el apartado de SEO (parte inferior) asegurarte de que la URL final coincida con estos enlaces exactos:

1. `all` (Para mostrar todos los productos)

2. `best-sellers` (Para la sección de más vendidos en el Home)

3. `camisetas-oversize` 

4. `hoodies` 

5. `sets-ronin` 

6. `new-arrivals`

### 📄 Páginas a Crear:

1. `lookbook` (Página donde conectarás la galería completa de outfits).

### ⚙️ Funciones Nativas a Activar en Ajustes de Shopify:

- **Cuentas de Cliente:** Deben estar habilitadas para que el icono del perfil funcione.

- **Moneda:** Configuración de formato de moneda local (COP) sin decimales visualmente invasivos.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ronin-col.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6dad8c49-12fe-486e-ad66-0f88e10fb8eb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
