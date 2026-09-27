import type { ComponentType } from "react";

export type GuideSource = { label: string; url: string };

// Una guía: metadatos para SEO y listado, el cuerpo y sus fuentes.
export type Guide = {
	slug: string;
	title: string;
	description: string;
	// Fechas ISO (AAAA-MM-DD).
	published: string;
	updated: string;
	readingMinutes: number;
	Body: ComponentType;
	sources: ReadonlyArray<GuideSource>;
	// Calculadora relacionada a la que enlaza el cierre de la guía.
	tool?: { to: "/calculadora-peso-meta" | "/calculadora-imc"; label: string };
};
