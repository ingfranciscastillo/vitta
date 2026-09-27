import type { ReactNode } from "react";
import LandingFooter from "#/components/landing/landing-footer";
import LandingNavbar from "#/components/landing/landing-navbar";

export type Faq = { q: string; a: string };

// Estructura común de las calculadoras públicas: título, herramienta,
// preguntas frecuentes y aviso de salud.
export function ToolLayout({
	title,
	intro,
	faqs,
	children,
}: {
	title: string;
	intro: string;
	faqs: ReadonlyArray<Faq>;
	children: ReactNode;
}) {
	return (
		<div className="min-h-dvh bg-background">
			<LandingNavbar />
			<main className="mx-auto max-w-4xl px-4 pt-12 pb-16 md:pt-16">
				<div className="max-w-2xl">
					<h1 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
						{title}
					</h1>
					<p className="mt-3 text-lg text-muted-foreground text-pretty">
						{intro}
					</p>
				</div>

				<div className="mt-10">{children}</div>

				<section aria-labelledby="faq-title" className="mt-20 max-w-2xl">
					<h2 id="faq-title" className="font-display text-2xl tracking-tight">
						Preguntas frecuentes
					</h2>
					<div className="mt-6 divide-y divide-border border-y border-border">
						{faqs.map((f) => (
							<details key={f.q} className="group py-4">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
									{f.q}
									<span
										aria-hidden="true"
										className="text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45"
									>
										+
									</span>
								</summary>
								<p className="mt-3 text-muted-foreground text-pretty">{f.a}</p>
							</details>
						))}
					</div>
				</section>

				<p className="mt-10 max-w-2xl text-xs text-muted-foreground text-pretty">
					Esta calculadora es orientativa y no sustituye el consejo de un
					profesional de la salud.
				</p>
			</main>
			<LandingFooter />
		</div>
	);
}

// Datos estructurados para buscadores: la herramienta y sus preguntas.
export const toolJsonLd = ({
	name,
	description,
	url,
	faqs,
}: {
	name: string;
	description: string;
	url: string;
	faqs: ReadonlyArray<Faq>;
}) =>
	JSON.stringify([
		{
			"@context": "https://schema.org",
			"@type": "WebApplication",
			name,
			description,
			url,
			applicationCategory: "HealthApplication",
			operatingSystem: "Web",
			inLanguage: "es",
			isAccessibleForFree: true,
		},
		{
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: faqs.map((f) => ({
				"@type": "Question",
				name: f.q,
				acceptedAnswer: { "@type": "Answer", text: f.a },
			})),
		},
	]);

export default ToolLayout;
