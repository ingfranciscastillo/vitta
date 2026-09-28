import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";

// Pantallas de "no encontrado" y de error para todo el router. Sin navbar:
// pueden aparecer dentro de la app autenticada o en las páginas públicas.

function FallbackShell({
	code,
	title,
	children,
	actions,
}: {
	code: string;
	title: string;
	children: ReactNode;
	actions: ReactNode;
}) {
	return (
		<main className="min-h-[70dvh] grid place-items-center px-4 py-16">
			<div className="w-full max-w-sm text-center">
				<Link to="/" className="inline-flex items-center gap-2">
					<span className="size-2.5 rounded-full bg-primary" />
					<span className="font-brand text-lg">Vitta</span>
				</Link>
				<p className="mt-10 font-display text-sm text-muted-foreground tabular-nums">
					{code}
				</p>
				<h1 className="mt-2 font-display text-2xl tracking-tight text-balance">
					{title}
				</h1>
				<div className="mt-3 text-sm text-muted-foreground text-pretty">
					{children}
				</div>
				<div className="mt-8 flex flex-col gap-2">{actions}</div>
			</div>
		</main>
	);
}

export function NotFoundPage() {
	return (
		<FallbackShell
			code="404"
			title="No encontramos esta página"
			actions={
				<Button asChild size="cta" className="w-full">
					<Link to="/">Ir al inicio</Link>
				</Button>
			}
		>
			<p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
		</FallbackShell>
	);
}

export function RouteErrorPage({ reset }: ErrorComponentProps) {
	const router = useRouter();
	return (
		<FallbackShell
			code="Error"
			title="Algo salió mal"
			actions={
				<>
					<Button
						type="button"
						size="cta"
						className="w-full"
						onClick={() => {
							reset();
							router.invalidate();
						}}
					>
						Reintentar
					</Button>
					<Button asChild size="cta" variant="outline" className="w-full">
						<Link to="/">Ir al inicio</Link>
					</Button>
				</>
			}
		>
			<p>
				No pudimos cargar esta pantalla. Tus datos están a salvo; vuelve a
				intentarlo en unos segundos.
			</p>
		</FallbackShell>
	);
}
