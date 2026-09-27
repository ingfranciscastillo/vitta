import { WaterdropIcon } from "@solar-icons/react/linear";
import { AddIcon } from "@solar-icons/react/linear/add";
import { MinusIcon } from "@solar-icons/react/linear/minus";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ProgressBar } from "#/components/progress-bar";
import { ValuePulse } from "#/components/value-pulse";
import { habitLogsQuery } from "#/lib/habits";
import { addHabitLog } from "#/lib/habits.functions";
import { habitToday } from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import { todayStr } from "#/lib/weight-utils";

const GLASS_ML = 250;

export function WaterCounter() {
	const habits = useSuspenseQuery(habitLogsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const qc = useQueryClient();

	const today = todayStr();
	const value = habitToday(habits, "water");
	const goal = me?.waterGoal != null ? Number(me.waterGoal) : 2000;
	const glasses = Math.round(value / GLASS_ML);
	const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0;

	const addMut = useMutation({
		mutationFn: () =>
			addHabitLog({
				data: {
					type: "water",
					date: today,
					step: GLASS_ML,
				},
			}),
		onSuccess: async () => {
			toast.success(
				`+1 vaso · ${Math.round(value + GLASS_ML)} ml de ${goal} ml`,
				{
					id: "water",
				},
			);
			await qc.invalidateQueries({ queryKey: ["habit-logs"] });
		},
		onError: () => {
			toast.error("No se pudo registrar el vaso");
		},
	});

	const subtractMut = useMutation({
		mutationFn: () =>
			addHabitLog({
				data: {
					type: "water",
					date: today,
					step: -Math.min(GLASS_ML, value),
				},
			}),
		onSuccess: async () => {
			toast.success(
				`-1 vaso · ${Math.round(Math.max(0, value - GLASS_ML))} ml de ${goal} ml`,
				{
					id: "water",
				},
			);
			await qc.invalidateQueries({ queryKey: ["habit-logs"] });
		},
		onError: () => {
			toast.error("No se pudo quitar el vaso");
		},
	});

	const add = () => {
		addMut.mutate();
	};

	const subtract = () => {
		if (value <= 0) return;
		subtractMut.mutate();
	};

	return (
		<div className="rounded-2xl bg-card border border-border p-4">
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<WaterdropIcon className="w-4 h-4 text-primary" />
						<span className="font-display text-sm">Agua hoy</span>
					</div>
					<div className="flex items-baseline gap-2">
						<ValuePulse
							value={glasses}
							className="font-display text-3xl leading-none tabular-nums"
						>
							{glasses}
						</ValuePulse>
						<span className="text-sm text-muted-foreground">
							vasos · {Math.round(value)} / {goal} ml
						</span>
					</div>
				</div>
				<button
					type="button"
					onClick={subtract}
					disabled={value <= 0 || subtractMut.isPending}
					className="group size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center active:scale-[0.92] motion-reduce:active:scale-100 transition-transform duration-100 ease-out disabled:opacity-40 shrink-0 ring-2 ring-primary/5 pointer-fine-hover:ring-primary/15"
					aria-label="Quitar un vaso de agua"
				>
					<MinusIcon size={20} className="size-5 transition-transform" />
				</button>
				<button
					type="button"
					onClick={add}
					disabled={addMut.isPending}
					className="group relative size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-[0.92] motion-reduce:active:scale-100 transition-transform duration-100 ease-out shrink-0 ring-2 ring-primary/15 pointer-fine-hover:ring-primary/25"
					aria-label="Añadir un vaso de agua"
				>
					<AddIcon size={20} className="size-5 transition-transform" />
				</button>
			</div>
			<div className="mt-3">
				<ProgressBar value={value} goal={goal} />
				<div className="flex justify-between text-[10px] text-muted-foreground mt-1">
					<span>0</span>
					<span>{Math.round(pct)}%</span>
					<span>{goal} ml</span>
				</div>
			</div>
		</div>
	);
}

export default WaterCounter;
