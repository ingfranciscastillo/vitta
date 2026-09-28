import { createFileRoute, Link } from "@tanstack/react-router";
import LandingFooter from "#/components/landing/landing-footer";
import LandingNavbar from "#/components/landing/landing-navbar";
import { GUIDES } from "#/content/guias";
import { SITE_URL } from "#/lib/site";

const URL_GUIDES = `${SITE_URL}/guias`;
const DESCRIPTION =
	"Guías claras sobre cómo pesarte, leer tu progreso y fijar objetivos realistas, con fuentes.";

export const Route = createFileRoute("/guias/")({
	head: () => ({
		meta: [
			{ title: "Guías · Vitta" },
			{ name: "description", content: DESCRIPTION },
			{ property: "og:title", content: "Guías de Vitta" },
			{ property: "og:description", content: DESCRIPTION },
			{ property: "og:url", content: URL_GUIDES },
		],
		links: [{ rel: "canonical", href: URL_GUIDES }],
	}),
	component: GuidesIndex,
});

function GuidesIndex() {
	return (
		<div className="min-h-dvh bg-background">
			<LandingNavbar />
			<main className="mx-auto max-w-2xl px-4 pt-12 pb-16 md:pt-16">
				<h1 className="font-display text-3xl tracking-tight sm:text-4xl">
					Guías
				</h1>
				<p className="mt-3 text-lg text-muted-foreground text-pretty">
					Cómo pesarte, leer tu progreso y fijar objetivos realistas. Con
					fuentes, sin milagros.
				</p>
				<ul className="mt-10 divide-y divide-border border-y border-border">
					{GUIDES.map((g) => (
						<li key={g.slug}>
							<Link
								to="/guias/$slug"
								params={{ slug: g.slug }}
								className="group block py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<h2 className="font-display text-xl tracking-tight text-balance group-hover:text-primary transition-colors duration-100 ease-out">
									{g.title}
								</h2>
								<p className="mt-2 text-muted-foreground text-pretty">
									{g.description}
								</p>
								<p className="mt-2 text-sm text-muted-foreground">
									{g.readingMinutes} min de lectura
								</p>
							</Link>
						</li>
					))}
				</ul>
			</main>
			<LandingFooter />
		</div>
	);
}
