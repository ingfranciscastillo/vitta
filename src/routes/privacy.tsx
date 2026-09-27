import { ArrowLeftIcon, ShieldIcon } from "@solar-icons/react/linear";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

const sections: Array<{ title: string; body: string }> = [
	{
		title: "Almacenamiento de datos",
		body: "Tus registros de peso se guardan de forma segura en una base de datos asociada únicamente a tu cuenta de usuario. Nadie más puede acceder a ellos.",
	},
	{
		title: "Privacidad de tus registros",
		body: "Cada usuario solo puede ver, editar y eliminar sus propios registros. Tus datos de peso nunca se comparten con otros usuarios ni con terceros.",
	},
	{
		title: "Datos que guardamos",
		body: "Almacenamos el peso, la fecha y hora del registro, las notas opcionales que añadas y tus preferencias (unidades, tema y zona horaria). No recopilamos datos de ubicación ni de actividad de terceros.",
	},
	{
		title: "Seguridad",
		body: "Las contraseñas se almacenan cifradas y toda la comunicación se realiza sobre HTTPS. Aplicamos controles de acceso para que solo tú entres a tu información.",
	},
	{
		title: "Tus derechos",
		body: "Puedes exportar todos tus datos desde la página Exportar Datos y eliminarlos en cualquier momento desde tu perfil. Si deseas eliminar tu cuenta, contáctanos a través de Soporte.",
	},
	{
		title: "Contacto",
		body: "Si tienes preguntas sobre tu privacidad, abre un reporte desde la página de Soporte y te responderemos lo antes posible.",
	},
];

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [{ title: "Privacidad · Vitta" }],
		links: [{ rel: "canonical", href: "https://vitta.app/privacy" }],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<div className="min-h-dvh bg-background">
			<header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border pt-[env(safe-area-inset-top)]">
				<div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
					<Button asChild variant="ghost" size="icon" className="size-9">
						<Link to="/">
							<ArrowLeftIcon className="w-5 h-5" />
						</Link>
					</Button>
					<span className="font-display text-base">Privacidad</span>
				</div>
			</header>

			<main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
				<div className="flex items-center gap-2">
					<ShieldIcon className="w-5 h-5 text-primary" />
					<h1 className="font-display text-2xl text-balance">Cómo protegemos tus datos</h1>
				</div>
				<p className="text-muted-foreground text-sm text-pretty">
					Tu privacidad es prioritaria. Esta página explica de forma sencilla
					cómo se almacenan y protegen tus datos de peso.
				</p>
				{sections.map((s) => (
					<section
						key={s.title}
						className="rounded-2xl bg-card border border-border p-5"
					>
						<h2 className="font-display text-base mb-1.5 text-balance">{s.title}</h2>
						<p className="text-sm text-muted-foreground leading-relaxed text-pretty">
							{s.body}
						</p>
					</section>
				))}
				<p className="text-xs text-muted-foreground pt-2 text-pretty">
					Última actualización: agosto 2026
				</p>
			</main>
		</div>
	);
}
