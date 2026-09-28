import {
	BellIcon,
	GraphDownIcon,
	InfoCircleIcon,
} from "@solar-icons/react/linear";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PremiumGate } from "#/components/premium-gate";
import { SuggestionsCarousel } from "#/components/suggestions-carousel";
import { fastsQuery } from "#/lib/fasts";
import { habitLogsQuery } from "#/lib/habits";
import type { HealthGoals } from "#/lib/health-types";
import {
	dailySuggestions,
	habitAverage,
	metricExplanations,
	reminders,
} from "#/lib/health-utils";
import { mealsQuery } from "#/lib/meals";
import { currentUserQuery } from "#/lib/profile";
import { weightStatsQuery } from "#/lib/statistics";
import {
	computeStats,
	formatWeightValue,
	sortByDateAsc,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/insights")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightStatsQuery());
		context.queryClient.ensureQueryData(habitLogsQuery());
		context.queryClient.ensureQueryData(mealsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
		context.queryClient.ensureQueryData(fastsQuery());
	},
	component: InsightsPage,
});

const EXPL: Array<{ key: keyof typeof metricExplanations; q: string }> = [
	{ key: "imc", q: "¿Qué significa mi IMC?" },
	{ key: "weightVariation", q: "¿Por qué mi peso puede variar tanto?" },
	{ key: "weeklyAverage", q: "¿Qué significa mi promedio semanal?" },
	{
		key: "trend",
		q: "¿Por qué mirar la tendencia y no solo el peso de hoy?",
	},
	{ key: "calorieGoal", q: "¿Qué significa mi objetivo calórico?" },
];

function InsightsPage() {
	const { entries, unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const habits = useSuspenseQuery(habitLogsQuery()).data!;
	const meals = useSuspenseQuery(mealsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const fasts = useSuspenseQuery(fastsQuery()).data!;
	const isPremium = !!me?.isPro;

	const goals: HealthGoals = useMemo(
		() => ({
			water: me?.waterGoal != null ? Number(me.waterGoal) : 2000,
			steps: me?.stepsGoal != null ? Number(me.stepsGoal) : 8000,
			sleep: me?.sleepGoal != null ? Number(me.sleepGoal) : 8,
			calories: me?.calorieGoal != null ? Number(me.calorieGoal) : 2000,
			protein: me?.proteinGoal != null ? Number(me.proteinGoal) : 100,
		}),
		[me],
	);

	const suggestions = useMemo(
		() =>
			dailySuggestions({
				entries,
				habits,
				meals,
				fasts,
				goals,
				heightCm: me?.height != null ? Number(me.height) : null,
				tz: me?.timezone ?? undefined,
			}),
		[entries, habits, meals, fasts, goals, me?.height, me?.timezone],
	);

	const rems = useMemo(
		() => reminders({ entries, habits, meals }),
		[entries, habits, meals],
	);

	const advancedTips = useMemo(() => {
		const out: string[] = [];
		const waterAvg = habitAverage(habits, "water", 7);
		const stepsAvg = habitAverage(habits, "steps", 7);
		if (waterAvg > 0 && waterAvg < goals.water * 0.7)
			out.push(
				"Tu consumo de agua ha estado por debajo del objetivo esta semana. Intenta añadir un vaso más en cada comida.",
			);
		if (stepsAvg > 0 && stepsAvg < goals.steps * 0.7)
			out.push(
				"Tu promedio de pasos bajó. Un paseo de 15 minutos puede ayudarte a recuperar el ritmo.",
			);
		const asc = sortByDateAsc(entries);
		if (asc.length >= 4) {
			const stats = computeStats(entries);
			if (stats.trend < -0.001)
				out.push(
					`Tu tendencia es descendente (${formatWeightValue(Math.abs(stats.weeklyChange || 0), unit)} esta semana). Buen progreso.`,
				);
			else if (stats.trend > 0.001)
				out.push(
					"Tu tendencia es ascendente. Revisa alimentación y actividad si tu objetivo es bajar.",
				);
		}
		if (out.length === 0)
			out.push(
				"Mantén la consistencia en el registro: los datos fiables generan mejores insights.",
			);
		return out;
	}, [entries, habits, goals, unit]);

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Recomendaciones</h1>

			<SuggestionsCarousel suggestions={suggestions} max={6} />

			{rems.length > 0 && (
				<div className="space-y-2">
					<div className="font-display text-sm">Recordatorios</div>
					{rems.map((r) => (
						<div
							key={r}
							className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3"
						>
							<BellIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
							<span className="text-sm">{r}</span>
						</div>
					))}
				</div>
			)}

			<div className="space-y-2">
				<div className="font-display text-sm">Explicación de métricas</div>
				{EXPL.map((e) => (
					<div
						key={e.key}
						className="rounded-xl bg-card border border-border p-3"
					>
						<div className="flex items-center gap-2 mb-1">
							<InfoCircleIcon className="w-3.5 h-3.5 text-primary" />
							<span className="text-sm font-medium">{e.q}</span>
						</div>
						<p className="text-xs text-muted-foreground text-pretty">
							{metricExplanations[e.key]}
						</p>
					</div>
				))}
			</div>

			{isPremium ? (
				<div className="space-y-2">
					<div className="font-display text-sm">Análisis avanzado</div>
					{advancedTips.map((t) => (
						<div
							key={t}
							className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3"
						>
							<GraphDownIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
							<span className="text-sm">{t}</span>
						</div>
					))}
				</div>
			) : (
				<PremiumGate
					title="Análisis avanzado"
					description="Consejos personalizados según tus tendencias de peso, hidratación y actividad con Premium."
				/>
			)}
		</div>
	);
}
