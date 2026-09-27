// Horarios de los recordatorios. Módulo puro (sin base de datos ni red):
// lo usan el perfil en el navegador y el cron en el servidor.

// Días de la semana en orden de lunes a domingo; `bit` sigue a Date.getDay()
// (domingo = 0), que es como se guardan en la máscara `days`.
export const WEEK_DAYS = [
	{ bit: 1, short: "L", label: "Lunes" },
	{ bit: 2, short: "M", label: "Martes" },
	{ bit: 3, short: "X", label: "Miércoles" },
	{ bit: 4, short: "J", label: "Jueves" },
	{ bit: 5, short: "V", label: "Viernes" },
	{ bit: 6, short: "S", label: "Sábado" },
	{ bit: 0, short: "D", label: "Domingo" },
] as const;

export const ALL_DAYS = 0b1111111;
export const DEFAULT_REMINDER_TIME = "08:00";

export const hasDay = (days: number, bit: number): boolean =>
	(days & (1 << bit)) !== 0;

export const toggleDay = (days: number, bit: number): number =>
	days ^ (1 << bit);

// Margen tras la hora elegida en el que todavía se envía el aviso. Cubre
// retrasos del cron sin mandar a medianoche un recordatorio de las 8:00
// (por ejemplo, si alguien lo activa tarde).
const SEND_WINDOW_MINUTES = 120;

const WEEKDAY_INDEX: Record<string, number> = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6,
};

type LocalClock = { date: string; minutes: number; weekday: number };

export function localClock(now: Date, timeZone: string): LocalClock {
	let parts: Intl.DateTimeFormatPart[];
	try {
		parts = new Intl.DateTimeFormat("en-US", {
			timeZone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			weekday: "short",
			hourCycle: "h23",
		}).formatToParts(now);
	} catch {
		// Zona horaria inválida: mejor tarde que nunca.
		return localClock(now, "UTC");
	}
	const get = (type: Intl.DateTimeFormatPartTypes) =>
		parts.find((p) => p.type === type)?.value ?? "";
	return {
		date: `${get("year")}-${get("month")}-${get("day")}`,
		minutes: Number(get("hour")) * 60 + Number(get("minute")),
		weekday: WEEKDAY_INDEX[get("weekday")] ?? 0,
	};
}

const toMinutes = (time: string): number => {
	const [h, m] = time.split(":").map(Number);
	return h * 60 + m;
};

export function isDue(
	r: { time: string; days: number; lastSentOn: string | null },
	clock: LocalClock,
): boolean {
	if (!hasDay(r.days, clock.weekday)) return false;
	if (r.lastSentOn === clock.date) return false;
	const start = toMinutes(r.time);
	return clock.minutes >= start && clock.minutes < start + SEND_WINDOW_MINUTES;
}
