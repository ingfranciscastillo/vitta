import {
	formatDelta,
	sortByDateAsc,
	type WeightEntry,
	type WeightUnit,
} from "#/lib/weight-utils";

// Explica el último cambio de peso con patrones documentados (agua, fin de
// semana, tendencia semanal). Son orientaciones, no diagnósticos: el texto
// siempre usa "suele" y enlaza a la guía con las fuentes.

export type WeightChangeTone = "calm" | "positive" | "attention";

export type WeightChangeExplanation = {
	tone: WeightChangeTone;
	title: string;
	body: string;
};

// Por debajo de esto el cambio es ruido de medición y no se comenta.
const NOISE_KG = 0.2;
// Cambio mínimo de la media semanal para considerarlo una dirección.
const TREND_KG = 0.1;
// Solo se explica si el último registro es reciente.
const MAX_AGE_DAYS = 2;

const DAY_MS = 86_400_000;
const toTime = (d: string) => new Date(`${d}T00:00:00`).getTime();

const WEEKDAY_NAMES = [
	"domingo",
	"lunes",
	"martes",
	"miércoles",
	"jueves",
	"viernes",
	"sábado",
];

// Media de los registros en la ventana de 7 días que termina `endOffset`
// días antes del último registro.
const weekAverage = (
	asc: WeightEntry[],
	lastTime: number,
	endOffset: number,
): number | null => {
	const end = lastTime - endOffset * DAY_MS;
	const start = end - 6 * DAY_MS;
	const values = asc
		.filter((e) => {
			const t = toTime(e.date);
			return t >= start && t <= end;
		})
		.map((e) => e.weight);
	return values.length
		? values.reduce((s, v) => s + v, 0) / values.length
		: null;
};

// ¿Entre el registro anterior y el último hubo un sábado o domingo?
const spansWeekend = (prev: string, last: string): boolean => {
	const lastDay = new Date(`${last}T00:00:00`).getDay();
	if (![0, 1, 2].includes(lastDay)) return false; // domingo a martes
	for (let t = toTime(prev); t < toTime(last); t += DAY_MS) {
		const d = new Date(t).getDay();
		if (d === 5 || d === 6) return true; // viernes o sábado
	}
	return false;
};

export const explainWeightChange = ({
	entries,
	unit,
	goalDirection,
	today = new Date(),
}: {
	entries: WeightEntry[];
	unit: WeightUnit;
	// Dirección deseada según el objetivo; null si no hay objetivo.
	goalDirection: "lose" | "gain" | null;
	today?: Date;
}): WeightChangeExplanation | null => {
	const asc = sortByDateAsc(entries);
	if (asc.length < 2) return null;
	const last = asc[asc.length - 1];
	const prev = asc[asc.length - 2];

	const todayTime = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	).getTime();
	if (todayTime - toTime(last.date) > MAX_AGE_DAYS * DAY_MS) return null;

	const delta = last.weight - prev.weight;

	const lastTime = toTime(last.date);
	const thisWeek = weekAverage(asc, lastTime, 0);
	const lastWeek = weekAverage(asc, lastTime, 7);
	const twoWeeksAgo = weekAverage(asc, lastTime, 14);
	const trend =
		thisWeek != null && lastWeek != null ? thisWeek - lastWeek : null;
	const prevTrend =
		lastWeek != null && twoWeeksAgo != null ? lastWeek - twoWeeksAgo : null;

	// "A favor" es la dirección del objetivo. Sin objetivo (o para mantener)
	// no se juzga la dirección: solo se explican los saltos.
	const wanted =
		goalDirection === "gain" ? 1 : goalDirection === "lose" ? -1 : 0;
	const trendFavorable =
		trend != null && wanted !== 0 && trend * wanted > TREND_KG;
	const trendAgainst =
		trend != null && wanted !== 0 && trend * wanted < -TREND_KG;
	const prevAgainst =
		prevTrend != null && wanted !== 0 && prevTrend * wanted < -TREND_KG;

	const since =
		toTime(last.date) - toTime(prev.date) <= DAY_MS
			? "desde ayer"
			: `desde el ${WEEKDAY_NAMES[new Date(`${prev.date}T00:00:00`).getDay()]}`;
	const verb = delta > 0 ? "Subiste" : "Bajaste";
	const title = `${verb} ${formatDelta(Math.abs(delta), unit).replace("+", "")} ${since}`;
	const trendText = trend != null ? formatDelta(trend, unit) : "";

	// Una tendencia sostenida en contra importa aunque el cambio diario sea
	// pequeño: se comprueba antes del filtro de ruido.
	if (trendAgainst && prevAgainst && thisWeek != null) {
		return {
			tone: "attention",
			title: `Tu media semanal ${trend > 0 ? "sube" : "baja"} (${trendText})`,
			body: "Va en contra de tu objetivo por segunda semana seguida. Esto ya no es agua: es una tendencia que vale la pena revisar.",
		};
	}

	if (Math.abs(delta) < NOISE_KG) return null;

	// Sin objetivo, cualquier subida se trata como el caso a explicar.
	const movedAgainst = wanted === 0 ? delta > 0 : delta * wanted < 0;

	if (movedAgainst) {
		if (spansWeekend(prev.date, last.date)) {
			return {
				tone: "calm",
				title,
				body: "Es habitual después del fin de semana y suele corregirse en 2 o 3 días. Mira tu media semanal, no el dato de hoy.",
			};
		}
		if (trendFavorable) {
			return {
				tone: "calm",
				title,
				body: `Tu media semanal sigue a tu favor (${trendText}). Un salto de un día suele ser agua o lo que comiste.`,
			};
		}
		return {
			tone: "calm",
			title,
			body: "Un día suelto dice poco: el agua, la sal o los carbohidratos mueven la báscula. Fíjate en cómo evoluciona tu media esta semana.",
		};
	}

	if (trendFavorable) {
		return {
			tone: "positive",
			title,
			body: `Tu media semanal también va a tu favor (${trendText}). Vas en buena dirección.`,
		};
	}
	return {
		tone: "calm",
		title,
		body: "Buen dato, pero un día no hace tendencia. Si se mantiene unos días, se notará en tu media semanal.",
	};
};
