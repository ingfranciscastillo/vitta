// Service worker de Vitta. Pequeño a propósito:
// - Páginas: siempre desde la red, porque llevan sesión y datos de salud.
//   Sin conexión se muestra /offline.html. El HTML nunca se guarda.
// - Archivos estáticos con hash (/assets/*) e iconos: primero la caché,
//   porque su contenido no cambia nunca.
// - Todo lo demás (API, funciones del servidor, login) pasa sin tocar.
// Al cambiar este archivo, sube VERSION para limpiar las cachés viejas.

const VERSION = "v2";
const STATIC_CACHE = `vitta-static-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/pwa-192x192.png"];
const MAX_STATIC_ENTRIES = 120;

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter((key) => key.startsWith("vitta-") && key !== STATIC_CACHE)
					.map((key) => caches.delete(key)),
			);
			if (self.registration.navigationPreload) {
				await self.registration.navigationPreload.enable();
			}
			await self.clients.claim();
		})(),
	);
});

const isStaticAsset = (url) =>
	url.pathname.startsWith("/assets/") ||
	/\.(?:png|ico|svg|webp|woff2?)$/.test(url.pathname);

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	if (request.mode === "navigate") {
		event.respondWith(networkFirstPage(event));
		return;
	}

	if (isStaticAsset(url)) {
		event.respondWith(cacheFirst(request));
	}
});

async function networkFirstPage(event) {
	try {
		const preloaded = await event.preloadResponse;
		if (preloaded) return preloaded;
		return await fetch(event.request);
	} catch {
		const offline = await caches.match(OFFLINE_URL);
		return offline ?? Response.error();
	}
}

async function cacheFirst(request) {
	const cached = await caches.match(request);
	if (cached) return cached;

	const response = await fetch(request);
	if (response.ok && response.type === "basic") {
		const cache = await caches.open(STATIC_CACHE);
		await cache.put(request, response.clone());
		trimCache(cache);
	}
	return response;
}

// Los archivos con hash se acumulan con cada despliegue: se borran los más antiguos.
async function trimCache(cache) {
	const keys = await cache.keys();
	const extra = keys.length - MAX_STATIC_ENTRIES;
	for (let i = 0; i < extra; i++) {
		if (!PRECACHE.includes(new URL(keys[i].url).pathname)) {
			await cache.delete(keys[i]);
		}
	}
}
