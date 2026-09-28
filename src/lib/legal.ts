import { SITE_URL } from "#/lib/site";

// Datos del titular y fechas de las páginas legales. Cambiar aquí actualiza
// Términos, Privacidad y Reembolsos a la vez.
export const LEGAL = {
	owner: "Francis Miguel Castillo Cruz",
	country: "República Dominicana",
	email: "franciscastillodev@proton.me",
	product: "Vitta",
	site: SITE_URL,
	updated: "2026-09-27",
	refundDays: 14,
	premiumPrice: "$12.99 USD",
} as const;
