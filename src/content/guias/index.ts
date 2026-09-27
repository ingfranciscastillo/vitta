import { guide as porQueTuPesoCambia } from "#/content/guias/es/por-que-tu-peso-cambia-cada-dia";
import type { Guide } from "#/content/guias/types";

// Guías en español. Cuando se añada otro idioma (Paraglide), cada locale
// tendrá su propia lista bajo `content/guias/<locale>/`.
export const GUIDES: ReadonlyArray<Guide> = [porQueTuPesoCambia];

export const getGuide = (slug: string): Guide | undefined =>
	GUIDES.find((g) => g.slug === slug);
