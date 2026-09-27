import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { pushSubscription, reminder } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { isPushConfigured, sendPushToUser } from "#/lib/push.server";

const requireUserId = async (): Promise<string> => {
	const session = await getSession();
	if (!session) throw new Error("Unauthorized");
	return session.user.id;
};

export const getReminderSettings = createServerFn({ method: "GET" }).handler(
	async () => {
		const userId = await requireUserId();
		const [weight] = await db
			.select({
				enabled: reminder.enabled,
				time: reminder.time,
				days: reminder.days,
			})
			.from(reminder)
			.where(and(eq(reminder.userId, userId), eq(reminder.type, "weight")));
		const devices = await db
			.select({ endpoint: pushSubscription.endpoint })
			.from(pushSubscription)
			.where(eq(pushSubscription.userId, userId));
		return {
			weight: weight ? { ...weight, time: weight.time.slice(0, 5) } : null,
			deviceEndpoints: devices.map((d) => d.endpoint),
			pushAvailable: isPushConfigured(),
		};
	},
);

const weightReminderSchema = z.object({
	enabled: z.boolean(),
	time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
	days: z.number().int().min(1).max(127),
});

export const saveWeightReminder = createServerFn({ method: "POST" })
	.validator(weightReminderSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		await db
			.insert(reminder)
			.values({ userId, type: "weight", ...data })
			.onConflictDoUpdate({
				target: [reminder.userId, reminder.type],
				set: data,
			});
		return { ok: true };
	});

const subscriptionSchema = z.object({
	endpoint: z.url().max(2048),
	keys: z.object({
		p256dh: z.string().min(1).max(256),
		auth: z.string().min(1).max(256),
	}),
	userAgent: z.string().max(512).optional(),
});

// Si el endpoint ya existía (otra cuenta en el mismo navegador), pasa a
// pertenecer a quien lo registra ahora.
export const savePushSubscription = createServerFn({ method: "POST" })
	.validator(subscriptionSchema)
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		const values = {
			userId,
			endpoint: data.endpoint,
			p256dh: data.keys.p256dh,
			auth: data.keys.auth,
			userAgent: data.userAgent ?? null,
		};
		await db
			.insert(pushSubscription)
			.values(values)
			.onConflictDoUpdate({ target: pushSubscription.endpoint, set: values });
		return { ok: true };
	});

export const deletePushSubscription = createServerFn({ method: "POST" })
	.validator(z.object({ endpoint: z.string().max(2048) }))
	.handler(async ({ data }) => {
		const userId = await requireUserId();
		await db
			.delete(pushSubscription)
			.where(
				and(
					eq(pushSubscription.userId, userId),
					eq(pushSubscription.endpoint, data.endpoint),
				),
			);
		return { ok: true };
	});

export const sendTestPush = createServerFn({ method: "POST" }).handler(
	async () => {
		const userId = await requireUserId();
		const delivered = await sendPushToUser(userId, {
			// No "Vitta": iOS ya añade "from Vitta" debajo del título.
			title: "Aviso de prueba",
			body: "Así se verán tus recordatorios.",
			url: "/profile#recordatorios",
			tag: "test",
		});
		return { delivered };
	},
);
