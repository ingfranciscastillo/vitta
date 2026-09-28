import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { meal } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { assertHealthConsent } from "#/lib/consent.server";
import type { Meal, MealType } from "#/lib/health-types";

export const listMeals = createServerFn({ method: "GET" }).handler(
	async (): Promise<Meal[]> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const rows = await db
			.select()
			.from(meal)
			.where(eq(meal.createdById, session.user.id))
			.orderBy(desc(meal.date), desc(meal.time));
		return rows.map((r): Meal => {
			const out: Meal = {
				date: r.date,
				name: r.name,
				calories: Number(r.calories),
				mealType: r.mealType as MealType,
			};
			if (r.id) out.id = r.id;
			if (r.createdById) out.createdById = r.createdById;
			out.time = r.time ?? null;
			out.protein = r.protein != null ? Number(r.protein) : null;
			out.carbs = r.carbs != null ? Number(r.carbs) : null;
			out.fat = r.fat != null ? Number(r.fat) : null;
			return out;
		});
	},
);

const createSchema = z.object({
	date: z.string().min(1),
	time: z.string().nullable().optional(),
	name: z.string().min(1).max(120),
	calories: z.number().positive(),
	protein: z.number().nonnegative().optional(),
	carbs: z.number().nonnegative().optional(),
	fat: z.number().nonnegative().optional(),
	mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
});

export const createMeal = createServerFn({ method: "POST" })
	.validator(createSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		const [row] = await db
			.insert(meal)
			.values({
				createdById: session.user.id,
				date: data.date,
				time: data.time ?? null,
				name: data.name,
				calories: data.calories.toString(),
				protein: (data.protein ?? 0).toString(),
				carbs: (data.carbs ?? 0).toString(),
				fat: (data.fat ?? 0).toString(),
				mealType: data.mealType,
			})
			.returning({ id: meal.id });
		return { id: row?.id ?? "" };
	});

const deleteSchema = z.object({ id: z.string().min(1) });

export const deleteMeal = createServerFn({ method: "POST" })
	.validator(deleteSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const [existing] = await db
			.select({ owner: meal.createdById })
			.from(meal)
			.where(eq(meal.id, data.id));
		if (!existing || existing.owner !== session.user.id) {
			throw new Error("Not found");
		}
		await db.delete(meal).where(eq(meal.id, data.id));
		return { ok: true };
	});
