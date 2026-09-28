import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { IMC_TONE_TEXT, ImcScale } from "#/components/imc-scale";
import StartFreeButton from "#/components/landing/start-free-button";
import { NumberStepper } from "#/components/number-stepper";
import { Segmented } from "#/components/tools/segmented";
import {
	type Faq,
	ToolLayout,
	toolJsonLd,
} from "#/components/tools/tool-layout";
import { useTrackOnFirstChange } from "#/lib/analytics";
import { healthyWeightRange } from "#/lib/health-utils";
import { parseSignupPrefill, type SignupPrefill } from "#/lib/signup-prefill";
import {
	HEIGHT_RANGE_CM,
	lengthFromDisplay,
	lengthToDisplay,
	UNIT_SYSTEMS,
	type UnitSystem,
} from "#/lib/units";
import {
	calcIMC,
	formatWeight,
	fromDisplay,
	GOAL_WEIGHT_MAX_KG,
	GOAL_WEIGHT_MIN_KG,
	imcCategory,
	toDisplay,
} from "#/lib/weight-utils";
import { SITE_URL } from "#/lib/site";

const PAGE_URL = `${SITE_URL}/calculadora-imc`;
const TITLE = "Calculadora de IMC y peso saludable";
const DESCRIPTION =
	"Calcula tu índice de masa corporal y el rango de peso saludable para tu altura. Gratis, en kg y cm o lb e in.";

const FAQS: ReadonlyArray<Faq> = [
	{
		q: "¿Qué es el IMC?",
		a: "El índice de masa corporal relaciona tu peso con tu altura. Es una forma rápida de saber si tu peso está en un rango considerado saludable para tu estatura.",
	},
	{
		q: "¿Cómo se calcula?",
		a: "Se divide el peso en kilogramos entre la altura en metros al cuadrado. Por ejemplo, 70 kg y 1.75 m dan un IMC de 22.9.",
	},
	{
		q: "¿Cuáles son los rangos?",
		a: "Según la Organización Mundial de la Salud: por debajo de 18.5 es bajo peso, de 18.5 a 24.9 es normal, de 25 a 29.9 es sobrepeso y 30 o más es obesidad.",
	},
	{
		q: "¿El IMC tiene limitaciones?",
		a: "Sí. No distingue entre músculo y grasa, así que puede sobrestimar en personas muy musculosas. Tampoco se interpreta igual en niños, embarazadas o personas mayores.",
	},
];

export const Route = createFileRoute("/calculadora-imc")({
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
	component: ImcCalculator,
});

const SYSTEMS: ReadonlyArray<{ id: UnitSystem; label: string }> = [
	{ id: "metric", label: "kg y cm" },
	{ id: "imperial", label: "lb e in" },
];

const CALC_EVENT = { tool: "imc" } as const;

const round1 = (n: number) => Math.round(n * 10) / 10;

function ImcCalculator() {
	const prefill = Route.useSearch();
	const [system, setSystem] = useState<UnitSystem>("metric");
	const { weightUnit, heightUnit } = UNIT_SYSTEMS[system];
	const [weight, setWeight] = useState((prefill.peso ?? 75).toFixed(1));
	const [height, setHeight] = useState(String(prefill.altura ?? 170));
	useTrackOnFirstChange(
		"calculator_used",
		CALC_EVENT,
		[weight, height, system].join("|"),
	);

	// Al cambiar de sistema se convierten los valores ya escritos.
	const changeSystem = (next: UnitSystem) => {
		if (next === system) return;
		const to = UNIT_SYSTEMS[next];
		const kg = fromDisplay(parseFloat(weight), weightUnit);
		const cm = lengthFromDisplay(parseFloat(height), heightUnit);
		if (!Number.isNaN(kg)) setWeight(toDisplay(kg, to.weightUnit).toFixed(1));
		if (!Number.isNaN(cm))
			setHeight(String(Math.round(lengthToDisplay(cm, to.heightUnit))));
		setSystem(next);
	};

	const kg = fromDisplay(parseFloat(weight), weightUnit);
	const cm = lengthFromDisplay(parseFloat(height), heightUnit);
	const valid =
		!Number.isNaN(kg) &&
		kg >= GOAL_WEIGHT_MIN_KG &&
		kg <= GOAL_WEIGHT_MAX_KG &&
		!Number.isNaN(cm) &&
		cm >= HEIGHT_RANGE_CM.min &&
		cm <= HEIGHT_RANGE_CM.max;
	const imc = valid ? calcIMC(kg, cm) : null;
	const category = imcCategory(imc);
	const range = valid ? healthyWeightRange(cm) : null;
	const heightLabel = heightUnit === "ft" ? "in" : "cm";

	// Distancia al rango normal, para dar un paso concreto.
	const gap =
		range && valid
			? kg < range.min
				? { kg: range.min - kg, text: "para entrar en el rango normal" }
				: kg > range.max
					? { kg: kg - range.max, text: "por encima del rango normal" }
					: null
			: null;

	return (
		<ToolLayout
			title={TITLE}
			intro="Escribe tu peso y tu altura. Te mostramos tu IMC, qué significa y qué peso se considera saludable para ti."
			faqs={FAQS}
		>
			<div className="grid gap-4 md:grid-cols-2">
				<section
					aria-label="Tus datos"
					className="space-y-6 rounded-[2rem] border border-border bg-card p-6"
				>
					<Segmented
						label="Unidades"
						options={SYSTEMS}
						value={system}
						onChange={changeSystem}
					/>
					<div className="space-y-2">
						<div className="text-center text-sm text-muted-foreground">
							Peso
						</div>
						<NumberStepper
							size="md"
							label="Peso"
							value={weight}
							onChange={setWeight}
							step={0.5}
							unit={weightUnit}
							base={Math.round(toDisplay(75, weightUnit))}
						/>
					</div>
					<div className="space-y-2">
						<div className="text-center text-sm text-muted-foreground">
							Altura
						</div>
						<NumberStepper
							size="md"
							label="Altura"
							value={height}
							onChange={setHeight}
							step={1}
							decimals={0}
							unit={heightLabel}
							base={heightUnit === "ft" ? 67 : 170}
						/>
					</div>
				</section>

				<section
					aria-live="polite"
					aria-label="Resultado"
					className="flex flex-col rounded-[2rem] border border-border bg-card p-6"
				>
					{imc == null || !category ? (
						<p className="text-muted-foreground">
							Escribe un peso y una altura válidos para ver tu IMC.
						</p>
					) : (
						<>
							<div className="text-sm text-muted-foreground">Tu IMC</div>
							<div className="mt-1 flex items-baseline gap-3">
								<span className="font-display text-5xl tabular-nums tracking-tight">
									{imc.toFixed(1)}
								</span>
								<span
									className={`font-display text-lg ${IMC_TONE_TEXT[category.tone]}`}
								>
									{category.label}
								</span>
							</div>
							<div className="mt-6">
								<ImcScale imc={imc} />
							</div>
							{range && (
								<p className="mt-6 text-pretty">
									Para tu altura, un peso saludable está entre{" "}
									<span className="font-display tabular-nums">
										{formatWeight(range.min, weightUnit)}
									</span>{" "}
									y{" "}
									<span className="font-display tabular-nums">
										{formatWeight(range.max, weightUnit)}
									</span>
									.
								</p>
							)}
							{gap && (
								<p className="mt-2 text-muted-foreground text-pretty">
									Estás a {formatWeight(gap.kg, weightUnit)} {gap.text}.
								</p>
							)}
						</>
					)}

					<div className="mt-auto pt-8">
						<p className="mb-4 text-sm text-muted-foreground text-pretty">
							Vitta calcula tu IMC cada vez que registras tu peso, para que veas
							cómo cambia.
						</p>
						<StartFreeButton
							location="calc_imc"
							prefill={
								valid ? { peso: round1(kg), altura: round1(cm) } : undefined
							}
						/>
					</div>
				</section>
			</div>

			{gap && range && (
				<p className="mt-6 text-sm text-muted-foreground">
					¿Cuánto tardarías en llegar a un peso saludable?{" "}
					<Link
						to="/calculadora-peso-meta"
						search={{
							peso: round1(kg),
							meta: round1(kg > range.max ? range.max : range.min),
						}}
						className="text-primary underline-offset-4 pointer-fine-hover:underline"
					>
						Calcula tu fecha estimada
					</Link>
					.
				</p>
			)}
		</ToolLayout>
	);
}
