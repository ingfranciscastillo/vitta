import { Link } from "@tanstack/react-router";
import { StartFreeButton } from "#/components/landing/start-free-button";

export function Hero() {
	return (
		<section className="mx-auto grid max-w-5xl items-center gap-12 px-4 pt-12 pb-20 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:pt-20 md:pb-24">
			<div className="hero-rise">
				<h1 className="font-display text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
					Registra tu peso en 5 segundos.
				</h1>
				<p className="mt-6 max-w-md text-lg text-muted-foreground text-pretty">
					Mira tu progreso cada día: peso, agua, pasos, sueño y medidas. Gratis
					para empezar, Premium en un solo pago.
				</p>
				<div className="mt-8 flex flex-wrap items-center gap-3">
					<StartFreeButton />
					<Link
						to={"/login" as string}
						className="inline-flex h-12 items-center rounded-full px-6 font-display text-base text-foreground ring-1 ring-border transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-fine-hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						Iniciar sesión
					</Link>
				</div>
			</div>

			<AppPreview />
		</section>
	);
}

// Captura real del inicio de Vitta (datos de ejemplo), en un marco de doble bisel.
function AppPreview() {
	return (
		<div className="hero-rise hero-rise-delay flex justify-center md:justify-end">
			<div className="w-[min(78vw,300px)] rounded-[2.75rem] bg-foreground/5 p-2 ring-1 ring-border md:-rotate-2 md:transition-transform md:duration-700 md:ease-[cubic-bezier(0.32,0.72,0,1)] md:hover:rotate-0">
				<div className="overflow-hidden rounded-[calc(2.75rem-0.5rem)] bg-background shadow-[0_40px_80px_-32px_hsl(var(--primary)/0.45)]">
					<img
						src="/landing/app-light.webp"
						alt="Pantalla de inicio de Vitta con el peso actual, el cambio total, el IMC y el objetivo"
						width={896}
						height={1860}
						fetchPriority="high"
						className="block h-auto max-h-[min(620px,68dvh)] w-full object-cover object-top dark:hidden"
					/>
					<img
						src="/landing/app-dark.webp"
						alt="Pantalla de inicio de Vitta con el peso actual, el cambio total, el IMC y el objetivo"
						width={896}
						height={1860}
						className="hidden h-auto max-h-[min(620px,68dvh)] w-full object-cover object-top dark:block"
					/>
				</div>
			</div>
		</div>
	);
}

export default Hero;
