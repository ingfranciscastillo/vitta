import { useEffect, useRef } from "react";

// Analítica con Umami: sin cookies ni datos personales. El plan de medición
// está documentado en docs/ANALYTICS.md; cada evento responde a una decisión.

export const UMAMI_WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID as
	| string
	| undefined;
// Solo se cuentan visitas en estos dominios (el entorno local no ensucia).
export const UMAMI_DOMAINS =
	(import.meta.env.VITE_UMAMI_DOMAINS as string | undefined) ?? "vitta.app";
export const UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js";

type EventMap = {
	// ¿Qué llamadas a registrarse convierten mejor?
	cta_clicked: { location: CtaLocation };
	// ¿Las calculadoras atraen uso real, no solo visitas?
	calculator_used: { tool: "peso_meta" | "imc" };
	signup_completed: { method: "email"; prefilled: boolean };
	// ¿Dónde se abandona el onboarding?
	onboarding_step_completed: { step: string };
	onboarding_finished: { skipped: boolean };
	// Activación: el primer peso es el momento clave.
	weight_logged: { first: boolean };
	import_completed: { source: string; rows: number };
	checkout_started: Record<string, never>;
	purchase_completed: { revenue: number; currency: "USD" };
};

export type CtaLocation =
	| "nav"
	| "hero"
	| "cta_final"
	| "calc_peso_meta"
	| "calc_imc"
	| "guide";

export type AnalyticsEvent = keyof EventMap;

declare global {
	interface Window {
		umami?: {
			track: (event: string, data?: Record<string, unknown>) => void;
		};
	}
}

// Sin script (desarrollo, bloqueadores) no hace nada ni lanza errores.
export function track<E extends AnalyticsEvent>(event: E, data?: EventMap[E]) {
	if (typeof window === "undefined") return;
	try {
		window.umami?.track(event, data);
	} catch {
		// La analítica nunca debe romper la app.
	}
}

// Atributos para medir clics sin JavaScript (Umami los lee del DOM).
export const ctaAttributes = (location: CtaLocation) => ({
	"data-umami-event": "cta_clicked",
	"data-umami-event-location": location,
});

// Registra un evento una sola vez, la primera vez que cambia `watch` tras el
// montaje. Sirve para medir uso real (no visitas) en herramientas.
export function useTrackOnFirstChange<E extends AnalyticsEvent>(
	event: E,
	data: EventMap[E],
	watch: string,
) {
	const initial = useRef(watch);
	const sent = useRef(false);
	useEffect(() => {
		if (sent.current || watch === initial.current) return;
		sent.current = true;
		track(event, data);
	}, [watch, event, data]);
}
