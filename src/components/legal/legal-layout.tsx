import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import LandingFooter from "#/components/landing/landing-footer";
import LandingNavbar from "#/components/landing/landing-navbar";
import { LEGAL } from "#/lib/legal";
import { formatDate } from "#/lib/weight-utils";

const LEGAL_LINKS = [
	{ to: "/terminos", label: "Términos" },
	{ to: "/privacy", label: "Privacidad" },
	{ to: "/reembolsos", label: "Reembolsos" },
] as const;

// Plantilla común de las páginas legales: resumen arriba, texto con el estilo
// de lectura de las guías y enlaces cruzados.
export function LegalLayout({
	title,
	summary,
	children,
}: {
	title: string;
	summary: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="min-h-dvh bg-background">
			<LandingNavbar />
			<main className="mx-auto max-w-2xl px-4 pt-10 pb-16 md:pt-14">
				<nav
					aria-label="Documentos legales"
					className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"
				>
					{LEGAL_LINKS.map((l) => (
						<Link
							key={l.to}
							to={l.to}
							activeProps={{ className: "text-foreground" }}
							className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
						>
							{l.label}
						</Link>
					))}
				</nav>
				<h1 className="mt-4 font-display text-3xl tracking-tight text-balance sm:text-4xl">
					{title}
				</h1>
				<p className="mt-3 text-sm text-muted-foreground">
					Última actualización:{" "}
					<time dateTime={LEGAL.updated}>{formatDate(LEGAL.updated)}</time>
				</p>

				<div className="mt-8 rounded-2xl border border-border bg-card p-5">
					<h2 className="font-display text-base">En resumen</h2>
					<div className="mt-2 text-sm text-muted-foreground text-pretty">
						{summary}
					</div>
				</div>

				<div className="guide-body mt-10">{children}</div>

				<p className="mt-12 text-sm text-muted-foreground text-pretty">
					¿Dudas? Escríbenos a{" "}
					<a
						href={`mailto:${LEGAL.email}`}
						className="text-primary underline-offset-4 pointer-fine-hover:underline"
					>
						{LEGAL.email}
					</a>
					.
				</p>
			</main>
			<LandingFooter />
		</div>
	);
}

export default LegalLayout;
