import { HEIGHT_RANGE_CM } from "#/lib/units";
import { GOAL_WEIGHT_MAX_KG, GOAL_WEIGHT_MIN_KG } from "#/lib/weight-utils";

// Datos que una calculadora pública pasa al registro y al onboarding.
// Siempre en unidades canónicas (kg y cm) para no depender de la unidad
// elegida en la herramienta.
export type SignupPrefill = {
	peso?: number;
	meta?: number;
	altura?: number;
	ritmo?: "slow" | "moderate" | "fast";
};

const inRange = (v: unknown, min: number, max: number): number | undefined => {
	const n = typeof v === "string" ? Number(v) : v;
	return typeof n === "number" && Number.isFinite(n) && n >= min && n <= max
		? Math.round(n * 10) / 10
		: undefined;
};

// Valida parámetros de URL; lo que no sea válido se descarta en silencio.
export const parseSignupPrefill = (
	search: Record<string, unknown>,
): SignupPrefill => {
	const ritmo = search.ritmo;
	return {
		peso: inRange(search.peso, GOAL_WEIGHT_MIN_KG, GOAL_WEIGHT_MAX_KG),
		meta: inRange(search.meta, GOAL_WEIGHT_MIN_KG, GOAL_WEIGHT_MAX_KG),
		altura: inRange(search.altura, HEIGHT_RANGE_CM.min, HEIGHT_RANGE_CM.max),
		ritmo:
			ritmo === "slow" || ritmo === "moderate" || ritmo === "fast"
				? ritmo
				: undefined,
	};
};

export const hasSignupPrefill = (p: SignupPrefill): boolean =>
	Object.values(p).some((v) => v !== undefined);

// Querystring para URLs fuera del router (redirecciones tras el registro).
export const signupPrefillQuery = (p: SignupPrefill): string => {
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(p)) {
		if (v !== undefined) params.set(k, String(v));
	}
	const qs = params.toString();
	return qs ? `?${qs}` : "";
};
