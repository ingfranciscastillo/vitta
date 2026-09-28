import { eq } from "drizzle-orm";
import { db } from "#/db";
import { user } from "#/db/schema";

// Sin consentimiento explícito (RGPD art. 9) no se guardan datos de salud.
// La interfaz ya lo pide antes; esto lo garantiza aunque se llame a la API
// directamente. Borrar sí se permite: es la forma de retirarlo.
export async function assertHealthConsent(userId: string): Promise<void> {
	const [row] = await db
		.select({ at: user.healthConsentAt })
		.from(user)
		.where(eq(user.id, userId));
	if (!row?.at) throw new Error("HEALTH_CONSENT_REQUIRED");
}
