import { FireIcon, TrashBinTrashIcon } from "@solar-icons/react/outline";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { EmptyState } from "#/components/empty-state";
import { PremiumGate } from "#/components/premium-gate";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import {
	lastNDateStrings,
	mealTotals,
	mealTotalsRange,
	metricExplanations,
} from "#/lib/health-utils";
import { mealsQuery } from "#/lib/meals";
import { createMeal, deleteMeal } from "#/lib/meals.functions";
import { currentUserQuery } from "#/lib/profile";
import { updateProfile } from "#/lib/profile.functions";
import { nowTimeStr, sortByDateDesc, todayStr } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/nutrition")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(mealsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: NutritionPage,
});

type MealTypeId = "breakfast" | "lunch" | "dinner" | "snack";

const MEAL_TYPES: Array<{ id: MealTypeId; label: string }> = [
	{ id: "breakfast", label: "Desayuno" },
	{ id: "lunch", label: "Almuerzo" },
	{ id: "dinner", label: "Cena" },
	{ id: "snack", label: "Snack" },
];

function MacroBar({
	label,
	value,
	goal,
	color,
}: {
	label: string;
	value: number;
	goal: number;
	color: string;
}) {
	const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
	return (
		<div>
			<div className="flex justify-between text-xs mb-1">
				<span className="text-muted-foreground">{label}</span>
				<span>
					{Math.round(value)} / {goal}g
				</span>
			</div>
			<div className="h-1.5 rounded-full bg-muted overflow-hidden">
				<div
					className="h-full rounded-full"
					style={{ width: `${pct}%`, background: color }}
				/>
			</div>
		</div>
	);
}

function NutritionPage() {
	const meals = useSuspenseQuery(mealsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const qc = useQueryClient();

	const today = todayStr();
	const totals = useMemo(() => mealTotals(meals, today), [meals, today]);
	const todayMeals = useMemo(
		() => sortByDateDesc(meals.filter((m) => m.date === today)),
		[meals, today],
	);
	const weekDates = useMemo(() => lastNDateStrings(7), []);
	const weekTotals = useMemo(
		() => mealTotalsRange(meals, weekDates),
		[meals, weekDates],
	);

	const calorieGoal = me?.calorieGoal != null ? Number(me.calorieGoal) : 2000;
	const proteinGoal = me?.proteinGoal != null ? Number(me.proteinGoal) : 100;
	const carbsGoal = me?.carbsGoal != null ? Number(me.carbsGoal) : 250;
	const fatGoal = me?.fatGoal != null ? Number(me.fatGoal) : 70;

	const [goalCal, setGoalCal] = useState<string>(String(calorieGoal));
	const [showGoal, setShowGoal] = useState<boolean>(false);

	const [name, setName] = useState<string>("");
	const [cal, setCal] = useState<string>("");
	const [protein, setProtein] = useState<string>("");
	const [carbs, setCarbs] = useState<string>("");
	const [fat, setFat] = useState<string>("");
	const [mealType, setMealType] = useState<MealTypeId>("breakfast");
	const [time] = useState<string>(nowTimeStr());
	const [deletingMeal, setDeletingMeal] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const nameInputRef = useRef<HTMLInputElement | null>(null);

	const invalidate = async () => {
		await qc.invalidateQueries({ queryKey: ["meals"] });
	};

	const createMut = useMutation({
		mutationFn: (vars: {
			date: string;
			time: string;
			name: string;
			calories: number;
			protein: number;
			carbs: number;
			fat: number;
			mealType: MealTypeId;
		}) =>
			createMeal({
				data: {
					date: vars.date,
					time: vars.time,
					name: vars.name,
					calories: vars.calories,
					protein: vars.protein,
					carbs: vars.carbs,
					fat: vars.fat,
					mealType: vars.mealType,
				},
			}),
		onSuccess: async () => {
			toast.success("Comida añadida");
			setName("");
			setCal("");
			setProtein("");
			setCarbs("");
			setFat("");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo añadir la comida");
		},
	});

	const deleteMut = useMutation({
		mutationFn: (id: string) => deleteMeal({ data: { id } }),
		onSuccess: async () => {
			toast.success("Comida eliminada");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo eliminar la comida");
		},
	});

	const updateGoalMut = useMutation({
		mutationFn: (calorieGoal: number) =>
			updateProfile({ data: { calorieGoal } }),
		onSuccess: async () => {
			toast.success("Objetivo calórico guardado");
			await qc.invalidateQueries({ queryKey: ["current-user"] });
		},
		onError: () => {
			toast.error("No se pudo guardar el objetivo");
		},
	});

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl text-balance">Nutrición</h1>
				<PremiumGate
					title="Nutrición"
					description="Registra comidas, calorías y macros, y sigue tu objetivo calórico diario con Premium."
				/>
			</div>
		);
	}

	const addMeal = () => {
		const c = parseFloat(cal);
		if (!name.trim() || Number.isNaN(c) || c <= 0) return;
		createMut.mutate({
			date: today,
			time,
			name: name.trim(),
			calories: c,
			protein: parseFloat(protein) || 0,
			carbs: parseFloat(carbs) || 0,
			fat: parseFloat(fat) || 0,
			mealType,
		});
	};

	const saveGoal = () => {
		const v = parseInt(goalCal, 10);
		if (Number.isNaN(v) || v <= 0) return;
		updateGoalMut.mutate(v);
		setShowGoal(false);
	};

	const remaining = calorieGoal - totals.calories;

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Nutrición</h1>

			<div className="rounded-3xl bg-primary text-primary-foreground p-5">
				<div className="text-[11px] uppercase opacity-70">Calorías hoy</div>
				<div className="flex items-baseline gap-2 mt-1">
					<span className="font-display text-4xl leading-none tabular-nums">
						{Math.round(totals.calories)}
					</span>
					<span className="font-display text-lg opacity-70">
						/ {calorieGoal} kcal
					</span>
				</div>
				<div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
					<div
						className="h-full rounded-full bg-white"
						style={{
							width: `${Math.min(100, (totals.calories / calorieGoal) * 100)}%`,
						}}
					/>
				</div>
				<div className="text-xs opacity-80 mt-2">
					{remaining >= 0
						? `${remaining} kcal restantes`
						: `${Math.abs(remaining)} kcal de más`}
				</div>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<MacroBar
					label="Proteínas"
					value={totals.protein}
					goal={proteinGoal}
					color="hsl(var(--primary))"
				/>
				<MacroBar
					label="Carbohidratos"
					value={totals.carbs}
					goal={carbsGoal}
					color="hsl(var(--accent))"
				/>
				<MacroBar
					label="Grasas"
					value={totals.fat}
					goal={fatGoal}
					color="hsl(var(--chart-3))"
				/>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="flex items-center justify-between">
					<span className="font-display text-sm">Objetivo calórico</span>
					<button
						type="button"
						onClick={() => setShowGoal((s) => !s)}
						className="text-xs text-primary"
					>
						{showGoal ? "Cancelar" : "Modificar"}
					</button>
				</div>
				{showGoal ? (
					<div className="flex gap-2">
						<Input
							type="number"
							value={goalCal}
							onChange={(e) => setGoalCal(e.target.value)}
							className="h-11"
						/>
						<Button onClick={saveGoal} className="h-11 font-display">
							Guardar
						</Button>
					</div>
				) : (
					<p className="text-xs text-muted-foreground">
						{metricExplanations.calorieGoal}
					</p>
				)}
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="font-display text-sm">Añadir comida</div>
				<Input
					ref={nameInputRef}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Nombre del alimento"
					className="h-11"
				/>
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase text-muted-foreground">
							Calorías
						</Label>
						<Input
							type="number"
							inputMode="decimal"
							value={cal}
							onChange={(e) => setCal(e.target.value)}
							className="h-11"
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase text-muted-foreground">
							Tipo
						</Label>
						<Select
							value={mealType}
							onValueChange={(v) => setMealType(v as MealTypeId)}
						>
							<SelectTrigger className="h-11! w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{MEAL_TYPES.map((m) => (
									<SelectItem key={m.id} value={m.id} className="h-11">
										{m.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-3">
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase text-muted-foreground">
							Prot (g)
						</Label>
						<Input
							type="number"
							inputMode="decimal"
							value={protein}
							onChange={(e) => setProtein(e.target.value)}
							className="h-11"
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase text-muted-foreground">
							Carb (g)
						</Label>
						<Input
							type="number"
							inputMode="decimal"
							value={carbs}
							onChange={(e) => setCarbs(e.target.value)}
							className="h-11"
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase text-muted-foreground">
							Gras (g)
						</Label>
						<Input
							type="number"
							inputMode="decimal"
							value={fat}
							onChange={(e) => setFat(e.target.value)}
							className="h-11"
						/>
					</div>
				</div>
				<Button
					onClick={addMeal}
					className="w-full h-11 font-display"
					disabled={createMut.isPending}
					aria-busy={createMut.isPending}
				>
					{createMut.isPending && <Bars className="w-3 h-3 mr-1.5" />}
					Añadir
				</Button>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="font-display text-sm mb-2">Comidas de hoy</div>
				{todayMeals.length === 0 ? (
					<EmptyState
						title="Aún no has registrado comidas hoy"
						description="Añade tu primera comida para empezar a llevar el conteo."
						action={{
							label: "Añadir comida",
							onClick: () => nameInputRef.current?.focus(),
						}}
					/>
				) : (
					<div className="space-y-2">
						{todayMeals.map((m) => (
							<div
								key={m.id ?? `${m.date}-${m.name}-${m.time}`}
								className="flex items-center justify-between text-sm"
							>
								<div>
									<div className="font-medium">{m.name}</div>
									<div className="text-xs text-muted-foreground">
										{Math.round(m.calories)} kcal · P
										{Math.round(m.protein ?? 0)} C{Math.round(m.carbs ?? 0)} G
										{Math.round(m.fat ?? 0)}
									</div>
								</div>
								<button
									type="button"
									onClick={() =>
										m.id && setDeletingMeal({ id: m.id, name: m.name })
									}
									className="text-muted-foreground hover:text-destructive"
									aria-label="Eliminar"
								>
									<TrashBinTrashIcon className="w-4 h-4" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
			<ConfirmDeleteDialog
				open={deletingMeal !== null}
				onOpenChange={(o) => !o && setDeletingMeal(null)}
				onConfirm={() => {
					if (deletingMeal) deleteMut.mutate(deletingMeal.id);
					setDeletingMeal(null);
				}}
				title="Eliminar comida"
				description={`Se eliminará "${deletingMeal?.name ?? ""}". Esta acción no se puede deshacer.`}
				isPending={deleteMut.isPending}
			/>

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="flex items-center gap-2 mb-2">
					<FireIcon className="w-4 h-4 text-primary" />
					<span className="font-display text-sm">Promedio semanal</span>
				</div>
				<div className="text-sm">
					<span className="font-display text-2xl tabular-nums">
						{Math.round(weekTotals.calories / 7)}
					</span>{" "}
					<span className="text-muted-foreground">kcal/día</span>
				</div>
				<div className="text-xs text-muted-foreground mt-1">
					Proteínas {Math.round(weekTotals.protein / 7)}g · Carbs{" "}
					{Math.round(weekTotals.carbs / 7)}g · Grasas{" "}
					{Math.round(weekTotals.fat / 7)}g (promedio diario)
				</div>
			</div>
		</div>
	);
}
