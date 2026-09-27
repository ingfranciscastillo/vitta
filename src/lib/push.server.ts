import { eq, inArray } from "drizzle-orm";
import webpush from "web-push";
import { db } from "#/db";
import { pushSubscription } from "#/db/schema";
import { LEGAL } from "#/lib/legal";

// Envío de notificaciones Web Push con claves VAPID. El contenido viaja
// cifrado hasta el navegador; nunca incluye datos de salud.

export type PushPayload = {
	title: string;
	body: string;
	// Ruta que se abre al tocar la notificación.
	url: string;
	// Avisos con el mismo tag se reemplazan en lugar de acumularse.
	tag: string;
};

let configured = false;

export function isPushConfigured(): boolean {
	return Boolean(
		process.env.VITE_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
	);
}

function configure() {
	if (configured) return;
	const publicKey = process.env.VITE_VAPID_PUBLIC_KEY;
	const privateKey = process.env.VAPID_PRIVATE_KEY;
	if (!publicKey || !privateKey) {
		throw new Error("Faltan VITE_VAPID_PUBLIC_KEY o VAPID_PRIVATE_KEY");
	}
	webpush.setVapidDetails(
		process.env.VAPID_SUBJECT ?? `mailto:${LEGAL.email}`,
		publicKey,
		privateKey,
	);
	configured = true;
}

// Envía a todos los dispositivos de la persona. Devuelve cuántos lo
// recibieron; las suscripciones caducadas (404/410) se borran.
export async function sendPushToUser(
	userId: string,
	payload: PushPayload,
): Promise<number> {
	configure();
	const subs = await db
		.select()
		.from(pushSubscription)
		.where(eq(pushSubscription.userId, userId));

	const expired: string[] = [];
	const delivered: string[] = [];
	await Promise.all(
		subs.map(async (sub) => {
			try {
				await webpush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: { p256dh: sub.p256dh, auth: sub.auth },
					},
					JSON.stringify(payload),
					// Un recordatorio de hoy no sirve mañana.
					{ TTL: 60 * 60 * 12, urgency: "normal", topic: payload.tag },
				);
				delivered.push(sub.id);
			} catch (error) {
				const status = (error as { statusCode?: number }).statusCode;
				if (status === 404 || status === 410) expired.push(sub.id);
				else console.error("[push] envío fallido", status, sub.endpoint);
			}
		}),
	);

	if (expired.length > 0) {
		await db
			.delete(pushSubscription)
			.where(inArray(pushSubscription.id, expired));
	}
	if (delivered.length > 0) {
		await db
			.update(pushSubscription)
			.set({ lastSuccessAt: new Date() })
			.where(inArray(pushSubscription.id, delivered));
	}
	return delivered.length;
}
