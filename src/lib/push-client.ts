// Suscripción a Web Push desde el navegador. Solo se usa en el cliente,
// siempre a partir de un gesto del usuario (los navegadores lo exigen para
// pedir permiso).

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
	| string
	| undefined;

export type PushSupport =
	| "supported"
	// iPhone/iPad en Safari: Web Push solo funciona con la app instalada.
	| "ios-needs-install"
	| "unsupported";

const isIos = () =>
	/iPad|iPhone|iPod/.test(navigator.userAgent) ||
	(navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isStandalone = () =>
	window.matchMedia("(display-mode: standalone)").matches ||
	(navigator as Navigator & { standalone?: boolean }).standalone === true;

export function getPushSupport(): PushSupport {
	const supported =
		"serviceWorker" in navigator &&
		"PushManager" in window &&
		"Notification" in window;
	if (supported) return "supported";
	return isIos() && !isStandalone() ? "ios-needs-install" : "unsupported";
}

export const notificationPermission = (): NotificationPermission =>
	"Notification" in window ? Notification.permission : "denied";

async function getRegistration(): Promise<ServiceWorkerRegistration> {
	const existing = await navigator.serviceWorker.getRegistration();
	if (!existing) await navigator.serviceWorker.register("/sw.js");
	return navigator.serviceWorker.ready;
}

export async function getCurrentSubscription(): Promise<PushSubscription | null> {
	const reg = await navigator.serviceWorker.getRegistration();
	return (await reg?.pushManager.getSubscription()) ?? null;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
	const base64 = (value + "=".repeat((4 - (value.length % 4)) % 4))
		.replace(/-/g, "+")
		.replace(/_/g, "/");
	const raw = atob(base64);
	const bytes = new Uint8Array(new ArrayBuffer(raw.length));
	for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
	return bytes;
}

export class PushPermissionError extends Error {}

export async function subscribeToPush() {
	if (!VAPID_PUBLIC_KEY) throw new Error("Falta VITE_VAPID_PUBLIC_KEY");
	const permission = await Notification.requestPermission();
	if (permission !== "granted") throw new PushPermissionError(permission);

	const reg = await getRegistration();
	const subscription =
		(await reg.pushManager.getSubscription()) ??
		(await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY),
		}));

	const json = subscription.toJSON();
	return {
		endpoint: subscription.endpoint,
		keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
		userAgent: navigator.userAgent.slice(0, 512),
	};
}

// Devuelve el endpoint dado de baja para borrarlo también en el servidor.
export async function unsubscribeFromPush(): Promise<string | null> {
	const subscription = await getCurrentSubscription();
	if (!subscription) return null;
	await subscription.unsubscribe();
	return subscription.endpoint;
}
