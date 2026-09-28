import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { habitLog } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { assertHealthConsent } from "#/lib/consent.server";
import type { HabitLog, HabitType } from "#/lib/health-types";

export const listHabitLogs = createServerFn({ method: "GET" }).handler(
	async (): Promise<HabitLog[]> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const rows = await db
			.select()
			.from(habitLog)
			.where(eq(habitLog.createdById, session.user.id));
		return rows.map((r): HabitLog => {
			const out: HabitLog = {
				type: r.type as HabitType,
				value: Number(r.value),
				date: r.date,
			};
			if (r.id) out.id = r.id;
			if (r.createdById) out.createdById = r.createdById;
			return out;
		});
	},
);

const addSchema = z.object({
	type: z.enum(["water", "steps", "sleep"]),
	date: z.string().min(1),
	step: z.number(),
});

export const addHabitLog = createServerFn({ method: "POST" })
	.validator(addSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		if (data.step === 0) {
			throw new Error("El paso no puede ser cero");
		}

		const [existing] = await db
			.select()
			.from(habitLog)
			.where(
				and(
					eq(habitLog.createdById, session.user.id),
					eq(habitLog.type, data.type),
					eq(habitLog.date, data.date),
				),
			)
			.limit(1);

		if (existing) {
			const next = Math.max(0, Number(existing.value) + data.step);
			await db
				.update(habitLog)
				.set({ value: next.toString() })
				.where(eq(habitLog.id, existing.id));
			return { id: existing.id, value: next };
		}

		if (data.step < 0) {
			throw new Error("No hay hábito para restar");
		}

		const [row] = await db
			.insert(habitLog)
			.values({
				createdById: session.user.id,
				type: data.type,
				value: data.step.toString(),
				date: data.date,
			})
			.returning({ id: habitLog.id });
		return { id: row?.id ?? "", value: data.step };
	});

const setSchema = z.object({
	type: z.enum(["water", "steps", "sleep"]),
	date: z.string().min(1),
	value: z.number().positive(),
});

export const setHabitLog = createServerFn({ method: "POST" })
	.validator(setSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		const [existing] = await db
			.select()
			.from(habitLog)
			.where(
				and(
					eq(habitLog.createdById, session.user.id),
					eq(habitLog.type, data.type),
					eq(habitLog.date, data.date),
				),
			)
			.limit(1);

		if (existing) {
			await db
				.update(habitLog)
				.set({ value: data.value.toString() })
				.where(eq(habitLog.id, existing.id));
			return { id: existing.id };
		}

		const [row] = await db
			.insert(habitLog)
			.values({
				createdById: session.user.id,
				type: data.type,
				value: data.value.toString(),
				date: data.date,
			})
			.returning({ id: habitLog.id });
		return { id: row?.id ?? "" };
	});
