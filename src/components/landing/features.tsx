import { AddIcon } from "@solar-icons/react/linear/add";
import { CheckIcon } from "@solar-icons/react/linear/check";
import { MinusIcon } from "@solar-icons/react/linear/minus";
import { CrownMinimalisticIcon } from "@solar-icons/react/outline";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Bars } from "#/components/bars";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

// Datos de ejemplo coherentes entre tarjetas: 82.5 kg hoy, meta 77.5 kg.
const SAMPLE_CURRENT = 82.5;
const SAMPLE_GOAL = 77.5;

export function Features() {
	return (
		<section
			id="features"
			className="max-w-5xl mx-auto px-4 py-16 scroll-mt-16"
		>
			<div className="text-center mb-10">
				<h2 className="font-display text-3xl text-balance">
					Lo que puedes hacer con Vitta
				</h2>
				<p className="text-muted-foreground mt-2 text-pretty">
					Lo básico es gratis. Lo avanzado, un solo pago.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-5">
				<LogFeature />
				<FeatureCard
					className="sm:col-span-3"
					title="Mira hacia dónde vas"
					description="Tu tendencia de 30 días y cuándo llegarás a tu meta."
				>
					<TrendPreview />
				</FeatureCard>
				<FeatureCard
					className="sm:col-span-2"
					title="Hábitos diarios"
					description="Agua, pasos y sueño con un toque."
				>
					<HabitsPreview />
				</FeatureCard>
				<FeatureCard
					className="sm:col-span-2"
					title="Rachas y logros"
					description="Cada día que registras suma a tu racha."
				>
					<StreakPreview />
				</FeatureCard>
				<FeatureCard
					className="sm:col-span-3"
					title="Tu IMC, siempre al día"
					description="Se calcula solo con tu altura y tu último peso."
					badge={
						<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
							<CrownMinimalisticIcon className="size-3.5" />
							Medidas con Premium
						</span>
					}
				>
					<ImcPreview />
				</FeatureCard>
			</div>
		</section>
	);
}

function FeatureCard({
	title,
	description,
	badge,
	className,
	children,
}: {
	title: string;
	description: string;
	badge?: ReactNode;
	className?: string;
	children: ReactNode;
}) {
	return (
		<article
			className={cn(
				"flex flex-col rounded-2xl border border-border bg-card p-5",
				className,
			)}
		>
			<div className="flex flex-wrap items-start justify-between gap-2">
				<h3 className="font-display text-base">{title}</h3>
				{badge}
			</div>
			<p className="mt-1 text-sm text-muted-foreground text-pretty">
				{description}
			</p>
			{/* Las vistas previas son ilustrativas: no las lee el lector de pantalla. */}
			<div aria-hidden="true" className="mt-5 flex flex-1 flex-col justify-end">
				{children}
			</div>
		</article>
	);
}

// El único elemento interactivo: el mismo registro rápido que en la app.
function LogFeature() {
	const [value, setValue] = useState(SAMPLE_CURRENT);
	// Imita el guardado de la app: carga breve con Bars y confirmación.
	const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

	useEffect(() => {
		if (status === "idle") return;
		const t = setTimeout(
			() => setStatus(status === "saving" ? "saved" : "idle"),
			status === "saving" ? 600 : 1600,
		);
		return () => clearTimeout(t);
	}, [status]);

	const bump = (delta: number) => {
		setStatus("idle");
		setValue((v) => Math.round((v + delta) * 10) / 10);
	};

	return (
		<article className="sm:col-span-5 grid items-center gap-6 rounded-3xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-8">
			<div>
				<h3 className="font-display text-2xl text-balance">
					Registra tu peso en 5 segundos
				</h3>
				<p className="mt-2 text-muted-foreground text-pretty">
					Escribe tu peso y guarda. ¿El mismo que ayer? Repítelo con un toque.
					Pruébalo aquí.
				</p>
			</div>

			<div className="rounded-2xl bg-primary p-5 text-primary-foreground">
				<div className="text-[11px] uppercase opacity-70">Registrar peso</div>
				<div className="mt-3 flex items-center justify-between gap-3">
					<button
						type="button"
						onClick={() => bump(-0.1)}
						aria-label="Restar 0.1 kg"
						className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-100 ease-out active:scale-[0.92] motion-reduce:active:scale-100 pointer-fine-hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
					>
						<MinusIcon size={20} className="size-5" />
					</button>
					<output
						aria-live="polite"
						className="flex items-baseline gap-1.5 font-display tabular-nums"
					>
						<span className="text-4xl leading-none sm:text-5xl">
							{value.toFixed(1)}
						</span>
						<span className="text-lg opacity-70">kg</span>
					</output>
					<button
						type="button"
						onClick={() => bump(0.1)}
						aria-label="Sumar 0.1 kg"
						className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 transition-transform duration-100 ease-out active:scale-[0.92] motion-reduce:active:scale-100 pointer-fine-hover:bg-primary-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
					>
						<AddIcon size={20} className="size-5" />
					</button>
				</div>
				<Button
					type="button"
					variant="secondary"
					onClick={() => setStatus("saving")}
					disabled={status === "saving"}
					aria-busy={status === "saving"}
					className="mt-5 h-11 w-full font-display"
				>
					{status === "saving" && <Bars className="mr-1.5 h-3 w-3" />}
					{status === "saved" ? (
						<>
							<CheckIcon className="mr-1.5 size-4" /> Peso registrado
						</>
					) : (
						"Guardar"
					)}
				</Button>
			</div>
		</article>
	);
}

// 30 días de ejemplo que bajan con altibajos hasta el peso actual.
const TREND = Array.from({ length: 30 }, (_, i) => {
	const base = 86.2 - (i / 29) * (86.2 - SAMPLE_CURRENT);
	const wiggle = i === 29 ? 0 : Math.sin(i * 1.7) * 0.35;
	return base + wiggle;
});

const CHART = { w: 300, h: 110, min: 76.5, max: 87 } as const;
const yOf = (kg: number) =>
	((CHART.max - kg) / (CHART.max - CHART.min)) * CHART.h;

function TrendPreview() {
	const ref = useRef<SVGSVGElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setVisible(true);
					io.disconnect();
				}
			},
			{ threshold: 0.4 },
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	const step = CHART.w / (TREND.length - 1);
	const path = TREND.map(
		(kg, i) =>
			`${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${yOf(kg).toFixed(1)}`,
	).join(" ");
	const goalY = yOf(SAMPLE_GOAL);
	const lastY = yOf(SAMPLE_CURRENT);

	return (
		<div>
			{/* El SVG se estira al ancho de la tarjeta; punto y etiqueta van en HTML
			    para que no se deformen. */}
			<div className="relative h-28">
				<svg
					ref={ref}
					viewBox={`0 0 ${CHART.w} ${CHART.h}`}
					preserveAspectRatio="none"
					className="absolute inset-0 h-full w-full overflow-visible"
					role="presentation"
				>
					<line
						x1="0"
						x2={CHART.w}
						y1={goalY}
						y2={goalY}
						className="stroke-muted-foreground/50"
						strokeWidth="1.5"
						strokeDasharray="4 5"
					/>
					<path
						d={path}
						pathLength={1}
						data-visible={visible || undefined}
						className="draw-line fill-none stroke-primary"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<span
					className="absolute right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-card"
					style={{ top: `${(lastY / CHART.h) * 100}%` }}
				/>
				<span
					className="absolute right-0 -translate-y-full pb-1 text-[11px] text-muted-foreground"
					style={{ top: `${(goalY / CHART.h) * 100}%` }}
				>
					Meta {SAMPLE_GOAL} kg
				</span>
			</div>
			<p className="mt-3 text-sm">
				<span className="font-display tabular-nums">−3.7 kg</span>{" "}
				<span className="text-muted-foreground">
					este mes. Llegarías a tu meta en unas 10 semanas.
				</span>
			</p>
		</div>
	);
}

function HabitsPreview() {
	return (
		<div className="space-y-4 text-sm">
			<div>
				<div className="flex justify-between gap-3">
					<span>Agua</span>
					<span className="text-muted-foreground tabular-nums">
						6 de 8 vasos
					</span>
				</div>
				<div className="mt-1.5 grid grid-cols-8 gap-1">
					{Array.from({ length: 8 }, (_, i) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: lista fija de vasos
							key={i}
							className={cn(
								"h-5 rounded-sm",
								i < 6 ? "bg-primary" : "bg-muted",
							)}
						/>
					))}
				</div>
			</div>
			<Meter label="Pasos" value="6.200 de 8.000" pct={78} />
			<Meter label="Sueño" value="7.5 de 8 h" pct={94} />
		</div>
	);
}

function Meter({
	label,
	value,
	pct,
}: {
	label: string;
	value: string;
	pct: number;
}) {
	return (
		<div>
			<div className="flex justify-between gap-3">
				<span>{label}</span>
				<span className="text-muted-foreground tabular-nums">{value}</span>
			</div>
			<div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
				<div
					className="h-full rounded-full bg-primary"
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	);
}

// Últimos 14 días: un día sin registrar rompe la racha anterior.
const STREAK_DAYS = [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

function StreakPreview() {
	return (
		<div>
			<div className="flex items-baseline gap-2">
				<span className="font-brand text-5xl leading-none tabular-nums">
					12
				</span>
				<span className="text-sm text-muted-foreground">días seguidos</span>
			</div>
			<div className="mt-4 grid w-fit grid-cols-7 gap-1.5">
				{STREAK_DAYS.map((done, i) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: calendario fijo de ejemplo
						key={i}
						className={cn(
							"size-6 rounded-[5px]",
							done ? "bg-primary" : "border border-dashed border-border",
						)}
					/>
				))}
			</div>
		</div>
	);
}

// Rangos de IMC de la OMS sobre una escala de 15 a 35.
const IMC_RANGES = [
	{ label: "Bajo", from: 15, to: 18.5, className: "bg-primary/40" },
	{ label: "Normal", from: 18.5, to: 25, className: "bg-positive" },
	{ label: "Sobrepeso", from: 25, to: 30, className: "bg-warning" },
	{ label: "Obesidad", from: 30, to: 35, className: "bg-negative" },
] as const;
const IMC_SAMPLE = 25.5;
const imcPct = (v: number) => ((v - 15) / (35 - 15)) * 100;

function ImcPreview() {
	return (
		<div>
			<div className="flex items-baseline gap-2">
				<span className="font-display text-4xl leading-none tabular-nums">
					{IMC_SAMPLE}
				</span>
				<span className="text-sm text-warning">Sobrepeso</span>
			</div>
			<div className="relative mt-5">
				<div className="flex h-2 overflow-hidden rounded-full">
					{IMC_RANGES.map((r) => (
						<span
							key={r.label}
							className={r.className}
							style={{ width: `${imcPct(r.to) - imcPct(r.from)}%` }}
						/>
					))}
				</div>
				<span
					className="absolute -top-1.5 h-5 w-1 -translate-x-1/2 rounded-full bg-foreground ring-2 ring-card"
					style={{ left: `${imcPct(IMC_SAMPLE)}%` }}
				/>
			</div>
			<div className="mt-2 flex text-[11px] text-muted-foreground">
				{IMC_RANGES.map((r) => (
					<span
						key={r.label}
						className="truncate pr-1"
						style={{ width: `${imcPct(r.to) - imcPct(r.from)}%` }}
					>
						{r.label}
					</span>
				))}
			</div>
		</div>
	);
}

export default Features;
