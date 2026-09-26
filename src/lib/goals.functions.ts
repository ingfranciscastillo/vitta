import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { goal, user } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { listWeightEntries } from "#/lib/weight.functions";
import {
	computeStats,
	GOAL_WEIGHT_MAX_KG,
	GOAL_WEIGHT_MIN_KG,
	type Goal,
	todayStr,
	type WeightUnit,
} from "#/lib/weight-utils";

type GoalResponse = {
	goal: Goal | null;
	unit: WeightUnit;
};

export const getCurrentGoal = createServerFn({ method: "GET" }).handler(
	async (): Promise<GoalResponse> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const [rows] = await db
			.select()
			.from(goal)
			.where(eq(goal.createdById, session.user.id))
			.limit(1);
		const [profile] = await db
			.select({ weightUnit: user.weightUnit })
			.from(user)
			.where(eq(user.id, session.user.id));
		return {
			goal: rows
				? {
						target_weight: rows.targetWeight ? Number(rows.targetWeight) : null,
						target_date: rows.targetDate ?? null,
						pace: rows.pace ?? null,
						start_weight: rows.startWeight ? Number(rows.startWeight) : null,
						start_date: rows.startDate ?? null,
					}
				: null,
			unit: (profile?.weightUnit ?? "kg") as WeightUnit,
		};
	},
);

const goalSchema = z.object({
	targetWeight: z
		.number()
		.min(GOAL_WEIGHT_MIN_KG, { error: "Peso objetivo demasiado bajo" })
		.max(GOAL_WEIGHT_MAX_KG, { error: "Peso objetivo demasiado alto" }),
	targetDate: z.string().nullable().optional(),
	pace: z.enum(["slow", "moderate", "fast"]).default("moderate"),
});

export const upsertGoal = createServerFn({ method: "POST" })
	.validator(goalSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");

		const [existing] = await db
			.select()
			.from(goal)
			.where(eq(goal.createdById, session.user.id))
			.limit(1);

		const entries = await listWeightEntries();
		const stats = computeStats(entries);

		// ¿El usuario está cambiando la meta (target_weight)? Si sí, tratamos
		// esto como un objetivo nuevo y reseteamos el punto de partida.
		const isNewTarget =
			existing?.targetWeight != null
				? Number(existing.targetWeight) !== data.targetWeight
				: true;

		// Si hay que resetear (objetivo nuevo o no existía antes), el punto de
		// partida es el peso actual — pero SOLO si ya hay algún registro.
		// Si todavía no hay entries, dejamos start_weight en null: se
		// completará con el backfill cuando el usuario registre su primer peso.
		const startWeight =
			existing && !isNewTarget
				? existing.startWeight != null
					? Number(existing.startWeight)
					: null
				: stats.current;

		const startDate =
			existing && !isNewTarget
				? existing.startDate
				: stats.current != null
					? todayStr()
					: null;

		if (existing) {
			await db
				.update(goal)
				.set({
					targetWeight: data.targetWeight.toString(),
					targetDate: data.targetDate ?? null,
					pace: data.pace,
					startWeight: startWeight != null ? startWeight.toString() : null,
					startDate: startDate,
				})
				.where(eq(goal.id, existing.id));
		} else {
			await db.insert(goal).values([
				{
					createdById: session.user.id,
					targetWeight: data.targetWeight.toString(),
					targetDate: data.targetDate ?? null,
					pace: data.pace,
					startWeight: startWeight != null ? startWeight.toString() : null,
					startDate: startDate,
				},
			]);
		}
		return { ok: true };
	});
