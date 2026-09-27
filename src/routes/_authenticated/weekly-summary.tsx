import {
	DumbbellIcon,
	FireIcon,
	GraphDownIcon,
	GraphUpIcon,
	MoonIcon,
	ScaleIcon,
	StopwatchIcon,
	WalkingIcon,
	WaterdropIcon,
} from "@solar-icons/react/linear";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PremiumGate } from "#/components/premium-gate";
import { ProgressBar } from "#/components/progress-bar";
import { StatCard } from "#/components/stat-card";
import { activitiesQuery } from "#/lib/activities";
import { fastsQuery } from "#/lib/fasts";
import { habitLogsQuery } from "#/lib/habits";
import type { HealthGoals } from "#/lib/health-types";
import { weeklySummary } from "#/lib/health-utils";
import { mealsQuery } from "#/lib/meals";
import { currentUserQuery } from "#/lib/profile";
import { weightStatsQuery } from "#/lib/statistics";
import { formatDelta, formatWeightValue } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/weekly-summary")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightStatsQuery());
		context.queryClient.ensureQueryData(habitLogsQuery());
		context.queryClient.ensureQueryData(mealsQuery());
		context.queryClient.ensureQueryData(activitiesQuery());
		context.queryClient.ensureQueryData(fastsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: WeeklySummaryPage,
});

function WeeklySummaryPage() {
	const { entries, unit } = useSuspenseQuery(weightStatsQuery()).data!;
	const habits = useSuspenseQuery(habitLogsQuery()).data!;
	const meals = useSuspenseQuery(mealsQuery()).data!;
	const activities = useSuspenseQuery(activitiesQuery()).data!;
	const fasts = useSuspenseQuery(fastsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;

	const goals: HealthGoals = useMemo(
		() => ({
			water: me?.waterGoal != null ? Number(me.waterGoal) : 2000,
			steps: me?.stepsGoal != null ? Number(me.stepsGoal) : 8000,
			sleep: me?.sleepGoal != null ? Number(me.sleepGoal) : 8,
			calories: me?.calorieGoal != null ? Number(me.calorieGoal) : 2000,
		}),
		[me],
	);

	const w = useMemo(
		() => weeklySummary({ entries, habits, meals, activities, fasts, goals }),
		[entries, habits, meals, activities, fasts, goals],
	);

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl text-balance">Resumen semanal</h1>
				<PremiumGate
					title="Resumen semanal"
					description="Un vistazo a tu semana: peso, hábitos, nutrición, actividad y cumplimiento con Premium."
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Resumen semanal</h1>

			<div className="grid grid-cols-2 gap-3">
				<StatCard
					label="Cambio de peso"
					value={
						w.weightChange != null ? formatDelta(w.weightChange, unit) : "—"
					}
					icon={
						w.weightChange != null && w.weightChange < 0
							? GraphDownIcon
							: GraphUpIcon
					}
					accent={
						w.weightChange == null
							? ""
							: w.weightChange < 0
								? "text-positive"
								: w.weightChange > 0
									? "text-negative"
									: ""
					}
				/>
				<StatCard
					label="Peso promedio"
					value={
						w.avgWeight != null
							? `${formatWeightValue(w.avgWeight, unit)} ${unit}`
							: "—"
					}
					icon={ScaleIcon}
				/>
				<StatCard
					label="Agua (prom)"
					value={`${Math.round(w.waterAvg)} ml`}
					icon={WaterdropIcon}
				/>
				<StatCard
					label="Pasos (prom)"
					value={`${Math.round(w.stepsAvg)}`}
					icon={WalkingIcon}
				/>
				<StatCard
					label="Sueño (prom)"
					value={`${w.sleepAvg.toFixed(1)} h`}
					icon={MoonIcon}
				/>
				<StatCard
					label="Calorías (prom)"
					value={`${Math.round(w.mealTotals7.calories / 7)}`}
					sub="kcal/día"
					icon={FireIcon}
				/>
				<StatCard
					label="Actividad"
					value={`${w.actStats.totalMinutes} min`}
					sub={`${w.actStats.sessions} sesiones`}
					icon={DumbbellIcon}
				/>
				<StatCard label="Ayunos" value={w.fastsCount} icon={StopwatchIcon} />
			</div>

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="font-display text-sm mb-1">
					Macros (promedio diario)
				</div>
				<p className="text-xs text-muted-foreground text-pretty">
					Proteínas {Math.round(w.mealTotals7.protein / 7)}g · Carbs{" "}
					{Math.round(w.mealTotals7.carbs / 7)}g · Grasas{" "}
					{Math.round(w.mealTotals7.fat / 7)}g
				</p>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="font-display text-sm">Cumplimiento de objetivos</div>
				{[
					{ label: "Agua", v: w.compliance.water },
					{ label: "Pasos", v: w.compliance.steps },
					{ label: "Sueño", v: w.compliance.sleep },
					{ label: "Calorías", v: w.compliance.calories },
				].map((c) => (
					<div key={c.label}>
						<div className="flex justify-between text-xs mb-1">
							<span>{c.label}</span>
							<span className="text-muted-foreground">
								{Math.round(c.v * 100)}%
							</span>
						</div>
						<ProgressBar value={c.v * 100} goal={100} />
					</div>
				))}
			</div>
		</div>
	);
}
