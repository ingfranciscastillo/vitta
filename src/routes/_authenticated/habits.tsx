import {
	LockIcon,
	MoonIcon,
	PulseIcon,
	StopwatchIcon,
	WalkingIcon,
	WaterdropIcon,
} from "@solar-icons/react/linear";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HabitCard } from "#/components/habit-card";
import { PaywallDialog } from "#/components/paywall-dialog";
import { StatCard } from "#/components/stat-card";
import { TrendChart } from "#/components/trend-chart";
import { habitLogsQuery } from "#/lib/habits";
import { addHabitLog, setHabitLog } from "#/lib/habits.functions";
import {
	HABIT_META,
	habitAverage,
	habitHistory,
	habitToday,
} from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import { todayStr } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/habits")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(habitLogsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: HabitsPage,
});

function HabitsPage() {
	const habits = useSuspenseQuery(habitLogsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const qc = useQueryClient();

	const [sel, setSel] = useState<"water" | "steps" | "sleep">("water");
	const [paywall, setPaywall] = useState<boolean>(false);

	const today = todayStr();
	const water = habitToday(habits, "water");
	const steps = habitToday(habits, "steps");
	const sleep = habitToday(habits, "sleep");
	const series = useMemo(() => habitHistory(habits, sel, 7), [habits, sel]);

	const waterGoal = me?.waterGoal != null ? Number(me.waterGoal) : 2000;
	const stepsGoal = me?.stepsGoal != null ? Number(me.stepsGoal) : 8000;
	const sleepGoal = me?.sleepGoal != null ? Number(me.sleepGoal) : 8;

	const invalidate = async () => {
		await qc.invalidateQueries({ queryKey: ["habit-logs"] });
	};

	const addMut = useMutation({
		mutationFn: (vars: { type: "water" | "steps" | "sleep"; step: number }) =>
			addHabitLog({ data: { ...vars, date: today } }),
		onSuccess: async () => {
			toast.success("Hábito registrado");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo registrar el hábito");
		},
	});

	const setMut = useMutation({
		mutationFn: (vars: { type: "water" | "steps" | "sleep"; value: number }) =>
			setHabitLog({ data: { ...vars, date: today } }),
		onSuccess: async () => {
			toast.success("Hábito actualizado");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo actualizar el hábito");
		},
	});

	const NavCard = ({
		to,
		icon: Icon,
		title,
		desc,
	}: {
		to: string;
		icon: typeof PulseIcon;
		title: string;
		desc: string;
	}) => {
		if (isPremium) {
			return (
				<Link
					to={to}
					className="block rounded-2xl bg-card border border-border p-4 hover:bg-muted transition-colors"
				>
					<div className="flex items-center gap-2 mb-1">
						<Icon className="w-4 h-4 text-primary" />
						<span className="font-display text-sm">{title}</span>
					</div>
					<p className="text-xs text-muted-foreground text-pretty">{desc}</p>
				</Link>
			);
		}
		return (
			<button
				type="button"
				onClick={() => setPaywall(true)}
				className="w-full text-left rounded-2xl bg-card border border-dashed border-border p-4"
			>
				<div className="flex items-center gap-2 mb-1">
					<LockIcon className="w-4 h-4 text-muted-foreground" />
					<span className="font-display text-sm">{title}</span>
				</div>
				<p className="text-xs text-muted-foreground text-pretty">{desc}</p>
			</button>
		);
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Hábitos</h1>

			<div className="space-y-3">
				<HabitCard
					label="Agua"
					icon={WaterdropIcon}
					value={water}
					goal={waterGoal}
					unit="ml"
					step={250}
					onAdd={(s) => addMut.mutate({ type: "water", step: s })}
					onSet={(v) => setMut.mutate({ type: "water", value: v })}
				/>
				<HabitCard
					label="Pasos"
					icon={WalkingIcon}
					value={steps}
					goal={stepsGoal}
					unit=""
					step={500}
					onAdd={(s) => addMut.mutate({ type: "steps", step: s })}
					onSet={(v) => setMut.mutate({ type: "steps", value: v })}
				/>
				<HabitCard
					label="Sueño"
					icon={MoonIcon}
					value={sleep}
					goal={sleepGoal}
					unit="h"
					step={0.5}
					onAdd={(s) => addMut.mutate({ type: "sleep", step: s })}
					onSet={(v) => setMut.mutate({ type: "sleep", value: v })}
				/>
			</div>

			<div>
				<div className="font-display text-sm mb-2">Esta semana</div>
				<div className="grid grid-cols-3 gap-3">
					<StatCard
						label="Agua"
						value={`${Math.round(habitAverage(habits, "water", 7))}`}
						sub="ml/día"
					/>
					<StatCard
						label="Pasos"
						value={`${Math.round(habitAverage(habits, "steps", 7))}`}
						sub="pasos/día"
					/>
					<StatCard
						label="Sueño"
						value={habitAverage(habits, "sleep", 7).toFixed(1)}
						sub="h/día"
					/>
				</div>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="flex gap-1.5 mb-3">
					{(["water", "steps", "sleep"] as const).map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => setSel(t)}
							className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
								sel === t
									? "bg-primary text-primary-foreground"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{HABIT_META[t].label}
						</button>
					))}
				</div>
				<TrendChart
					data={series}
					unit={HABIT_META[sel].unit}
					name={HABIT_META[sel].label}
					height={200}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<NavCard
					to="/activity"
					icon={PulseIcon}
					title="Actividad"
					desc="Entrenamientos y actividad física"
				/>
				<NavCard
					to="/fasting"
					icon={StopwatchIcon}
					title="Ayuno"
					desc="Timer e historial de ayunos"
				/>
			</div>

			<PaywallDialog open={paywall} onOpenChange={setPaywall} />
		</div>
	);
}
