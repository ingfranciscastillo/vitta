import { createFileRoute, redirect } from "@tanstack/react-router";

// La configuración vive ahora dentro de Perfil.
export const Route = createFileRoute("/_authenticated/settings")({
	beforeLoad: () => {
		throw redirect({ to: "/profile", hash: "preferencias", replace: true });
	},
});
