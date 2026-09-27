import { Link } from "@tanstack/react-router";
import LandingFooter from "#/components/landing/landing-footer";
import LandingNavbar from "#/components/landing/landing-navbar";
import StartFreeButton from "#/components/landing/start-free-button";
import type { Guide } from "#/content/guias/types";
import { formatDate } from "#/lib/weight-utils";

export function GuideLayout({ guide }: { guide: Guide }) {
	const { Body } = guide;
	return (
		<div className="min-h-dvh bg-background">
			<LandingNavbar />
			<main className="mx-auto max-w-2xl px-4 pt-10 pb-16 md:pt-14">
				<nav aria-label="Ruta" className="text-sm text-muted-foreground">
					<Link
						to="/guias"
						className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
					>
						Guías
					</Link>
				</nav>

				<article>
					<header className="mt-4">
						<h1 className="font-display text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
							{guide.title}
						</h1>
						<p className="mt-4 text-sm text-muted-foreground">
							Actualizado el{" "}
							<time dateTime={guide.updated}>{formatDate(guide.updated)}</time>{" "}
							· {guide.readingMinutes} min de lectura
						</p>
					</header>

					<div className="guide-body mt-8">
						<Body />
					</div>

					<aside className="mt-14 rounded-[2rem] bg-primary p-6 text-primary-foreground sm:p-8">
						<h2 className="font-display text-2xl tracking-tight text-balance">
							Mira tu tendencia, no el dato de hoy
						</h2>
						<p className="mt-2 text-primary-foreground/80 text-pretty">
							Vitta guarda tu peso de cada día y te muestra la tendencia de 30
							días, para que un pico suelto no te desanime.
						</p>
						<div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
							<StartFreeButton variant="inverse" location="guide" />
							{guide.tool && (
								<Link
									to={guide.tool.to}
									className="text-sm text-primary-foreground underline-offset-4 pointer-fine-hover:underline"
								>
									{guide.tool.label}
								</Link>
							)}
						</div>
					</aside>

					<section aria-labelledby="fuentes" className="mt-14">
						<h2 id="fuentes" className="font-display text-lg">
							Fuentes
						</h2>
						<ol className="mt-4 space-y-3 text-sm text-muted-foreground">
							{guide.sources.map((s, i) => (
								<li key={s.url} id={`fuente-${i + 1}`} className="scroll-mt-24">
									<span className="tabular-nums">[{i + 1}]</span> {s.label}{" "}
									<a
										href={s.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary underline-offset-4 pointer-fine-hover:underline"
									>
										Ver estudio
									</a>
								</li>
							))}
						</ol>
					</section>

					<p className="mt-10 text-xs text-muted-foreground text-pretty">
						Este contenido es informativo y no sustituye el consejo de un
						profesional de la salud.
					</p>
				</article>
			</main>
			<LandingFooter />
		</div>
	);
}

export default GuideLayout;
