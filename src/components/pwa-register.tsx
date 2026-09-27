import { useEffect } from "react";

// Registra el service worker (public/sw.js) para que Vitta se pueda instalar
// y muestre una página propia sin conexión. Solo en producción: en desarrollo
// una caché de archivos confundiría a Vite.
export function PwaRegister() {
	useEffect(() => {
		if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

		const register = () => {
			navigator.serviceWorker.register("/sw.js").catch(() => {
				// Sin service worker la app funciona igual; solo no se instala.
			});
		};

		// Después de la carga, para no competir con la página por la red.
		if (document.readyState === "complete") register();
		else window.addEventListener("load", register, { once: true });
		return () => window.removeEventListener("load", register);
	}, []);

	return null;
}
