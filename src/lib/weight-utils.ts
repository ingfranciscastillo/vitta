export const LB_PER_KG = 2.2046226218;

export type WeightUnit = "kg" | "lb";

export type WeightEntry = {
	id?: string;
	createdById?: string;
	date: string;
	weight: number;
	time?: string | null;
	note?: string | null;
	createdAt?: string;
};

export type Goal = {
	target_weight?: number | null;
	target_date?: string | null;
	pace?: "slow" | "moderate" | "fast";
	start_weight?: number | null;
	start_date?: string | null;
};

// Rango válido para el peso objetivo (en kg). El máximo también protege
// la columna numeric(6,2) de la tabla goal.
export const GOAL_WEIGHT_MIN_KG = 20;
export const GOAL_WEIGHT_MAX_KG = 400;

export const kgToLb = (kg: number): number => kg * LB_PER_KG;
export const lbToKg = (lb: number): number => lb / LB_PER_KG;
export const toDisplay = (kg: number, unit: WeightUnit): number =>
	unit === "lb" ? kgToLb(kg) : kg;
export const fromDisplay = (val: number, unit: WeightUnit): number =>
	unit === "lb" ? lbToKg(val) : val;
export const formatWeightValue = (
	kg: number,
	unit: WeightUnit,
	digits = 1,
): string => toDisplay(kg, unit).toFixed(digits);
export const formatWeight = (
	kg: number,
	unit: WeightUnit,
	digits = 1,
): string => `${formatWeightValue(kg, unit, digits)} ${unit}`;
export const formatDelta = (
	kg: number,
	unit: WeightUnit,
	digits = 1,
): string => {
	const v = toDisplay(Math.abs(kg), unit).toFixed(digits);
	const sign = kg > 0 ? "+" : kg < 0 ? "−" : "";
	return `${sign}${v} ${unit}`;
};

export const cmToInches = (cm: number): number => cm / 2.54;
export const inchesToCm = (inch: number): number => inch * 2.54;

export const calcIMC = (kg: number, heightCm: number): number | null => {
	if (!heightCm || heightCm <= 0 || !kg) return null;
	const m = heightCm / 100;
	return kg / (m * m);
};

export type ImcTone = "blue" | "green" | "amber" | "red";
export type ImcCategory = { label: string; tone: ImcTone };

export const imcCategory = (imc: number | null): ImcCategory | null => {
	if (imc == null) return null;
	if (imc < 18.5) return { label: "Bajo peso", tone: "blue" };
	if (imc < 25) return { label: "Normal", tone: "green" };
	if (imc < 30) return { label: "Sobrepeso", tone: "amber" };
	return { label: "Obesidad", tone: "red" };
};

export const dateStr = (d: Date): string => {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
};
export const todayStr = (): string => dateStr(new Date());
export const nowTimeStr = (): string => {
	const d = new Date();
	return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
export const combineDateTime = (date: string, time: string): string => {
	if (!date || !time) return "";
	const t = time.length >= 5 ? time.slice(0, 5) : time;
	return `${date}T${t}`;
};

export const parseLocalDateTime = (s: string): Date | null => {
	const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
	if (!m) return null;
	const [, y, mo, d, h, mi] = m;
	return new Date(
		Number(y),
		Number(mo) - 1,
		Number(d),
		Number(h),
		Number(mi),
		0,
		0,
	);
};

export const formatDateInTimeZone = (iso: string, tz?: string): string => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	try {
		return new Intl.DateTimeFormat("en-CA", {
			timeZone: tz ?? "UTC",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(date);
	} catch {
		return iso.slice(0, 10);
	}
};
export const formatDate = (
	dStr: string,
	opts?: Intl.DateTimeFormatOptions,
): string => {
	if (!dStr) return "";
	const d = new Date(`${dStr}T00:00:00`);
	return d.toLocaleDateString(
		"es-ES",
		opts || { day: "numeric", month: "short", year: "numeric" },
	);
};

const average = (arr: number[]): number | null =>
	!arr || arr.length === 0 ? null : arr.reduce((s, x) => s + x, 0) / arr.length;

export const sortByDateAsc = <
	T extends { date: string; time?: string | null; createdAt?: string },
>(
	entries: T[],
): T[] =>
	[...entries].sort((a, b) => {
		const d = a.date.localeCompare(b.date);
		if (d !== 0) return d;
		const t = (a.time ?? "").localeCompare(b.time ?? "");
		if (t !== 0) return t;
		return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
	});

export const sortByDateDesc = <
	T extends { date: string; time?: string | null; createdAt?: string },
>(
	entries: T[],
): T[] => [...sortByDateAsc(entries)].reverse();

const daysBetween = (d1: string, d2: string): number =>
	Math.round(
		(new Date(`${d2}T00:00:00`).getTime() -
			new Date(`${d1}T00:00:00`).getTime()) /
			86400000,
	);

const valueNDaysAgo = (asc: WeightEntry[], n: number): number | null => {
	if (asc.length === 0) return null;
	const target =
		new Date(`${asc[asc.length - 1].date}T00:00:00`).getTime() - n * 86400000;
	let best = asc[0];
	let bestDiff = Math.abs(
		new Date(`${asc[0].date}T00:00:00`).getTime() - target,
	);
	for (const e of asc) {
		const diff = Math.abs(new Date(`${e.date}T00:00:00`).getTime() - target);
		if (diff < bestDiff) {
			best = e;
			bestDiff = diff;
		}
	}
	return best.weight;
};

const lastNDaysEntries = (asc: WeightEntry[], n: number): WeightEntry[] => {
	if (asc.length === 0) return [];
	const cutoff =
		new Date(`${asc[asc.length - 1].date}T00:00:00`).getTime() - n * 86400000;
	return asc.filter((e) => new Date(`${e.date}T00:00:00`).getTime() >= cutoff);
};

export const linearTrend = (asc: WeightEntry[]): number => {
	if (asc.length < 2) return 0;
	const n = asc.length;
	const xs = asc.map((_, i) => i);
	const ys = asc.map((e) => e.weight);
	const sx = xs.reduce((a, b) => a + b, 0);
	const sy = ys.reduce((a, b) => a + b, 0);
	const sxy = xs.reduce((s, x, i) => s + x * ys[i], 0);
	const sxx = xs.reduce((s, x) => s + x * x, 0);
	const denom = n * sxx - sx * sx;
	return denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
};

export const movingAverageSeries = (
	asc: WeightEntry[],
	window = 7,
): { date: string; ma: number | null }[] =>
	asc.map((_, i) => {
		const start = Math.max(0, i - window + 1);
		return {
			date: asc[i].date,
			ma: average(asc.slice(start, i + 1).map((x) => x.weight)),
		};
	});

export const trendSeries = (
	asc: WeightEntry[],
): { date: string; trend: number }[] => {
	if (asc.length < 2) return [];
	const n = asc.length;
	const xs = asc.map((_, i) => i);
	const ys = asc.map((e) => e.weight);
	const sx = xs.reduce((a, b) => a + b, 0);
	const sy = ys.reduce((a, b) => a + b, 0);
	const sxy = xs.reduce((s, x, i) => s + x * ys[i], 0);
	const sxx = xs.reduce((s, x) => s + x * x, 0);
	const denom = n * sxx - sx * sx || 1;
	const slope = (n * sxy - sx * sy) / denom;
	const intercept = (sy - slope * sx) / n;
	return asc.map((e, i) => ({ date: e.date, trend: slope * i + intercept }));
};

export type Stats = {
	count: number;
	current: number | null;
	first: number | null;
	changeVsLast: number;
	changeSinceStart: number;
	days: number;
	avg7: number | null;
	avg30: number | null;
	max: number | null;
	min: number | null;
	avg: number | null;
	biggestLoss: number;
	biggestGain: number;
	weeklyChange: number | null;
	monthlyChange: number | null;
	totalLost: number;
	totalGained: number;
	trend: number;
};

export const computeStats = (entries: WeightEntry[]): Stats => {
	const asc = sortByDateAsc(entries);
	if (asc.length === 0)
		return {
			count: 0,
			current: null,
			first: null,
			changeVsLast: 0,
			changeSinceStart: 0,
			days: 0,
			avg7: null,
			avg30: null,
			max: null,
			min: null,
			avg: null,
			biggestLoss: 0,
			biggestGain: 0,
			weeklyChange: null,
			monthlyChange: null,
			totalLost: 0,
			totalGained: 0,
			trend: 0,
		};
	const current = asc[asc.length - 1].weight;
	const first = asc[0].weight;
	const changeVsLast =
		asc.length > 1 ? current - asc[asc.length - 2].weight : 0;
	const changeSinceStart = current - first;
	const days = daysBetween(asc[0].date, asc[asc.length - 1].date) + 1;
	const avg7 = average(lastNDaysEntries(asc, 7).map((e) => e.weight));
	const avg30 = average(lastNDaysEntries(asc, 30).map((e) => e.weight));
	const weights = asc.map((e) => e.weight);
	const max = Math.max(...weights);
	const min = Math.min(...weights);
	const avg = average(weights);
	const diffs: number[] = [];
	for (let i = 1; i < asc.length; i++)
		diffs.push(asc[i].weight - asc[i - 1].weight);
	const biggestLoss = diffs.length ? Math.min(...diffs) : 0;
	const biggestGain = diffs.length ? Math.max(...diffs) : 0;
	const weeklyChange =
		asc.length > 1 ? current - (valueNDaysAgo(asc, 7) ?? current) : null;
	const monthlyChange =
		asc.length > 1 ? current - (valueNDaysAgo(asc, 30) ?? current) : null;
	const totalLost = diffs
		.filter((d) => d < 0)
		.reduce((s, d) => s + Math.abs(d), 0);
	const totalGained = diffs.filter((d) => d > 0).reduce((s, d) => s + d, 0);
	const trend = linearTrend(asc);
	return {
		count: asc.length,
		current,
		first,
		changeVsLast,
		changeSinceStart,
		days,
		avg7,
		avg30,
		max,
		min,
		avg,
		biggestLoss,
		biggestGain,
		weeklyChange,
		monthlyChange,
		totalLost,
		totalGained,
		trend,
	};
};

export type Streaks = {
	current: number;
	best: number;
	dates: string[];
};

export const computeStreaks = (entries: WeightEntry[]): Streaks => {
	const dates = new Set(entries.map((e) => e.date));
	const sortedDates = [...dates].sort();
	let current = 0;
	const cursor = new Date();
	if (!dates.has(dateStr(cursor))) cursor.setDate(cursor.getDate() - 1);
	while (dates.has(dateStr(cursor))) {
		current++;
		cursor.setDate(cursor.getDate() - 1);
	}
	let best = 0;
	let run = 0;
	let prev: string | null = null;
	for (const d of sortedDates) {
		if (prev && daysBetween(prev, d) === 1) run++;
		else run = 1;
		best = Math.max(best, run);
		prev = d;
	}
	return { current, best, dates: sortedDates };
};

export const computeInsights = (
	entries: WeightEntry[],
	goal: Goal | null | undefined,
	unit: WeightUnit,
): string[] => {
	const out: string[] = [];
	const asc = sortByDateAsc(entries);
	if (asc.length === 0) return out;
	const stats = computeStats(entries);
	if (asc.length >= 2) {
		const weekAgo = valueNDaysAgo(asc, 7);
		const diff =
			stats.current != null && weekAgo != null ? stats.current - weekAgo : 0;
		if (Math.abs(diff) > 0.01) {
			out.push(
				diff < 0
					? `Tu peso bajó ${formatWeightValue(Math.abs(diff), unit)} esta semana.`
					: `Tu peso subió ${formatWeightValue(Math.abs(diff), unit)} esta semana.`,
			);
		}
	}
	out.push(
		stats.trend < -0.001
			? "Tu tendencia es descendente."
			: stats.trend > 0.001
				? "Tu tendencia es ascendente."
				: "Tu tendencia es estable.",
	);
	out.push(`Llevas ${stats.days} días registrando peso.`);
	if (goal && goal.target_weight != null) {
		const remaining = (stats.current ?? 0) - goal.target_weight;
		out.push(
			`Estás a ${formatWeightValue(Math.abs(remaining), unit)} ${unit} de tu objetivo.`,
		);
	}
	return out;
};

export type AchievementIconKey =
	| "Award"
	| "Flame"
	| "Hash"
	| "TrendingDown"
	| "Target";

export type ComputedAchievement = {
	id: string;
	label: string;
	icon: AchievementIconKey;
	unlocked: boolean;
	progress: number;
};

export const computeAchievements = (
	entries: WeightEntry[],
	goal: Goal | null | undefined,
	unit: WeightUnit,
): ComputedAchievement[] => {
	const asc = sortByDateAsc(entries);
	const stats = computeStats(entries);
	const streaks = computeStreaks(entries);
	const goalResult =
		goal &&
		goal.start_weight != null &&
		goal.target_weight != null &&
		stats.current != null
			? computeGoalProgress(
					goal.start_weight,
					stats.current,
					goal.target_weight,
				)
			: null;
	const goalProgress = goalResult ? goalResult.pct / 100 : 0;
	// Respeta la dirección del objetivo (bajar o subir de peso).
	const goalReached =
		goalResult != null && goalResult.status !== "in-progress";
	void unit;
	return [
		{
			id: "first",
			label: "Primer registro",
			icon: "Award",
			unlocked: asc.length >= 1,
			progress: Math.min(1, asc.length),
		},
		{
			id: "streak7",
			label: "7 días seguidos",
			icon: "Flame",
			unlocked: streaks.best >= 7,
			progress: Math.min(1, streaks.best / 7),
		},
		{
			id: "streak30",
			label: "30 días seguidos",
			icon: "Flame",
			unlocked: streaks.best >= 30,
			progress: Math.min(1, streaks.best / 30),
		},
		{
			id: "count100",
			label: "100 registros",
			icon: "Hash",
			unlocked: asc.length >= 100,
			progress: Math.min(1, asc.length / 100),
		},
		{
			id: "firstKg",
			label: "Primer kilo perdido",
			icon: "TrendingDown",
			unlocked: stats.totalLost >= 1,
			progress: Math.min(1, stats.totalLost),
		},
		{
			id: "fiveKg",
			label: "5 kg perdidos",
			icon: "TrendingDown",
			unlocked: stats.totalLost >= 5,
			progress: Math.min(1, stats.totalLost / 5),
		},
		{
			id: "goal",
			label: "Meta alcanzada",
			icon: "Target",
			unlocked: goalReached,
			progress: goalProgress,
		},
	];
};

export const estimateGoalDate = (
	current: number,
	target: number,
	pace: "slow" | "moderate" | "fast",
): string | null => {
	const pacePerWeek =
		({ slow: 0.25, moderate: 0.5, fast: 0.75 } as const)[pace] || 0.5;
	const diff = Math.abs(current - target);
	if (diff < 0.01) return null;
	const weeks = diff / pacePerWeek;
	const d = new Date();
	d.setDate(d.getDate() + Math.round(weeks * 7));
	return dateStr(d);
};

export type GoalStatus = "in-progress" | "completed" | "exceeded";

export type GoalProgress = {
	pct: number; // 0-100, clampeado
	status: GoalStatus;
	remaining: number; // target - current, con signo (positivo = falta, negativo = te pasaste)
};

export const computeGoalProgress = (
	start: number,
	current: number,
	target: number,
): GoalProgress => {
	const totalSigned = start - target;
	const remaining = target - current;

	if (totalSigned === 0) {
		return { pct: 100, status: "completed", remaining: 0 };
	}

	const doneSigned = start - current;
	const rawPct = (doneSigned / totalSigned) * 100;
	const pct = Math.min(100, Math.max(0, rawPct));

	// "exceeded" = se movió más allá de la meta en la dirección correcta del objetivo
	const goingDown = target < start;
	const exceeded = goingDown ? current < target : current > target;

	return {
		pct,
		status: exceeded ? "exceeded" : pct >= 100 ? "completed" : "in-progress",
		remaining,
	};
};
