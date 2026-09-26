import { createFileRoute, redirect } from "@tanstack/react-router";

// Exportar e importar viven ahora en la sección Datos de Perfil.
export const Route = createFileRoute("/_authenticated/export")({
	beforeLoad: () => {
		throw redirect({ to: "/profile", hash: "datos", replace: true });
	},
});
