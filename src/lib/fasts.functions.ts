import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { fast } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { assertHealthConsent } from "#/lib/consent.server";
import type { Fast, FastStatus } from "#/lib/health-types";

export const listFasts = createServerFn({ method: "GET" }).handler(
	async (): Promise<Fast[]> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const rows = await db
			.select()
			.from(fast)
			.where(eq(fast.createdById, session.user.id))
			.orderBy(desc(fast.startedAt));
		return rows.map((r): Fast => {
			const out: Fast = {
				status: r.status as FastStatus,
				startedAt: r.startedAt.toISOString(),
			};
			if (r.id) out.id = r.id;
			if (r.createdById) out.createdById = r.createdById;
			if (r.endedAt) out.endedAt = r.endedAt.toISOString();
			if (r.durationMinutes != null)
				out.durationMinutes = Number(r.durationMinutes);
			if (r.type) out.type = r.type;
			return out;
		});
	},
);

const startAtSchema = z
	.string()
	.min(1)
	.transform((s) => new Date(s));

const createSchema = z.object({
	status: z.enum(["active", "completed"]),
	startedAt: startAtSchema,
	endedAt: z
		.string()
		.optional()
		.transform((s) => (s ? new Date(s) : undefined)),
	durationMinutes: z.number().nonnegative().optional(),
	type: z.string().max(40).optional(),
});

export const createFast = createServerFn({ method: "POST" })
	.validator(createSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		if (data.status === "active") {
			const existing = await db
				.select()
				.from(fast)
				.where(
					and(
						eq(fast.createdById, session.user.id),
						eq(fast.status, "active"),
						isNull(fast.endedAt),
					),
				);
			const now = new Date();
			for (const row of existing) {
				const mins = Math.max(
					0,
					Math.round((now.getTime() - row.startedAt.getTime()) / 60000),
				);
				await db
					.update(fast)
					.set({
						status: "completed",
						endedAt: now,
						durationMinutes: mins.toString(),
					})
					.where(eq(fast.id, row.id));
			}
		}

		const insertValues = {
			createdById: session.user.id,
			status: data.status,
			startedAt: data.startedAt,
			type: data.type ?? null,
		} as const;

		const [row] = await db
			.insert(fast)
			.values({
				...insertValues,
				endedAt: data.endedAt ?? null,
				durationMinutes:
					data.durationMinutes != null ? data.durationMinutes.toString() : null,
			})
			.returning({ id: fast.id });
		return { id: row?.id ?? "" };
	});

const updateSchema = z.object({
	id: z.string().min(1),
	status: z.enum(["active", "completed"]).optional(),
	endedAt: z
		.string()
		.optional()
		.transform((s) => (s ? new Date(s) : undefined)),
	durationMinutes: z.number().nonnegative().optional(),
	type: z.string().max(40).optional(),
});

export const updateFast = createServerFn({ method: "POST" })
	.validator(updateSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);
		const [existing] = await db
			.select({ owner: fast.createdById })
			.from(fast)
			.where(eq(fast.id, data.id));
		if (!existing || existing.owner !== session.user.id) {
			throw new Error("Not found");
		}
		const update: Record<string, unknown> = {};
		if (data.status !== undefined) update.status = data.status;
		if (data.endedAt !== undefined) update.endedAt = data.endedAt;
		if (data.durationMinutes !== undefined)
			update.durationMinutes = data.durationMinutes.toString();
		if (data.type !== undefined) update.type = data.type;
		await db.update(fast).set(update).where(eq(fast.id, data.id));
		return { ok: true };
	});
