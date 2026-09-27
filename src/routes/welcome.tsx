import { AltArrowLeftIcon } from "@solar-icons/react/linear";
import { CheckIcon } from "@solar-icons/react/linear/check";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { NumberStepper } from "#/components/number-stepper";
import { Button } from "#/components/ui/button";
import { Progress } from "#/components/ui/progress";
import { track } from "#/lib/analytics";
import { getSession } from "#/lib/auth.functions";
import { currentGoalQuery } from "#/lib/goals";
import { upsertGoal } from "#/lib/goals.functions";
import {
	type OnboardingStep,
	onboardingSteps,
	profileGaps,
} from "#/lib/onboarding";
import { currentUserQuery } from "#/lib/profile";
import { updateProfile } from "#/lib/profile.functions";
import { parseSignupPrefill, type SignupPrefill } from "#/lib/signup-prefill";
import {
	HEIGHT_RANGE_CM,
	lengthFromDisplay,
	lengthToDisplay,
	lengthUnitLabel,
	lengthUnitOf,
	type Pace,
	paceLabel,
	UNIT_SYSTEMS,
	type UnitSystem,
	unitSystemOf,
} from "#/lib/units";
import { cn } from "#/lib/utils";
import { weightEntriesQuery } from "#/lib/weight";
import { createWeightEntry } from "#/lib/weight.functions";
import {
	calcIMC,
	computeStats,
	estimateGoalDate,
	formatDate,
	formatWeight,
	fromDisplay,
	GOAL_WEIGHT_MAX_KG,
	GOAL_WEIGHT_MIN_KG,
	imcCategory,
	nowTimeStr,
	toDisplay,
	todayStr,
	type WeightUnit,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/welcome")({
	// Datos que llegan desde las calculadoras públicas, ya validados.
	validateSearch: (search: Record<string, unknown>): SignupPrefill =>
		parseSignupPrefill(search),
	beforeLoad: async ({ location }) => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/login", search: { redirect: location.href } });
		}
	},
	loader: ({ context }) =>
		Promise.all([
			context.queryClient.ensureQueryData(currentUserQuery()),
			context.queryClient.ensureQueryData(weightEntriesQuery()),
			context.queryClient.ensureQueryData(currentGoalQuery()),
		]),
	head: () => ({ meta: [{ title: "Configura tu cuenta · Vitta" }] }),
	component: WelcomePage,
});

const QUESTION_COUNT: Record<number, string> = {
	1: "Una pregunta rápida",
	2: "Dos preguntas rápidas",
	3: "Tres preguntas rápidas",
	4: "Cuatro preguntas rápidas",
};

function WelcomePage() {
	const navigate = useNavigate();
	const prefill = Route.useSearch();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const { goal } = useSuspenseQuery(currentGoalQuery()).data!;

	// Los pasos se fijan al entrar para que no desaparezcan al ir guardando.
	const [steps] = useState<OnboardingStep[]>(() =>
		onboardingSteps(
			profileGaps({
				height: me.height,
				entryCount: entries.length,
				hasGoal: !!goal,
			}),
		),
	);
	const [index, setIndex] = useState(0);
	const step = steps[index];
	const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));
	const back = () => setIndex((i) => Math.max(i - 1, 0));
	// Avanzar tras completar un paso (no al saltarlo) cuenta para el embudo.
	const complete = () => {
		track("onboarding_step_completed", { step });
		next();
	};
	const finish = () => {
		track("onboarding_finished", { skipped: step !== "done" });
		navigate({ to: "/dashboard" });
	};

	// "Listo" no cuenta como paso para la barra de progreso.
	const total = steps.length - 1;
	const pct = step === "done" ? 100 : (index / total) * 100;

	return (
		<div className="min-h-dvh bg-background">
			<div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8 pt-4">
				<header className="flex h-11 items-center justify-between gap-3">
					<button
						type="button"
						onClick={back}
						aria-label="Paso anterior"
						className={cn(
							"-ml-2 flex size-11 items-center justify-center rounded-full text-muted-foreground pointer-fine-hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							(index === 0 || step === "done") && "invisible",
						)}
					>
						<AltArrowLeftIcon className="size-5" />
					</button>
					<span className="flex items-center gap-2 font-brand text-sm">
						<span className="size-2 rounded-full bg-primary" />
						Vitta
					</span>
					{step === "done" ? (
						<span className="w-16" />
					) : (
						<button
							type="button"
							onClick={finish}
							className="h-11 w-16 text-right text-sm text-muted-foreground pointer-fine-hover:text-foreground focus-visible:outline-none focus-visible:underline"
						>
							Omitir
						</button>
					)}
				</header>

				<Progress
					value={pct}
					className="mt-2 h-1.5"
					aria-label={`Paso ${Math.min(index + 1, total)} de ${total}`}
				/>

				<main key={step} className="page-enter flex flex-1 flex-col pt-8">
					{step === "units" && <UnitsStep questions={total} onDone={complete} />}
					{step === "weight" && (
						<WeightStep prefill={prefill} onDone={complete} onSkip={next} />
					)}
					{step === "height" && (
						<HeightStep prefill={prefill} onDone={complete} onSkip={next} />
					)}
					{step === "goal" && (
						<GoalStep prefill={prefill} onDone={complete} onSkip={next} />
					)}
					{step === "done" && <DoneStep onFinish={finish} />}
				</main>
			</div>
		</div>
	);
}

function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
	return (
		<div className="mb-8 space-y-2">
			<h1 className="font-display text-2xl text-balance">{title}</h1>
			<p className="text-sm text-muted-foreground text-pretty">{subtitle}</p>
		</div>
	);
}

function StepActions({
	onContinue,
	onSkip,
	pending,
	label = "Continuar",
}: {
	onContinue: () => void;
	onSkip?: () => void;
	pending?: boolean;
	label?: string;
}) {
	return (
		<div className="mt-auto space-y-2 pt-8">
			<Button size="cta"
				type="button"
				onClick={onContinue}
				disabled={pending}
				aria-busy={pending}
				className="w-full"
			>
				{pending && <Bars className="mr-1.5 h-3 w-3" />}
				{label}
			</Button>
			{onSkip && (
				<Button size="cta"
					type="button"
					variant="ghost"
					onClick={onSkip}
					disabled={pending}
					className="w-full text-muted-foreground"
				>
					Ahora no
				</Button>
			)}
		</div>
	);
}

function UnitsStep({
	questions,
	onDone,
}: {
	questions: number;
	onDone: () => void;
}) {
	const qc = useQueryClient();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const current = unitSystemOf(me.weightUnit);

	const mut = useMutation({
		mutationFn: (system: UnitSystem) =>
			updateProfile({
				data: {
					weightUnit: UNIT_SYSTEMS[system].weightUnit,
					heightUnit: UNIT_SYSTEMS[system].heightUnit,
					// La zona horaria por defecto viene del servidor; aquí se
					// corrige con la del dispositivo sin preguntar.
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				},
			}),
		onSuccess: async () => {
			await Promise.all([
				qc.invalidateQueries({ queryKey: ["current-user"] }),
				qc.invalidateQueries({ queryKey: ["current-goal"] }),
				qc.invalidateQueries({ queryKey: ["weight-stats"] }),
			]);
			onDone();
		},
		onError: () => toast.error("No se pudieron guardar las unidades"),
	});

	return (
		<>
			<StepHeading
				title={`Hola, ${me.name.split(" ")[0]}`}
				subtitle={`${QUESTION_COUNT[questions] ?? `${questions} preguntas rápidas`} y Vitta queda lista para ti. ¿Qué unidades usas?`}
			/>
			<div className="grid gap-3">
				{(Object.keys(UNIT_SYSTEMS) as UnitSystem[]).map((system) => {
					const u = UNIT_SYSTEMS[system];
					const pending = mut.isPending && mut.variables === system;
					return (
						<button
							key={system}
							type="button"
							disabled={mut.isPending}
							onClick={() => mut.mutate(system)}
							className={cn(
								"flex min-h-20 items-center justify-between rounded-2xl border bg-card p-5 text-left transition-[transform,background-color,border-color] duration-100 ease-out active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70",
								system === current
									? "border-primary"
									: "border-border pointer-fine-hover:bg-muted/50",
							)}
						>
							<span>
								<span className="block font-display">{u.label}</span>
								<span className="block text-sm text-muted-foreground">
									{u.hint}
								</span>
							</span>
							{pending && <Bars className="h-3 w-3" />}
						</button>
					);
				})}
			</div>
			<p className="mt-4 text-xs text-muted-foreground text-pretty">
				Puedes cambiarlo cuando quieras en tu perfil.
			</p>
		</>
	);
}

function WeightStep({
	prefill,
	onDone,
	onSkip,
}: {
	prefill: SignupPrefill;
	onDone: () => void;
	onSkip: () => void;
}) {
	const qc = useQueryClient();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const unit: WeightUnit = me.weightUnit;
	const [value, setValue] = useState(
		prefill.peso != null ? toDisplay(prefill.peso, unit).toFixed(1) : "",
	);

	const mut = useMutation({
		mutationFn: (kg: number) =>
			createWeightEntry({
				data: { weight: kg, date: todayStr(), time: nowTimeStr() },
			}),
		onSuccess: async () => {
			await Promise.all([
				qc.invalidateQueries({ queryKey: ["weight-entries"] }),
				qc.invalidateQueries({ queryKey: ["weight-stats"] }),
				qc.invalidateQueries({ queryKey: ["current-goal"] }),
			]);
			onDone();
		},
		onError: () => toast.error("No se pudo registrar el peso"),
	});

	const save = () => {
		const kg = fromDisplay(parseFloat(value), unit);
		if (
			Number.isNaN(kg) ||
			kg < GOAL_WEIGHT_MIN_KG ||
			kg > GOAL_WEIGHT_MAX_KG
		) {
			toast.error("Introduce un peso válido");
			return;
		}
		mut.mutate(kg);
	};

	return (
		<>
			<StepHeading
				title="¿Cuánto pesas hoy?"
				subtitle="Será tu punto de partida. No hace falta que sea exacto."
			/>
			<NumberStepper
				label="Peso actual"
				autoFocus
				base={Math.round(toDisplay(70, unit))}
				value={value}
				onChange={setValue}
				step={0.1}
				unit={unit}
			/>
			<StepActions onContinue={save} onSkip={onSkip} pending={mut.isPending} />
		</>
	);
}

function HeightStep({
	prefill,
	onDone,
	onSkip,
}: {
	prefill: SignupPrefill;
	onDone: () => void;
	onSkip: () => void;
}) {
	const qc = useQueryClient();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const heightUnit = lengthUnitOf(me.weightUnit);
	const unitLabel = lengthUnitLabel(heightUnit);
	const [value, setValue] = useState(
		prefill.altura != null
			? String(Math.round(lengthToDisplay(prefill.altura, heightUnit)))
			: "",
	);

	const current = computeStats(entries).current;
	const cm = lengthFromDisplay(parseFloat(value) || 0, heightUnit);
	const validHeight = cm >= HEIGHT_RANGE_CM.min && cm <= HEIGHT_RANGE_CM.max;
	const imc = current != null && validHeight ? calcIMC(current, cm) : null;
	const imcCat = imcCategory(imc);

	const mut = useMutation({
		mutationFn: (heightCm: number) =>
			updateProfile({ data: { height: heightCm } }),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["current-user"] });
			onDone();
		},
		onError: () => toast.error("No se pudo guardar la altura"),
	});

	const save = () => {
		if (!validHeight) {
			toast.error("Introduce una altura válida");
			return;
		}
		mut.mutate(cm);
	};

	return (
		<>
			<StepHeading
				title="¿Cuánto mides?"
				subtitle="Con tu altura calculamos tu IMC al instante."
			/>
			<NumberStepper
				label="Altura"
				autoFocus
				base={heightUnit === "ft" ? 67 : 170}
				value={value}
				onChange={setValue}
				step={1}
				decimals={0}
				unit={unitLabel}
			/>
			<div
				aria-live="polite"
				className={cn(
					"mx-auto mt-8 w-full rounded-2xl border border-border bg-card p-4 text-center transition-opacity duration-150",
					imc == null && "opacity-0",
				)}
			>
				<div className="text-[11px] uppercase text-muted-foreground">
					Tu IMC
				</div>
				<div className="font-display text-3xl tabular-nums">
					{imc != null ? imc.toFixed(1) : "—"}
				</div>
				<div className="text-sm text-muted-foreground">
					{imcCat?.label ?? " "}
				</div>
			</div>
			<StepActions onContinue={save} onSkip={onSkip} pending={mut.isPending} />
		</>
	);
}

type Direction = "lose" | "maintain" | "gain";

const DIRECTIONS: ReadonlyArray<{ id: Direction; label: string }> = [
	{ id: "lose", label: "Bajar" },
	{ id: "maintain", label: "Mantener" },
	{ id: "gain", label: "Subir" },
];

const PACES: ReadonlyArray<Pace> = ["slow", "moderate", "fast"];

// Sugerencia inicial de meta: 5 kg en la dirección elegida.
const SUGGESTED_CHANGE_KG = 5;

function GoalStep({
	prefill,
	onDone,
	onSkip,
}: {
	prefill: SignupPrefill;
	onDone: () => void;
	onSkip: () => void;
}) {
	const qc = useQueryClient();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const unit: WeightUnit = me.weightUnit;
	const current = computeStats(entries).current;

	// Si viene de la calculadora de peso meta, la dirección se deduce sola.
	const reference = current ?? prefill.peso ?? null;
	const [direction, setDirection] = useState<Direction | null>(() => {
		if (prefill.meta == null || reference == null) return null;
		const diff = prefill.meta - reference;
		return Math.abs(diff) < 0.1 ? "maintain" : diff < 0 ? "lose" : "gain";
	});
	const [target, setTarget] = useState(
		prefill.meta != null ? toDisplay(prefill.meta, unit).toFixed(1) : "",
	);
	const [pace, setPace] = useState<Pace>(prefill.ritmo ?? "moderate");

	const choose = (d: Direction) => {
		setDirection(d);
		if (current == null) return;
		const delta =
			d === "lose"
				? -SUGGESTED_CHANGE_KG
				: d === "gain"
					? SUGGESTED_CHANGE_KG
					: 0;
		setTarget(toDisplay(current + delta, unit).toFixed(1));
	};

	const targetKg = fromDisplay(parseFloat(target), unit);
	const validTarget =
		!Number.isNaN(targetKg) &&
		targetKg >= GOAL_WEIGHT_MIN_KG &&
		targetKg <= GOAL_WEIGHT_MAX_KG;
	const eta =
		current != null && validTarget && direction !== "maintain"
			? estimateGoalDate(current, targetKg, pace)
			: null;

	const mut = useMutation({
		mutationFn: () =>
			upsertGoal({
				data: { targetWeight: targetKg, targetDate: null, pace },
			}),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["current-goal"] });
			onDone();
		},
		onError: () => toast.error("No se pudo guardar el objetivo"),
	});

	const save = () => {
		if (!direction) {
			toast.error("Elige qué quieres conseguir");
			return;
		}
		if (!validTarget) {
			toast.error("Introduce un peso objetivo válido");
			return;
		}
		mut.mutate();
	};

	return (
		<>
			<StepHeading
				title="¿Cuál es tu objetivo?"
				subtitle="Lo usamos para medir tu progreso y estimar cuándo llegarás."
			/>
			<div className="grid grid-cols-3 gap-2">
				{DIRECTIONS.map((d) => (
					<button
						key={d.id}
						type="button"
						aria-pressed={direction === d.id}
						onClick={() => choose(d.id)}
						className={cn(
							"min-h-12 rounded-xl font-display text-sm transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							direction === d.id
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground pointer-fine-hover:text-foreground",
						)}
					>
						{d.label}
					</button>
				))}
			</div>

			{direction && (
				<div className="page-enter mt-8 space-y-6">
					<div className="space-y-2">
						<div className="text-center text-xs uppercase text-muted-foreground">
							Peso objetivo
						</div>
						<NumberStepper
							label="Peso objetivo"
							autoFocus
							base={Math.round(toDisplay(current ?? 70, unit))}
							value={target}
							onChange={setTarget}
							step={0.5}
							unit={unit}
						/>
					</div>
					{direction !== "maintain" && (
						<div className="space-y-2">
							<div className="text-xs uppercase text-muted-foreground">
								Ritmo
							</div>
							<div className="grid gap-2">
								{PACES.map((p) => (
									<button
										key={p}
										type="button"
										aria-pressed={pace === p}
										onClick={() => setPace(p)}
										className={cn(
											"min-h-11 rounded-xl border px-4 text-left text-sm transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
											pace === p
												? "border-primary bg-primary/10"
												: "border-border pointer-fine-hover:bg-muted/50",
										)}
									>
										{paceLabel(p, unit)}
									</button>
								))}
							</div>
						</div>
					)}
					{eta && (
						<p className="text-center text-sm text-muted-foreground">
							Llegarías alrededor del{" "}
							<span className="font-medium text-foreground">
								{formatDate(eta)}
							</span>
						</p>
					)}
				</div>
			)}

			<StepActions onContinue={save} onSkip={onSkip} pending={mut.isPending} />
		</>
	);
}

function DoneStep({ onFinish }: { onFinish: () => void }) {
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const { goal } = useSuspenseQuery(currentGoalQuery()).data!;
	const unit: WeightUnit = me.weightUnit;
	const current = computeStats(entries).current;
	const heightCm = me.height ? Number(me.height) : null;
	const imc = current != null && heightCm ? calcIMC(current, heightCm) : null;
	const imcCat = imcCategory(imc);
	const target = goal?.target_weight ?? null;
	const eta =
		current != null && target != null
			? estimateGoalDate(current, target, goal?.pace ?? "moderate")
			: null;

	const rows: Array<{ label: string; value: string; sub?: string }> = [];
	if (current != null)
		rows.push({ label: "Peso actual", value: formatWeight(current, unit) });
	if (imc != null)
		rows.push({ label: "IMC", value: imc.toFixed(1), sub: imcCat?.label });
	if (target != null)
		rows.push({
			label: "Meta",
			value: formatWeight(target, unit),
			sub: eta ? `Estimado: ${formatDate(eta)}` : undefined,
		});

	return (
		<>
			<div className="mb-8 space-y-3">
				<CheckIcon className="size-10 text-primary" />
				<h1 className="font-display text-2xl text-balance">Todo listo</h1>
				<p className="text-sm text-muted-foreground text-pretty">
					{rows.length > 0
						? "Este es tu punto de partida. Registra tu peso cada día para ver tu progreso."
						: "Puedes completar tus datos más adelante desde tu inicio o tu perfil."}
				</p>
			</div>
			{rows.length > 0 && (
				<div className="divide-y divide-border rounded-2xl border border-border bg-card">
					{rows.map((r) => (
						<div
							key={r.label}
							className="flex items-center justify-between p-4"
						>
							<span className="text-sm text-muted-foreground">{r.label}</span>
							<span className="text-right">
								<span className="block font-display tabular-nums">
									{r.value}
								</span>
								{r.sub && (
									<span className="block text-xs text-muted-foreground">
										{r.sub}
									</span>
								)}
							</span>
						</div>
					))}
				</div>
			)}
			<StepActions onContinue={onFinish} label="Ir a mi inicio" />
		</>
	);
}
