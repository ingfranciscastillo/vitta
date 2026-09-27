import {
	cmToInches,
	inchesToCm,
	toDisplay,
	type WeightUnit,
} from "#/lib/weight-utils";

export type HeightUnit = "cm" | "ft";

// Rango de altura aceptado en onboarding y calculadoras (en cm).
export const HEIGHT_RANGE_CM = { min: 100, max: 250 } as const;
export type UnitSystem = "metric" | "imperial";

export const UNIT_SYSTEMS: Record<
	UnitSystem,
	{
		label: string;
		hint: string;
		weightUnit: WeightUnit;
		heightUnit: HeightUnit;
	}
> = {
	metric: {
		label: "Métrico",
		hint: "kg · cm",
		weightUnit: "kg",
		heightUnit: "cm",
	},
	imperial: {
		label: "Imperial",
		hint: "lb · in",
		weightUnit: "lb",
		heightUnit: "ft",
	},
};

// La unidad de peso manda: es la que el usuario ve en toda la app.
export const unitSystemOf = (weightUnit: WeightUnit): UnitSystem =>
	weightUnit === "lb" ? "imperial" : "metric";

// Unidad de longitud efectiva. Se deriva del sistema para que cuentas con
// una combinación antigua (p. ej. lb + cm) se vean coherentes.
export const lengthUnitOf = (weightUnit: WeightUnit): HeightUnit =>
	UNIT_SYSTEMS[unitSystemOf(weightUnit)].heightUnit;

// En la base de datos el valor imperial de altura se llama "ft", pero la
// app siempre trabaja y muestra pulgadas.
export const lengthUnitLabel = (heightUnit: HeightUnit): "cm" | "in" =>
	heightUnit === "ft" ? "in" : "cm";

export const lengthToDisplay = (cm: number, heightUnit: HeightUnit): number =>
	heightUnit === "ft" ? cmToInches(cm) : cm;

export const lengthFromDisplay = (
	value: number,
	heightUnit: HeightUnit,
): number => (heightUnit === "ft" ? inchesToCm(value) : value);

export const PACE_KG_PER_WEEK = {
	slow: 0.25,
	moderate: 0.5,
	fast: 0.75,
} as const;

const PACE_LABELS = {
	slow: "Lento",
	moderate: "Moderado",
	fast: "Rápido",
} as const;

export type Pace = keyof typeof PACE_KG_PER_WEEK;

export const paceLabel = (pace: Pace, unit: WeightUnit): string => {
	const perWeek = Number(toDisplay(PACE_KG_PER_WEEK[pace], unit).toFixed(2));
	return `${PACE_LABELS[pace]} (${perWeek} ${unit}/sem)`;
};
