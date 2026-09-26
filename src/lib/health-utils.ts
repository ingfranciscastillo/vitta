import type {
	Activity,
	BodyMeasurement,
	Fast,
	HabitLog,
	HealthGoals,
	Meal,
} from "#/lib/health-types";
import {
	calcIMC,
	computeStreaks,
	dateStr,
	sortByDateAsc,
	todayStr,
	type WeightEntry,
} from "#/lib/weight-utils";

const DAY_MS = 86400000;
const MIN_MS = 60000;

export const lastNDateStrings = (n: number, tz?: string): string[] => {
	const out: string[] = [];
	const base = new Date();
	const fmt = tz
		? new Intl.DateTimeFormat("en-CA", {
				timeZone: tz,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
		: null;
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(base.getTime() - i * DAY_MS);
		if (fmt) {
			const parts = fmt.formatToParts(d);
			const y = parts.find((p) => p.type === "year")?.value ?? "";
			const m = parts.find((p) => p.type === "month")?.value ?? "";
			const day = parts.find((p) => p.type === "day")?.value ?? "";
			out.push(`${y}-${m}-${day}`);
		} else {
			out.push(dateStr(d));
		}
	}
	return out;
};

export const daysSince = (dStr: string | null | undefined): number => {
	if (!dStr) return Infinity;
	const t = new Date(`${dStr}T00:00:00`).getTime();
	return Math.floor((Date.now() - t) / DAY_MS);
};

type MacroTotals = {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
};

export const mealTotals = (meals: Meal[], date: string): MacroTotals => {
	const dayMeals = meals.filter((m) => m.date === date);
	return dayMeals.reduce(
		(acc, m) => ({
			calories: acc.calories + (m.calories || 0),
			protein: acc.protein + (m.protein || 0),
			carbs: acc.carbs + (m.carbs || 0),
			fat: acc.fat + (m.fat || 0),
		}),
		{ calories: 0, protein: 0, carbs: 0, fat: 0 },
	);
};

export const mealTotalsRange = (meals: Meal[], dates: string[]): MacroTotals =>
	dates.reduce(
		(acc, d) => {
			const t = mealTotals(meals, d);
			return {
				calories: acc.calories + t.calories,
				protein: acc.protein + t.protein,
				carbs: acc.carbs + t.carbs,
				fat: acc.fat + t.fat,
			};
		},
		{ calories: 0, protein: 0, carbs: 0, fat: 0 },
	);

export const habitValue = (
	habits: HabitLog[],
	type: HabitLog["type"],
	date: string,
): number => {
	const rec = habits.find((h) => h.type === type && h.date === date);
	return rec ? rec.value || 0 : 0;
};

export const habitToday = (
	habits: HabitLog[],
	type: HabitLog["type"],
): number => habitValue(habits, type, todayStr());

export const habitAverage = (
	habits: HabitLog[],
	type: HabitLog["type"],
	days = 7,
): number => {
	const dates = lastNDateStrings(days);
	const vals = dates
		.map((d) => habitValue(habits, type, d))
		.filter((v) => v > 0);
	return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
};

export const habitHistory = (
	habits: HabitLog[],
	type: HabitLog["type"],
	days = 7,
): Array<{ date: string; value: number }> =>
	lastNDateStrings(days).map((d) => ({
		date: d,
		value: habitValue(habits, type, d),
	}));

export type ActivityStats = {
	totalMinutes: number;
	sessions: number;
	topType: string | null;
};

export const activityStats = (
	activities: Activity[],
	days = 7,
): ActivityStats => {
	const dates = new Set(lastNDateStrings(days));
	const week = activities.filter((a) => dates.has(a.date));
	const totalMinutes = week.reduce((s, a) => s + (a.durationMinutes || 0), 0);
	const typeCount: Record<string, number> = {};
	for (const a of week) typeCount[a.type] = (typeCount[a.type] || 0) + 1;
	const topType =
		Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
	return { totalMinutes, sessions: week.length, topType };
};

export type FastStats = {
	completed: number;
	avgDuration: number;
	longest: number;
	active: Fast | undefined;
};

export const fastStats = (fasts: Fast[]): FastStats => {
	const completed = fasts.filter(
		(f) => f.status === "completed" && f.durationMinutes,
	);
	const active = fasts.find((f) => f.status === "active");
	const durations = completed
		.map((f) => f.durationMinutes ?? 0)
		.filter((d) => d > 0);
	return {
		completed: completed.length,
		avgDuration: durations.length
			? durations.reduce((s, d) => s + d, 0) / durations.length
			: 0,
		longest: durations.length ? Math.max(...durations) : 0,
		active,
	};
};

export const fastElapsedMinutes = (fast: Fast | null | undefined): number => {
	if (fast?.status !== "active" || !fast.startedAt) return 0;
	return Math.max(
		0,
		Math.round((Date.now() - new Date(fast.startedAt).getTime()) / MIN_MS),
	);
};

export const fastElapsedSeconds = (fast: Fast | null | undefined): number => {
	if (fast?.status !== "active" || !fast.startedAt) return 0;
	return Math.max(
		0,
		Math.round((Date.now() - new Date(fast.startedAt).getTime()) / 1000),
	);
};

export const imcSeries = (
	entries: WeightEntry[],
	heightCm: number,
): Array<{ date: string; value: number | null }> =>
	sortByDateAsc(entries)
		.map((e) => ({ date: e.date, value: calcIMC(e.weight, heightCm) }))
		.filter((p) => p.value != null);

export const healthyWeightRange = (
	heightCm: number,
): { min: number; max: number } | null => {
	if (!heightCm) return null;
	const m = heightCm / 100;
	return { min: 18.5 * m * m, max: 24.9 * m * m };
};

export const measurementSeries = (
	measurements: BodyMeasurement[],
	type: BodyMeasurement["type"],
): Array<{ date: string; value: number }> =>
	sortByDateAsc(measurements.filter((m) => m.type === type)).map((m) => ({
		date: m.date,
		value: m.value,
	}));

export const latestMeasurement = (
	measurements: BodyMeasurement[],
	type: BodyMeasurement["type"],
): BodyMeasurement | null => {
	const list = measurements.filter((m) => m.type === type);
	if (!list.length) return null;
	return sortByDateAsc(list).pop() ?? null;
};

export type WeeklySummary = {
	weightChange: number | null;
	avgWeight: number | null;
	waterAvg: number;
	stepsAvg: number;
	sleepAvg: number;
	mealTotals7: MacroTotals;
	actStats: ActivityStats;
	fastsCount: number;
	compliance: {
		water: number;
		steps: number;
		sleep: number;
		calories: number;
	};
	dates: string[];
};

export const weeklySummary = (args: {
	entries: WeightEntry[];
	habits: HabitLog[];
	meals: Meal[];
	activities: Activity[];
	fasts: Fast[];
	goals: HealthGoals;
}): WeeklySummary => {
	const { entries, habits, meals, activities, fasts, goals } = args;
	const dates = lastNDateStrings(7);
	const asc = sortByDateAsc(entries);
	const weekEntries = asc.filter((e) => dates.includes(e.date));
	const weightChange =
		weekEntries.length >= 2
			? weekEntries[weekEntries.length - 1].weight - weekEntries[0].weight
			: null;
	const avgWeight = weekEntries.length
		? weekEntries.reduce((s, e) => s + e.weight, 0) / weekEntries.length
		: null;
	const waterAvg = habitAverage(habits, "water", 7);
	const stepsAvg = habitAverage(habits, "steps", 7);
	const sleepAvg = habitAverage(habits, "sleep", 7);
	const mealTotals7 = mealTotalsRange(meals, dates);
	const actStats = activityStats(activities, 7);
	const fastsCount = fasts.filter(
		(f) =>
			f.status === "completed" &&
			f.endedAt &&
			dates.includes(f.endedAt.slice(0, 10)),
	).length;
	const compliance = {
		water: Math.min(1, waterAvg / (goals.water || 1)),
		steps: Math.min(1, stepsAvg / (goals.steps || 1)),
		sleep: Math.min(1, sleepAvg / (goals.sleep || 1)),
		calories: Math.min(1, mealTotals7.calories / 7 / (goals.calories || 1)),
	};
	return {
		weightChange,
		avgWeight,
		waterAvg,
		stepsAvg,
		sleepAvg,
		mealTotals7,
		actStats,
		fastsCount,
		compliance,
		dates,
	};
};

export type SuggestionKind =
	| "weight-down"
	| "weight-up"
	| "weight-trend"
	| "water"
	| "steps"
	| "sleep"
	| "calories"
	| "protein"
	| "imc-high"
	| "imc-low"
	| "fast-active"
	| "fast-completed"
	| "streak-30"
	| "streak-7"
	| "streak-broken"
	| "empty";

export type TimeOfDay = "night" | "morning" | "afternoon" | "evening";

export const timeOfDay = (tz?: string): TimeOfDay => {
	const fmt = tz
		? new Intl.DateTimeFormat("en-US", {
				timeZone: tz,
				hour: "numeric",
				hour12: false,
			})
		: null;
	const hour = fmt ? Number(fmt.format(new Date())) : new Date().getHours();
	if (hour < 6) return "night";
	if (hour < 12) return "morning";
	if (hour < 18) return "afternoon";
	if (hour < 22) return "evening";
	return "night";
};

export type Suggestion = {
	id: string;
	kind: SuggestionKind;
	title: string;
	message: string;
	priority: number;
};

export type DailySuggestionsArgs = {
	entries: WeightEntry[];
	habits: HabitLog[];
	meals: Meal[];
	fasts?: Fast[];
	goals: HealthGoals;
	heightCm?: number | null;
	tz?: string;
};

const priorityOf = (kind: SuggestionKind): number => {
	switch (kind) {
		case "imc-high":
			return 90;
		case "imc-low":
			return 88;
		case "fast-active":
			return 86;
		case "water":
			return 85;
		case "steps":
			return 80;
		case "weight-up":
			return 70;
		case "sleep":
			return 65;
		case "calories":
			return 55;
		case "protein":
			return 52;
		case "fast-completed":
			return 48;
		case "weight-trend":
			return 45;
		case "weight-down":
			return 40;
		case "streak-30":
			return 35;
		case "streak-7":
			return 33;
		case "streak-broken":
			return 32;
		case "empty":
			return 10;
	}
};

const formatMl = (ml: number): string =>
	ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${Math.round(ml)} ml`;

const todayInTz = (tz?: string): string => {
	if (!tz) return todayStr();
	const fmt = new Intl.DateTimeFormat("en-CA", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = fmt.formatToParts(new Date());
	const y = parts.find((p) => p.type === "year")?.value ?? "";
	const m = parts.find((p) => p.type === "month")?.value ?? "";
	const d = parts.find((p) => p.type === "day")?.value ?? "";
	return `${y}-${m}-${d}`;
};

export const dailySuggestions = (args: DailySuggestionsArgs): Suggestion[] => {
	const { entries, habits, meals, fasts = [], goals, heightCm, tz } = args;
	const out: Suggestion[] = [];
	const asc = sortByDateAsc(entries);
	const today = todayInTz(tz);
	const waterGoal = goals.water || 2000;
	const stepsGoal = goals.steps || 8000;
	const caloriesGoal = goals.calories || 2000;
	const sleepGoal = goals.sleep || 8;
	const proteinGoal = goals.protein || 100;

	if (asc.length === 0) {
		out.push({
			id: `empty-${today}`,
			kind: "empty",
			title: "Empieza aquí",
			message: "Registra tu primer peso para comenzar a ver tu progreso.",
			priority: priorityOf("empty"),
		});
		return out;
	}

	const last = asc[asc.length - 1];
	const imc = heightCm && heightCm > 0 ? calcIMC(last.weight, heightCm) : null;
	if (imc != null) {
		if (imc >= 30) {
			out.push({
				id: `imc-high-${last.date}`,
				kind: "imc-high",
				title: "IMC alto",
				message: `Tu IMC (${imc.toFixed(1)}) está en rango de obesidad. Considera revisar tu plan con un profesional.`,
				priority: priorityOf("imc-high"),
			});
		} else if (imc >= 25) {
			out.push({
				id: `imc-high-${last.date}`,
				kind: "imc-high",
				title: "Sobrepeso",
				message: `Tu IMC (${imc.toFixed(1)}) está por encima del rango normal. Pequeños cambios diarios suman.`,
				priority: priorityOf("imc-high"),
			});
		} else if (imc < 18.5) {
			out.push({
				id: `imc-low-${last.date}`,
				kind: "imc-low",
				title: "IMC bajo",
				message: `Tu IMC (${imc.toFixed(1)}) está por debajo del rango normal. Asegúrate de comer suficiente.`,
				priority: priorityOf("imc-low"),
			});
		}
	}

	const activeFast = fasts.find((f) => f.status === "active");
	if (activeFast?.startedAt) {
		const elapsedH = Math.floor(
			(Date.now() - new Date(activeFast.startedAt).getTime()) / 3600000,
		);
		if (elapsedH >= 16) {
			out.push({
				id: `fast-active-${activeFast.id ?? activeFast.startedAt}`,
				kind: "fast-active",
				title: "Ayuno prolongado",
				message: `Llevas ${elapsedH} h en ayuno. Mantente hidratado y considera terminar si te sientes débil.`,
				priority: priorityOf("fast-active"),
			});
		}
	}

	if (
		!activeFast &&
		fasts.some((f) => {
			if (f.status !== "completed" || !f.endedAt) return false;
			const end = new Date(f.endedAt);
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			return (
				end.getFullYear() === yesterday.getFullYear() &&
				end.getMonth() === yesterday.getMonth() &&
				end.getDate() === yesterday.getDate()
			);
		})
	) {
		out.push({
			id: `fast-completed-${today}`,
			kind: "fast-completed",
			title: "Buen ritmo",
			message: "Ayer completaste un ayuno. Si te animas, hoy puedes repetir.",
			priority: priorityOf("fast-completed"),
		});
	}

	const water = habitToday(habits, "water");
	if (water < waterGoal * 0.5) {
		const remaining = Math.max(0, waterGoal - water);
		out.push({
			id: `water-${today}`,
			kind: "water",
			title: "Hidratación baja",
			message: `Te faltan ${formatMl(remaining)} de agua hoy. Un vaso más ahora te ayuda.`,
			priority: priorityOf("water"),
		});
	}

	const tod = timeOfDay(tz);
	const steps = habitToday(habits, "steps");
	if (steps < stepsGoal * 0.5 && (tod === "evening" || tod === "afternoon")) {
		const remaining = Math.max(0, stepsGoal - steps);
		const formatted =
			remaining >= 1000
				? `${(remaining / 1000).toFixed(1)}k`
				: `${Math.round(remaining)}`;
		out.push({
			id: `steps-${today}`,
			kind: "steps",
			title: "Pasos por debajo",
			message: `Te faltan ${formatted} pasos para tu objetivo. Un paseo corto cuenta.`,
			priority: priorityOf("steps"),
		});
	}

	if (asc.length >= 2) {
		const prev = asc[asc.length - 2];
		const diff = last.weight - prev.weight;
		if (diff < -0.1) {
			out.push({
				id: `weight-down-${last.date}`,
				kind: "weight-down",
				title: "Peso a la baja",
				message:
					"Tu peso bajó desde el último registro. Sigue con la constancia.",
				priority: priorityOf("weight-down"),
			});
		} else if (diff > 0.3) {
			out.push({
				id: `weight-up-${last.date}`,
				kind: "weight-up",
				title: "Pequeño repunte",
				message:
					"Tu peso subió un poco. Las fluctuaciones diarias son normales; mira la tendencia semanal.",
				priority: priorityOf("weight-up"),
			});
		}
	}

	const sleepAvg = habitAverage(habits, "sleep", 7);
	if (sleepAvg > 0 && sleepAvg < sleepGoal - 1) {
		const deficit = (sleepGoal - sleepAvg).toFixed(1);
		out.push({
			id: `sleep-${today}`,
			kind: "sleep",
			title: "Sueño bajo",
			message: `Duermes ${deficit} h menos de tu objetivo. Acostarte un poco antes ayuda.`,
			priority: priorityOf("sleep"),
		});
	}

	const mealsToday = mealTotals(meals, today);
	if (mealsToday.calories > caloriesGoal * 1.1) {
		const over = Math.round(mealsToday.calories - caloriesGoal);
		out.push({
			id: `calories-${today}`,
			kind: "calories",
			title: "Calorías por encima",
			message: `Hoy llevas ${over} kcal extra. Mañana puedes ajustar el ritmo.`,
			priority: priorityOf("calories"),
		});
	}

	if (mealsToday.protein > 0 && mealsToday.protein < proteinGoal * 0.6) {
		const deficit = Math.round(proteinGoal - mealsToday.protein);
		out.push({
			id: `protein-${today}`,
			kind: "protein",
			title: "Proteína baja",
			message: `Te faltan ${deficit} g de proteína hoy. Apunta a ${proteinGoal} g para recuperarte mejor.`,
			priority: priorityOf("protein"),
		});
	}

	const { current: streakCurrent, best: streakBest } = computeStreaks(entries);
	if (streakCurrent >= 30) {
		out.push({
			id: `streak-30-${today}`,
			kind: "streak-30",
			title: "Mes registrando",
			message: `Llevas ${streakCurrent} días seguidos registrando peso. Eso ya es un hábito.`,
			priority: priorityOf("streak-30"),
		});
	} else if (streakCurrent >= 7) {
		out.push({
			id: `streak-7-${today}`,
			kind: "streak-7",
			title: "Racha activa",
			message: `Llevas ${streakCurrent} días seguidos registrando. La constancia es la que genera resultados.`,
			priority: priorityOf("streak-7"),
		});
	} else if (streakBest >= 5 && streakCurrent < streakBest) {
		out.push({
			id: `streak-broken-${today}`,
			kind: "streak-broken",
			title: "Recomenzar",
			message: `Tu mejor racha fue de ${streakBest} días. Hoy puedes empezar otra.`,
			priority: priorityOf("streak-broken"),
		});
	}

	out.sort((a, b) => b.priority - a.priority);
	return out;
};

export const dailySuggestion = (args: DailySuggestionsArgs): string => {
	const list = dailySuggestions(args);
	if (list.length === 0)
		return "Vas bien. Sigue registrando tus hábitos para mantener la constancia.";
	return list[0]?.message ?? "Vas bien. Sigue registrando tus hábitos.";
};

export const reminders = (args: {
	entries: WeightEntry[];
	habits: HabitLog[];
	meals: Meal[];
}): string[] => {
	const { entries, habits, meals } = args;
	const out: string[] = [];
	const today = todayStr();
	const asc = sortByDateAsc(entries);
	const lastEntryDate = asc.length ? asc[asc.length - 1].date : null;
	if (!lastEntryDate || daysSince(lastEntryDate) >= 3)
		out.push("Llevas unos días sin registrar tu peso.");
	if (habitValue(habits, "water", today) === 0)
		out.push("Aún no has registrado agua hoy.");
	if (habitValue(habits, "steps", today) === 0)
		out.push("Registra tus pasos de hoy.");
	if (mealTotals(meals, today).calories === 0)
		out.push("Añade tus comidas del día.");
	return out.slice(0, 3);
};

export const metricExplanations = {
	imc: "El IMC relaciona peso y altura como orientación general. No distingue músculo de grasa, así que úsalo como referencia, no como diagnóstico.",
	weightVariation:
		"Tu peso puede variar día a día por hidratación, alimentación, ciclo o momento del día. Lo útil es mirar la tendencia semanal, no un solo valor.",
	weeklyAverage:
		"El promedio semanal suaviza las variaciones diarias y muestra mejor la dirección real de tu progreso.",
	trend:
		"La tendencia resume hacia dónde va tu peso a lo largo del tiempo y es más fiable que comparar solo dos registros.",
	calorieGoal:
		"Tu objetivo calórico es una guía orientativa. Ajústalo según tu actividad y cómo te sientes; no es una prescripción médica.",
	fasting:
		"El ayuno intermitente consiste en alternar periodos sin comer con ventanas de alimentación. La duración ideal varía por persona; consulta a un profesional si tienes dudas.",
};

export const MEASUREMENT_TYPES: Array<{
	id: BodyMeasurement["type"];
	label: string;
	unit: string;
}> = [
	{ id: "waist", label: "Cintura", unit: "cm" },
	{ id: "hip", label: "Cadera", unit: "cm" },
	{ id: "chest", label: "Pecho", unit: "cm" },
	{ id: "arm", label: "Brazos", unit: "cm" },
	{ id: "thigh", label: "Muslos", unit: "cm" },
	{ id: "neck", label: "Cuello", unit: "cm" },
	{ id: "body_fat", label: "% Grasa", unit: "%" },
];

export const HABIT_META: Record<
	HabitLog["type"],
	{ label: string; unit: string; step: number; icon: string }
> = {
	water: { label: "Agua", unit: "ml", step: 250, icon: "Drop" },
	steps: { label: "Pasos", unit: "", step: 500, icon: "Steps" },
	sleep: { label: "Sueño", unit: "h", step: 0.5, icon: "Moon" },
};
