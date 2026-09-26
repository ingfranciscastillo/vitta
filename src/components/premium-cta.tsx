import { CheckIcon } from "@solar-icons/react/linear/check";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

const BENEFITS = [
	"Historial completo",
	"Medidas y nutrición",
	"Ayuno y actividad",
	"Exporta en CSV y JSON",
];

export function PremiumCTA() {
	return (
		<section className="max-w-5xl mx-auto px-4 py-16">
			<div className="rounded-3xl bg-primary text-primary-foreground p-8 text-center">
				<h2 className="font-display text-3xl text-balance">Desbloquea todo por $12.99</h2>
				<p className="opacity-80 text-sm mt-3 max-w-md mx-auto text-pretty">
					Un solo pago, tuyo para siempre. Sin suscripciones. Empieza gratis y
					mejora cuando quieras.
				</p>
				<ul className="grid grid-cols-2 gap-2 max-w-sm mx-auto my-6 text-left text-sm">
					{BENEFITS.map((b) => (
						<li key={b} className="flex items-center gap-2">
							<CheckIcon className="w-4 h-4" /> {b}
						</li>
					))}
				</ul>
				<Button
					asChild
					variant="secondary"
					size="lg"
					className="h-12 px-6 font-display"
				>
					<Link to={"/register" as string}>Empezar gratis</Link>
				</Button>
			</div>
		</section>
	);
}

export default PremiumCTA;
