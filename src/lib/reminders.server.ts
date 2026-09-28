import { and, eq, exists } from "drizzle-orm";
import { db } from "#/db";
import { pushSubscription, reminder, user, weightEntry } from "#/db/schema";
import { sendPushToUser } from "#/lib/push.server";
import { isDue, localClock } from "#/lib/reminder-schedule";

// Lo llama el cron cada 15 minutos. Envía el recordatorio de peso a quien le
// toque ahora y todavía no se haya pesado hoy.
export async function runDueReminders(now = new Date()) {
	const candidates = await db
		.select({
			id: reminder.id,
			userId: reminder.userId,
			time: reminder.time,
			days: reminder.days,
			lastSentOn: reminder.lastSentOn,
			timezone: user.timezone,
		})
		.from(reminder)
		.innerJoin(user, eq(user.id, reminder.userId))
		.where(
			and(
				eq(reminder.enabled, true),
				eq(reminder.type, "weight"),
				exists(
					db
						.select({ id: pushSubscription.id })
						.from(pushSubscription)
						.where(eq(pushSubscription.userId, reminder.userId)),
				),
			),
		);

	const due = candidates
		.map((r) => ({ ...r, clock: localClock(now, r.timezone) }))
		.filter((r) => isDue(r, r.clock));

	let sent = 0;
	let skipped = 0;
	for (const r of due) {
		const [logged] = await db
			.select({ id: weightEntry.id })
			.from(weightEntry)
			.where(
				and(
					eq(weightEntry.createdById, r.userId),
					eq(weightEntry.date, r.clock.date),
				),
			)
			.limit(1);

		if (logged) {
			skipped++;
		} else {
			const delivered = await sendPushToUser(r.userId, {
				title: "Hora de pesarte",
				body: "Registra tu peso de hoy para mantener tu tendencia al día.",
				url: "/dashboard?log=weight",
				tag: "weight-reminder",
			});
			if (delivered > 0) sent++;
		}

		// Se marca aunque se haya saltado: un aviso por día como máximo.
		await db
			.update(reminder)
			.set({ lastSentOn: r.clock.date })
			.where(eq(reminder.id, r.id));
	}

	return { checked: candidates.length, due: due.length, sent, skipped };
}
