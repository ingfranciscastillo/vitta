import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { activity } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { assertHealthConsent } from "#/lib/consent.server";
import type { Activity, ActivityIntensity } from "#/lib/health-types";

export const listActivities = createServerFn({ method: "GET" }).handler(
	async (): Promise<Activity[]> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const rows = await db
			.select()
			.from(activity)
			.where(eq(activity.createdById, session.user.id))
			.orderBy(desc(activity.date), desc(activity.time));
		return rows.map((r): Activity => {
			const out: Activity = {
				date: r.date,
				type: r.type,
				durationMinutes: Number(r.durationMinutes),
			};
			if (r.id) out.id = r.id;
			if (r.createdById) out.createdById = r.createdById;
			out.time = r.time ?? null;
			if (r.intensity) out.intensity = r.intensity as ActivityIntensity;
			return out;
		});
	},
);

const createSchema = z.object({
	date: z.string().min(1),
	time: z.string().nullable().optional(),
	type: z.string().min(1).max(80),
	durationMinutes: z.number().positive(),
	intensity: z.enum(["low", "medium", "high"]).optional(),
});

export const createActivity = createServerFn({ method: "POST" })
	.validator(createSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		const [row] = await db
			.insert(activity)
			.values({
				createdById: session.user.id,
				date: data.date,
				time: data.time ?? null,
				type: data.type,
				durationMinutes: data.durationMinutes.toString(),
				intensity: data.intensity ?? null,
			})
			.returning({ id: activity.id });
		return { id: row?.id ?? "" };
	});

const deleteSchema = z.object({ id: z.string().min(1) });

export const deleteActivity = createServerFn({ method: "POST" })
	.validator(deleteSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const [existing] = await db
			.select({ owner: activity.createdById })
			.from(activity)
			.where(eq(activity.id, data.id));
		if (!existing || existing.owner !== session.user.id) {
			throw new Error("Not found");
		}
		await db.delete(activity).where(eq(activity.id, data.id));
		return { ok: true };
	});
