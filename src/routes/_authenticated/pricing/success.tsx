import { CheckIcon } from "@solar-icons/react/linear/check";
import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bars } from "#/components/bars";
import { Button } from "#/components/ui/button";
import { track } from "#/lib/analytics";
import { currentUserQuery } from "#/lib/profile";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_MS = 10000;

export const Route = createFileRoute("/_authenticated/pricing/success")({
	component: PricingSuccessPage,
});

// Evita contar dos veces la compra si se recarga la página de éxito.
const trackPurchaseOnce = () => {
	try {
		if (sessionStorage.getItem("vitta:purchase-tracked")) return;
		sessionStorage.setItem("vitta:purchase-tracked", "1");
	} catch {
		// Sin almacenamiento se registra igual.
	}
	track("purchase_completed", { revenue: 12.99, currency: "USD" });
};

type Status = "verifying" | "success" | "error";

function PricingSuccessPage() {
	const navigate = useNavigate();
	const router = useRouter();
	const qc = useQueryClient();
	const [status, setStatus] = useState<Status>("verifying");

	useEffect(() => {
		const startedAt = Date.now();
		let cancelled = false;

		const check = async (): Promise<boolean> => {
			await qc.invalidateQueries({ queryKey: ["current-user"] });
			await router.invalidate();
			const me = await qc.fetchQuery(currentUserQuery());
			return me?.isPro === true;
		};

		const tick = async (): Promise<void> => {
			if (cancelled) return;
			try {
				const ok = await check();
				if (cancelled) return;
				if (ok) {
					setStatus("success");
					trackPurchaseOnce();
					return;
				}
			} catch {
				if (cancelled) return;
			}
			if (Date.now() - startedAt >= POLL_MAX_MS) {
				setStatus("error");
				return;
			}
			setTimeout(tick, POLL_INTERVAL_MS);
		};

		void tick();

		return () => {
			cancelled = true;
		};
	}, [qc, router]);

	if (status === "verifying") {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
				<Bars className="w-8 h-4 text-primary" />
				<p className="text-muted-foreground text-sm text-pretty">Verificando tu pago...</p>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center">
				<p className="text-muted-foreground text-sm max-w-xs text-pretty">
					No pudimos confirmar tu pago todavía. Si ya pagaste, puedes revisarlo
					en unos minutos desde tu perfil.
				</p>
				<Button onClick={() => navigate({ to: "/profile" })}>
					Ir a Perfil
				</Button>
			</div>
		);
	}

	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
			<div className="size-16 rounded-full bg-primary/15 text-primary flex items-center justify-center">
				<CheckIcon className="w-8 h-8" />
			</div>
			<div>
				<h1 className="font-display text-2xl text-balance">¡Premium activado!</h1>
				<p className="text-muted-foreground text-sm mt-1 text-pretty">
					Gracias por tu compra. Todas las funciones están desbloqueadas.
				</p>
			</div>
			<Button
				onClick={() => navigate({ to: "/dashboard" })}
				size="cta"
			>
				Empezar a usar
			</Button>
		</div>
	);
}
