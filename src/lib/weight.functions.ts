import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { goal, weightEntry } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { assertHealthConsent } from "#/lib/consent.server";
import type { WeightEntry } from "#/lib/weight-utils";

export const listWeightEntries = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const rows = await db
			.select()
			.from(weightEntry)
			.where(eq(weightEntry.createdById, session.user.id))
			.orderBy(
				desc(weightEntry.date),
				desc(weightEntry.time),
				desc(weightEntry.createdAt),
			);
		return rows.map(
			(r): WeightEntry => ({
				id: r.id,
				createdById: r.createdById,
				date: r.date,
				weight: Number(r.weight),
				time: r.time,
				note: r.note,
				createdAt: r.createdAt.toISOString(),
			}),
		);
	},
);

const entrySchema = z.object({
	date: z.string().min(1),
	weight: z.number().positive(),
	time: z.string().nullable().optional(),
	note: z.string().nullable().optional(),
});

export const createWeightEntry = createServerFn({ method: "POST" })
	.validator(entrySchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		// Necesitamos saber si este es el primer registro de peso del usuario
		// ANTES de insertar, para no confundir "primer registro" con
		// "cualquier registro que llegue mientras la tabla está vacía".
		const existing = await db
			.select({ id: weightEntry.id })
			.from(weightEntry)
			.where(eq(weightEntry.createdById, session.user.id))
			.limit(1);
		const isFirstEntry = existing.length === 0;

		const [row] = await db
			.insert(weightEntry)
			.values({
				createdById: session.user.id,
				date: data.date,
				weight: data.weight.toString(),
				time: data.time ?? null,
				note: data.note ?? null,
			})
			.returning({ id: weightEntry.id });

		// Backfill: si es el primer peso que el usuario registra y ya tiene
		// un objetivo creado sin start_weight (porque el objetivo se creó
		// antes de registrar ningún peso), este es el punto de partida real.
		if (isFirstEntry) {
			const [existingGoal] = await db
				.select()
				.from(goal)
				.where(eq(goal.createdById, session.user.id))
				.limit(1);

			if (existingGoal && existingGoal.startWeight == null) {
				await db
					.update(goal)
					.set({
						startWeight: data.weight.toString(),
						startDate: data.date,
					})
					.where(eq(goal.id, existingGoal.id));
			}
		}

		return { id: row?.id ?? "" };
	});

const updateSchema = z.object({
	id: z.string().min(1),
	data: entrySchema,
});

export const updateWeightEntry = createServerFn({ method: "POST" })
	.validator(updateSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);
		const [existing] = await db
			.select({ owner: weightEntry.createdById })
			.from(weightEntry)
			.where(eq(weightEntry.id, data.id));
		if (!existing || existing.owner !== session.user.id) {
			throw new Error("Not found");
		}
		await db
			.update(weightEntry)
			.set({
				date: data.data.date,
				weight: data.data.weight.toString(),
				time: data.data.time ?? null,
				note: data.data.note ?? null,
			})
			.where(eq(weightEntry.id, data.id));
		return { ok: true };
	});

const deleteSchema = z.object({ id: z.string().min(1) });

export const deleteWeightEntry = createServerFn({ method: "POST" })
	.validator(deleteSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const [existing] = await db
			.select({ owner: weightEntry.createdById })
			.from(weightEntry)
			.where(eq(weightEntry.id, data.id));
		if (!existing || existing.owner !== session.user.id) {
			throw new Error("Not found");
		}
		await db.delete(weightEntry).where(eq(weightEntry.id, data.id));
		return { ok: true };
	});
