// URL pública del sitio, sin barra final. Se usa en URLs canónicas, datos
// estructurados y la imagen para compartir, que necesitan direcciones
// absolutas. Mientras no haya dominio propio, VITE_SITE_URL apunta al de Vercel.
export const SITE_URL = (
	(import.meta.env.VITE_SITE_URL as string | undefined) || "https://vitta.app"
).replace(/\/+$/, "");

// Imagen para compartir en redes (public/og.png, 1200×630).
export const OG_IMAGE = {
	url: `${SITE_URL}/og.png`,
	width: "1200",
	height: "630",
	alt: "Vitta: registra tu peso en 5 segundos. Captura de la pantalla de inicio de la app.",
} as const;
