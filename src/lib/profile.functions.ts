import { createServerFn } from "@tanstack/react-start";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import {
	activity,
	bodyMeasurement,
	fast,
	goal,
	habitLog,
	meal,
	user,
	weightEntry,
} from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { assertHealthConsent } from "#/lib/consent.server";
import { MAX_IMPORT_ROWS } from "#/lib/weight-import";
import { GOAL_WEIGHT_MAX_KG, GOAL_WEIGHT_MIN_KG } from "#/lib/weight-utils";

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getSession();
		if (!session) return null;
		const [profile] = await db
			.select()
			.from(user)
			.where(eq(user.id, session.user.id));
		return profile ?? null;
	},
);

const updateProfileSchema = z.object({
	name: z.string().min(1).max(80).optional(),
	sex: z.enum(["male", "female", "other"]).optional(),
	birthDate: z.string().optional(),
	height: z.number().positive().optional(),
	weightUnit: z.enum(["kg", "lb"]).optional(),
	heightUnit: z.enum(["cm", "ft"]).optional(),
	timezone: z.string().min(1).max(100).optional(),
	completedTours: z.string().optional(),
	waterGoal: z.number().positive().optional(),
	stepsGoal: z.number().positive().optional(),
	sleepGoal: z.number().positive().optional(),
	calorieGoal: z.number().positive().optional(),
	proteinGoal: z.number().positive().optional(),
	carbsGoal: z.number().positive().optional(),
	fatGoal: z.number().positive().optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
	.validator(updateProfileSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const update: Record<string, unknown> = {};
		if (data.name !== undefined) update.name = data.name;
		if (data.sex !== undefined) update.sex = data.sex;
		if (data.birthDate !== undefined) update.birthDate = data.birthDate;
		if (data.height !== undefined) update.height = data.height;
		if (data.weightUnit !== undefined) update.weightUnit = data.weightUnit;
		if (data.heightUnit !== undefined) update.heightUnit = data.heightUnit;
		if (data.timezone !== undefined) update.timezone = data.timezone;
		if (data.completedTours !== undefined)
			update.completedTours = data.completedTours;
		if (data.waterGoal !== undefined)
			update.waterGoal = data.waterGoal.toString();
		if (data.stepsGoal !== undefined)
			update.stepsGoal = data.stepsGoal.toString();
		if (data.sleepGoal !== undefined)
			update.sleepGoal = data.sleepGoal.toString();
		if (data.calorieGoal !== undefined)
			update.calorieGoal = data.calorieGoal.toString();
		if (data.proteinGoal !== undefined)
			update.proteinGoal = data.proteinGoal.toString();
		if (data.carbsGoal !== undefined)
			update.carbsGoal = data.carbsGoal.toString();
		if (data.fatGoal !== undefined) update.fatGoal = data.fatGoal.toString();
		await db.update(user).set(update).where(eq(user.id, session.user.id));
		return { ok: true };
	});

// Guarda cuándo se dio el consentimiento; se conserva la primera fecha.
export const giveHealthConsent = createServerFn({ method: "POST" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await db
			.update(user)
			.set({ healthConsentAt: new Date() })
			.where(and(eq(user.id, session.user.id), isNull(user.healthConsentAt)));
		return { ok: true };
	},
);

export const deleteAllMyData = createServerFn({ method: "POST" }).handler(
	async () => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		// Borra todos los datos de salud del usuario; la cuenta se mantiene.
		const uid = session.user.id;
		await db.transaction(async (tx) => {
			await tx.delete(weightEntry).where(eq(weightEntry.createdById, uid));
			await tx.delete(goal).where(eq(goal.createdById, uid));
			await tx.delete(habitLog).where(eq(habitLog.createdById, uid));
			await tx.delete(meal).where(eq(meal.createdById, uid));
			await tx.delete(activity).where(eq(activity.createdById, uid));
			await tx.delete(fast).where(eq(fast.createdById, uid));
			await tx
				.delete(bodyMeasurement)
				.where(eq(bodyMeasurement.createdById, uid));
		});
		return { ok: true };
	},
);

const importEntrySchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	// En kg, dentro del rango que admite la columna numeric(6,2).
	weight: z.number().min(GOAL_WEIGHT_MIN_KG).max(GOAL_WEIGHT_MAX_KG),
	time: z
		.string()
		.regex(/^\d{2}:\d{2}(:\d{2})?$/)
		.nullable()
		.optional(),
	note: z.string().max(500).nullable().optional(),
});

const importSchema = z.array(importEntrySchema).max(MAX_IMPORT_ROWS);

export const importEntries = createServerFn({ method: "POST" })
	.validator(importSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		// Importar dos veces el mismo archivo no debe duplicar registros:
		// se omiten los que ya existen con la misma fecha, hora y peso.
		const existing = await db
			.select({
				date: weightEntry.date,
				time: weightEntry.time,
				weight: weightEntry.weight,
			})
			.from(weightEntry)
			.where(eq(weightEntry.createdById, session.user.id));
		const keyOf = (date: string, time: string | null, weight: number) =>
			`${date}|${time?.slice(0, 5) ?? ""}|${weight.toFixed(1)}`;
		const seen = new Set(
			existing.map((e) => keyOf(e.date, e.time, Number(e.weight))),
		);

		const fresh = data.filter((e) => {
			const key = keyOf(e.date, e.time ?? null, e.weight);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});

		for (let i = 0; i < fresh.length; i += 500) {
			await db.insert(weightEntry).values(
				fresh.slice(i, i + 500).map((e) => ({
					createdById: session.user.id,
					date: e.date,
					weight: e.weight.toFixed(2),
					time: e.time ?? null,
					note: e.note ?? null,
				})),
			);
		}
		return { inserted: fresh.length, skipped: data.length - fresh.length };
	});
