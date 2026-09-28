import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "#/db";
import { bodyMeasurement } from "#/db/schema";
import { getSession } from "#/lib/auth.functions";
import { assertHealthConsent } from "#/lib/consent.server";
import type { BodyMeasurement, BodyMeasurementType } from "#/lib/health-types";

export const listBodyMeasurements = createServerFn({ method: "GET" }).handler(
	async (): Promise<BodyMeasurement[]> => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const rows = await db
			.select()
			.from(bodyMeasurement)
			.where(eq(bodyMeasurement.createdById, session.user.id))
			.orderBy(desc(bodyMeasurement.date));
		return rows.map((r): BodyMeasurement => {
			const out: BodyMeasurement = {
				type: r.type as BodyMeasurementType,
				value: Number(r.value),
				date: r.date,
			};
			if (r.id) out.id = r.id;
			if (r.createdById) out.createdById = r.createdById;
			out.time = r.time ?? null;
			out.note = r.note ?? null;
			return out;
		});
	},
);

const createSchema = z.object({
	type: z.enum(["waist", "hip", "chest", "arm", "thigh", "neck", "body_fat"]),
	value: z.number().positive(),
	date: z.string().min(1),
});

export const createBodyMeasurement = createServerFn({ method: "POST" })
	.validator(createSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		await assertHealthConsent(session.user.id);

		const [row] = await db
			.insert(bodyMeasurement)
			.values({
				createdById: session.user.id,
				type: data.type,
				value: data.value.toString(),
				date: data.date,
			})
			.returning({ id: bodyMeasurement.id });
		return { id: row?.id ?? "" };
	});

const deleteSchema = z.object({ id: z.string().min(1) });

export const deleteBodyMeasurement = createServerFn({ method: "POST" })
	.validator(deleteSchema)
	.handler(async ({ data }) => {
		const session = await getSession();
		if (!session) throw new Error("Unauthorized");
		const [existing] = await db
			.select({ owner: bodyMeasurement.createdById })
			.from(bodyMeasurement)
			.where(eq(bodyMeasurement.id, data.id));
		if (!existing || existing.owner !== session.user.id) {
			throw new Error("Not found");
		}
		await db.delete(bodyMeasurement).where(eq(bodyMeasurement.id, data.id));
		return { ok: true };
	});
