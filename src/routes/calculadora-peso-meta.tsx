import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import StartFreeButton from "#/components/landing/start-free-button";
import { NumberStepper } from "#/components/number-stepper";
import { Segmented } from "#/components/tools/segmented";
import {
	type Faq,
	ToolLayout,
	toolJsonLd,
} from "#/components/tools/tool-layout";
import { parseSignupPrefill, type SignupPrefill } from "#/lib/signup-prefill";
import { PACE_KG_PER_WEEK, type Pace, paceLabel } from "#/lib/units";
import {
	estimateGoalDate,
	formatDate,
	formatWeight,
	fromDisplay,
	GOAL_WEIGHT_MAX_KG,
	GOAL_WEIGHT_MIN_KG,
	toDisplay,
	type WeightUnit,
} from "#/lib/weight-utils";

const PAGE_URL = "https://vitta.app/calculadora-peso-meta";
const TITLE = "Calculadora de peso meta: ¿cuándo llegarás?";
const DESCRIPTION =
	"Calcula en qué fecha llegarás a tu peso meta según tu ritmo semanal. Gratis, en kg o lb y sin registrarte.";

const FAQS: ReadonlyArray<Faq> = [
	{
		q: "¿Cómo se calcula la fecha?",
		a: "Se divide la diferencia entre tu peso actual y tu peso meta entre el ritmo semanal que elijas. El resultado son las semanas que faltan, que se suman a la fecha de hoy.",
	},
	{
		q: "¿Qué ritmo debería elegir?",
		a: "Un ritmo moderado de 0.5 kg por semana suele ser más fácil de mantener que uno rápido. Si tienes dudas sobre qué ritmo es adecuado para ti, consúltalo con un profesional de la salud.",
	},
	{
		q: "¿La fecha es exacta?",
		a: "No. Es una estimación: el peso sube y baja de un día a otro por el agua, la comida o el sueño. Lo útil es ver la tendencia de varias semanas, no el dato de un día.",
	},
	{
		q: "¿Necesito una cuenta para usarla?",
		a: "No. La calculadora es gratis y no pide registro. Si quieres seguir tu progreso hasta esa fecha, puedes crear una cuenta en Vitta y tus datos se cargan solos.",
	},
];

export const Route = createFileRoute("/calculadora-peso-meta")({
	validateSearch: (search: Record<string, unknown>): SignupPrefill =>
		parseSignupPrefill(search),
	head: () => ({
		meta: [
			{ title: `${TITLE} · Vitta` },
			{ name: "description", content: DESCRIPTION },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: DESCRIPTION },
			{ property: "og:url", content: PAGE_URL },
			{ name: "twitter:title", content: TITLE },
			{ name: "twitter:description", content: DESCRIPTION },
		],
		links: [{ rel: "canonical", href: PAGE_URL }],
		scripts: [
			{
				type: "application/ld+json",
				children: toolJsonLd({
					name: TITLE,
					description: DESCRIPTION,
					url: PAGE_URL,
					faqs: FAQS,
				}),
			},
		],
	}),
	component: GoalDateCalculator,
});

const UNITS: ReadonlyArray<{ id: WeightUnit; label: string }> = [
	{ id: "kg", label: "Kilogramos" },
	{ id: "lb", label: "Libras" },
];

const round1 = (n: number) => Math.round(n * 10) / 10;

const PACES: ReadonlyArray<Pace> = ["slow", "moderate", "fast"];

function GoalDateCalculator() {
	const prefill = Route.useSearch();
	const [unit, setUnit] = useState<WeightUnit>("kg");
	const [current, setCurrent] = useState((prefill.peso ?? 80).toFixed(1));
	const [goal, setGoal] = useState((prefill.meta ?? 72).toFixed(1));
	const [pace, setPace] = useState<Pace>(prefill.ritmo ?? "moderate");

	// Al cambiar de unidad se convierten los valores ya escritos.
	const changeUnit = (next: WeightUnit) => {
		if (next === unit) return;
		const convert = (v: string) => {
			const kg = fromDisplay(parseFloat(v), unit);
			return Number.isNaN(kg) ? v : toDisplay(kg, next).toFixed(1);
		};
		setCurrent(convert(current));
		setGoal(convert(goal));
		setUnit(next);
	};

	const currentKg = fromDisplay(parseFloat(current), unit);
	const goalKg = fromDisplay(parseFloat(goal), unit);
	const valid = [currentKg, goalKg].every(
		(v) =>
			!Number.isNaN(v) && v >= GOAL_WEIGHT_MIN_KG && v <= GOAL_WEIGHT_MAX_KG,
	);
	const diffKg = valid ? goalKg - currentKg : 0;
	const atGoal = valid && Math.abs(diffKg) < 0.1;
	// Mismo redondeo que estimateGoalDate, para que semanas y fecha cuadren.
	const weeks = valid
		? Math.max(1, Math.round(Math.abs(diffKg) / PACE_KG_PER_WEEK[pace]))
		: 0;
	const eta =
		valid && !atGoal ? estimateGoalDate(currentKg, goalKg, pace) : null;

	return (
		<ToolLayout
			title={TITLE}
			intro="Escribe tu peso actual, tu peso meta y el ritmo al que quieres ir. Te decimos en qué fecha llegarías."
			faqs={FAQS}
		>
			<div className="grid gap-4 md:grid-cols-2">
				<section
					aria-label="Tus datos"
					className="space-y-6 rounded-[2rem] border border-border bg-card p-6"
				>
					<Segmented
						label="Unidad de peso"
						options={UNITS}
						value={unit}
						onChange={changeUnit}
					/>
					<div className="space-y-2">
						<div className="text-center text-sm text-muted-foreground">
							Peso actual
						</div>
						<NumberStepper
							size="md"
							label="Peso actual"
							value={current}
							onChange={setCurrent}
							step={0.5}
							unit={unit}
							base={Math.round(toDisplay(80, unit))}
						/>
					</div>
					<div className="space-y-2">
						<div className="text-center text-sm text-muted-foreground">
							Peso meta
						</div>
						<NumberStepper
							size="md"
							label="Peso meta"
							value={goal}
							onChange={setGoal}
							step={0.5}
							unit={unit}
							base={Math.round(toDisplay(72, unit))}
						/>
					</div>
					<div className="space-y-2">
						<div className="text-sm text-muted-foreground">Ritmo</div>
						<div className="grid gap-2">
							{PACES.map((p) => (
								<button
									key={p}
									type="button"
									aria-pressed={pace === p}
									onClick={() => setPace(p)}
									className={
										pace === p
											? "min-h-11 rounded-xl border border-primary bg-primary/10 px-4 text-left text-sm"
											: "min-h-11 rounded-xl border border-border px-4 text-left text-sm pointer-fine-hover:bg-muted/50"
									}
								>
									{paceLabel(p, unit)}
								</button>
							))}
						</div>
					</div>
				</section>

				<section
					aria-live="polite"
					aria-label="Resultado"
					className="flex flex-col rounded-[2rem] bg-primary p-6 text-primary-foreground"
				>
					{!valid ? (
						<p className="text-primary-foreground/80">
							Escribe dos pesos entre{" "}
							{Math.ceil(toDisplay(GOAL_WEIGHT_MIN_KG, unit))} y{" "}
							{Math.floor(toDisplay(GOAL_WEIGHT_MAX_KG, unit))} {unit}.
						</p>
					) : atGoal ? (
						<>
							<div className="text-sm text-primary-foreground/75">
								Resultado
							</div>
							<p className="mt-2 font-display text-3xl text-balance">
								Ya estás en tu peso meta.
							</p>
							<p className="mt-3 text-primary-foreground/80 text-pretty">
								Ahora el reto es mantenerlo. Registrar tu peso cada día te ayuda
								a notar cualquier cambio a tiempo.
							</p>
						</>
					) : (
						<>
							<div className="text-sm text-primary-foreground/75">
								Llegarías alrededor del
							</div>
							<p className="mt-1 font-display text-4xl tracking-tight">
								{eta
									? formatDate(eta, {
											day: "numeric",
											month: "long",
											year: "numeric",
										})
									: ""}
							</p>
							<p className="mt-3 text-primary-foreground/80 text-pretty">
								{diffKg < 0 ? "Bajar" : "Subir"}{" "}
								{formatWeight(Math.abs(diffKg), unit)} en unas {weeks}{" "}
								{weeks === 1 ? "semana" : "semanas"}.
							</p>
							<Projection weeks={weeks} goingDown={diffKg < 0} />
						</>
					)}

					<div className="mt-auto pt-8">
						<p className="mb-4 text-sm text-primary-foreground/80 text-pretty">
							Registra tu peso cada día y mira si vas por delante o por detrás
							de esta fecha.
						</p>
						<StartFreeButton
							variant="inverse"
							prefill={
								valid
									? {
											peso: round1(currentKg),
											meta: round1(goalKg),
											ritmo: pace,
										}
									: undefined
							}
						/>
					</div>
				</section>
			</div>

			<p className="mt-6 text-sm text-muted-foreground">
				¿No sabes qué peso meta ponerte?{" "}
				<Link
					to="/calculadora-imc"
					search={valid ? { peso: round1(currentKg) } : {}}
					className="text-primary underline-offset-4 pointer-fine-hover:underline"
				>
					Calcula tu IMC y tu rango de peso saludable
				</Link>
				.
			</p>
		</ToolLayout>
	);
}

// Línea recta de hoy a la meta: una proyección, no una predicción.
function Projection({
	weeks,
	goingDown,
}: {
	weeks: number;
	goingDown: boolean;
}) {
	const y1 = goingDown ? 12 : 88;
	const y2 = goingDown ? 88 : 12;
	return (
		<div className="mt-6" aria-hidden="true">
			<svg
				key={`${weeks}-${goingDown}`}
				viewBox="0 0 300 100"
				preserveAspectRatio="none"
				className="h-24 w-full overflow-visible"
				role="presentation"
			>
				<line
					x1="0"
					x2="300"
					y1={y2}
					y2={y2}
					className="stroke-primary-foreground/40"
					strokeWidth="1.5"
					strokeDasharray="4 5"
				/>
				<path
					d={`M0,${y1} L300,${y2}`}
					pathLength={1}
					data-visible
					className="draw-line fill-none stroke-primary-foreground"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
			</svg>
			<div className="mt-2 flex justify-between text-xs text-primary-foreground/75">
				<span>Hoy</span>
				<span>Semana {weeks}</span>
			</div>
		</div>
	);
}
