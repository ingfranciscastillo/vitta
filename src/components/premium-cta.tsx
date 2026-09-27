import { CheckIcon } from "@solar-icons/react/linear/check";
import { StartFreeButton } from "#/components/landing/start-free-button";
import { cn } from "#/lib/utils";

// Lo que incluye cada plan hoy. Mantener alineado con los PremiumGate de la app.
const PLANS = [
	{
		name: "Gratis",
		price: "$0",
		note: "Para siempre",
		features: [
			"Registro de peso y objetivo",
			"Agua, pasos y sueño",
			"IMC, rachas y logros",
			"Gráfico de 30 días",
			"Tus últimos 30 registros",
		],
		highlight: false,
	},
	{
		name: "Premium",
		price: "$12.99",
		note: "Pago único, sin suscripción",
		features: [
			"Historial completo",
			"Medidas corporales",
			"Nutrición, calorías y macros",
			"Ayuno y actividad física",
			"Resumen semanal y gráficos avanzados",
			"Exporta tus datos en CSV y JSON",
		],
		highlight: true,
	},
] as const;

export function PremiumCTA() {
	return (
		<section className="mx-auto max-w-5xl px-4 py-24">
			<div className="mx-auto max-w-xl text-center">
				<h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
					Empieza gratis. Paga una vez si quieres más.
				</h2>
				<p className="mt-3 text-muted-foreground text-pretty">
					Sin tarjeta para empezar y sin cuotas mensuales.
				</p>
			</div>

			<div className="mt-12 rounded-[2rem] bg-foreground/5 p-2 ring-1 ring-border">
				<div className="grid gap-2 md:grid-cols-2">
					{PLANS.map((plan) => (
						<article
							key={plan.name}
							className={cn(
								"flex flex-col rounded-[calc(2rem-0.5rem)] p-6 sm:p-8",
								plan.highlight
									? "bg-primary text-primary-foreground shadow-[inset_0_1px_0_hsl(0_0%_100%/0.15)]"
									: "bg-card",
							)}
						>
							<h3 className="font-display text-lg">{plan.name}</h3>
							<div className="mt-4 flex items-baseline gap-2">
								<span className="font-display text-4xl tabular-nums">
									{plan.price}
								</span>
								<span
									className={cn(
										"text-sm",
										plan.highlight
											? "text-primary-foreground/75"
											: "text-muted-foreground",
									)}
								>
									{plan.note}
								</span>
							</div>
							<ul className="mt-6 space-y-3 text-sm">
								{plan.features.map((f) => (
									<li key={f} className="flex items-start gap-2.5">
										<CheckIcon
											className={cn(
												"mt-0.5 size-4 shrink-0",
												plan.highlight
													? "text-primary-foreground"
													: "text-primary",
											)}
										/>
										{f}
									</li>
								))}
							</ul>
						</article>
					))}
				</div>
			</div>

			<div className="mt-10 flex justify-center">
				<StartFreeButton />
			</div>
		</section>
	);
}

export default PremiumCTA;
