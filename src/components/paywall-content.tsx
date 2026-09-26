import { CheckIcon } from "@solar-icons/react/linear/check";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";
import { Bars } from "./bars";

const BENEFITS = [
	"Historial completo, sin límite de 30 registros",
	"Medidas corporales: cintura, cadera, pecho y más",
	"Nutrición: comidas, calorías y macros",
	"Ayuno intermitente con temporizador",
	"Actividad física y resumen semanal",
	"Gráficos con media móvil y línea de meta",
	"Exporta tus datos en CSV y JSON",
	"Todas las funciones futuras incluidas",
];

type PaywallContentProps = {
	isPro?: boolean;
};

export function PaywallContent({ isPro = false }: PaywallContentProps = {}) {
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleCheckout = async () => {
		if (isPro) {
			void navigate({ to: "/dashboard" });
			return;
		}
		if (typeof window !== "undefined" && window.self !== window.top) {
			toast.error(
				"El pago solo funciona desde la app publicada. Ábrela en una pestaña nueva para comprar.",
			);
			return;
		}
		setLoading(true);
		try {
			const { data, error } = await authClient.dodopayments.checkoutSession({
				slug: "pro-lifetime",
			});
			if (error) {
				toast.error("No se pudo iniciar el pago.");
				setLoading(false);
				return;
			}
			if (data?.url) {
				window.location.assign(data.url);
				return;
			}
			toast.error("No se pudo iniciar el pago.");
			setLoading(false);
		} catch {
			toast.error("No se pudo iniciar el pago.");
			setLoading(false);
		}
	};

	return (
		<div className="text-center">
			<h2 className="font-display text-2xl text-balance">Desbloquea todo</h2>
			<p className="text-muted-foreground text-sm mt-1 text-pretty">
				Un solo pago. Tuyo para siempre.
			</p>

			<div className="my-5">
				<span className="font-display text-4xl tabular-nums">$12.99</span>
				<span className="text-muted-foreground text-sm"> USD</span>
			</div>

			<ul className="text-left space-y-2.5 mb-6">
				{BENEFITS.map((b) => (
					<li key={b} className="flex items-center gap-2.5 text-sm">
						<CheckIcon className="size-4 text-primary shrink-0" />
						<span>{b}</span>
					</li>
				))}
			</ul>

			<Button
				onClick={handleCheckout}
				disabled={loading}
				className="w-full h-12 font-display"
			>
				{loading ? (
					<>
						<Bars className="w-4 h-4 mr-2" /> Procesando...
					</>
				) : isPro ? (
					"Ir a mi inicio"
				) : (
					"Desbloquear Premium · $12.99"
				)}
			</Button>
			{!isPro && (
				<p className="text-[11px] text-muted-foreground mt-3">
					Pago seguro vía Dodo Payments
				</p>
			)}
		</div>
	);
}

export default PaywallContent;
