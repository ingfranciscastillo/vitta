import { dateStr, type WeightUnit } from "#/lib/weight-utils";

// Lee exportaciones de peso de Vitta (JSON/CSV), Libra (CSV documentado)
// y cualquier CSV con columnas reconocibles de fecha y peso.

export type ImportRow = {
	date: string; // AAAA-MM-DD, en la hora local del usuario
	time: string | null; // HH:MM
	weight: number; // en la unidad del archivo (ver `unit`)
	note: string | null;
};

export type ParsedImport = {
	source: "vitta" | "libra" | "csv";
	rows: ImportRow[];
	// Unidad detectada en el archivo; null si no se puede saber.
	unit: WeightUnit | null;
	skipped: number;
};

export const MAX_IMPORT_ROWS = 5000;

const pad = (n: number) => String(n).padStart(2, "0");

// Divide una línea CSV respetando comillas.
const splitCsvLine = (line: string, delimiter: string): string[] => {
	const out: string[] = [];
	let cur = "";
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (quoted) {
			if (ch === '"' && line[i + 1] === '"') {
				cur += '"';
				i++;
			} else if (ch === '"') {
				quoted = false;
			} else {
				cur += ch;
			}
		} else if (ch === '"') {
			quoted = true;
		} else if (ch === delimiter) {
			out.push(cur.trim());
			cur = "";
		} else {
			cur += ch;
		}
	}
	out.push(cur.trim());
	return out;
};

const detectDelimiter = (header: string): string => {
	const counts = [";", ",", "\t"].map((d) => ({
		d,
		n: header.split(d).length - 1,
	}));
	counts.sort((a, b) => b.n - a.n);
	return counts[0].n > 0 ? counts[0].d : ",";
};

const unitFromText = (text: string): WeightUnit | null => {
	const t = text.toLowerCase();
	if (/\b(lb|lbs|libras?|pounds?)\b/.test(t) || t.includes("_lb")) return "lb";
	if (/\b(kg|kgs|kilos?|kilogramos?)\b/.test(t) || t.includes("_kg"))
		return "kg";
	return null;
};

// Números con coma o punto decimal ("70,5" o "70.5").
const parseNumber = (raw: string): number => {
	const cleaned = raw.replace(/[^\d.,-]/g, "");
	if (cleaned.includes(",") && !cleaned.includes(".")) {
		return Number(cleaned.replace(",", "."));
	}
	return Number(cleaned.replace(/,/g, ""));
};

type DateOrder = "dmy" | "mdy";

// Si ninguna fila lo aclara (todos los valores ≤ 12), se asume día/mes,
// el orden habitual en español.
const detectDateOrder = (values: string[]): DateOrder => {
	for (const v of values) {
		const m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
		if (!m) continue;
		if (Number(m[1]) > 12) return "dmy";
		if (Number(m[2]) > 12) return "mdy";
	}
	return "dmy";
};

const parseDate = (
	raw: string,
	order: DateOrder,
): { date: string; time: string | null } | null => {
	const v = raw.trim();
	// ISO con zona horaria (p. ej. Libra, en UTC): se pasa a hora local.
	if (/^\d{4}-\d{2}-\d{2}T.*(Z|[+-]\d{2}:?\d{2})$/.test(v)) {
		const d = new Date(v);
		if (Number.isNaN(d.getTime())) return null;
		return {
			date: dateStr(d),
			time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
		};
	}
	let m = v.match(
		/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2}))?/,
	);
	if (m) {
		const [, y, mo, d, h, mi] = m;
		return build(Number(y), Number(mo), Number(d), h, mi);
	}
	m = v.match(
		/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[T\s,]+(\d{1,2}):(\d{2}))?/,
	);
	if (m) {
		const [, a, b, y, h, mi] = m;
		const [d, mo] = order === "dmy" ? [a, b] : [b, a];
		return build(Number(y), Number(mo), Number(d), h, mi);
	}
	return null;
};

const build = (
	y: number,
	mo: number,
	d: number,
	h?: string,
	mi?: string,
): { date: string; time: string | null } | null => {
	const probe = new Date(y, mo - 1, d);
	if (
		probe.getFullYear() !== y ||
		probe.getMonth() !== mo - 1 ||
		probe.getDate() !== d
	) {
		return null;
	}
	return {
		date: `${y}-${pad(mo)}-${pad(d)}`,
		time: h != null && mi != null ? `${pad(Number(h))}:${mi}` : null,
	};
};

const findColumn = (headers: string[], include: RegExp, exclude?: RegExp) =>
	headers.findIndex((h) => include.test(h) && !exclude?.test(h));

const parseCsv = (text: string): ParsedImport => {
	const lines = text
		.replace(/^﻿/, "")
		.split(/\r?\n/)
		.filter((l) => l.trim() !== "");

	// Libra: metadatos "#Units: kg" y cabecera "#date;weight;...".
	let unit: WeightUnit | null = null;
	let libra = false;
	let headerIndex = -1;
	for (let i = 0; i < lines.length; i++) {
		const l = lines[i].trim();
		const units = l.match(/^#\s*units\s*:\s*(\w+)/i);
		if (units) {
			unit = unitFromText(units[1]);
			libra = true;
			continue;
		}
		if (/^#\s*version/i.test(l)) {
			libra = true;
			continue;
		}
		headerIndex = i;
		break;
	}
	if (headerIndex < 0) return { source: "csv", rows: [], unit, skipped: 0 };

	const headerLine = lines[headerIndex].replace(/^#/, "");
	const delimiter = detectDelimiter(headerLine);
	const headers = splitCsvLine(headerLine, delimiter).map((h) =>
		h.toLowerCase(),
	);

	const dateCol = findColumn(headers, /(date|fecha|timestamp|día|dia)/);
	const timeCol = findColumn(headers, /^(time|hora)$/);
	const weightCol = findColumn(
		headers,
		/(weight|peso|masa)/,
		/(trend|tendencia|goal|meta|objetivo|fat|grasa|muscle|m[uú]sculo)/,
	);
	const noteCol = findColumn(headers, /(note|nota|log|comment|comentario)/);
	if (dateCol < 0 || weightCol < 0) {
		return { source: "csv", rows: [], unit, skipped: lines.length - 1 };
	}
	unit = unit ?? unitFromText(headers[weightCol]);
	const vitta = headers.includes("weight_kg");

	const dataLines = lines.slice(headerIndex + 1);
	const cells = dataLines.map((l) => splitCsvLine(l, delimiter));
	const order = detectDateOrder(cells.map((c) => c[dateCol] ?? ""));

	const rows: ImportRow[] = [];
	let skipped = 0;
	for (const c of cells) {
		const parsedDate = parseDate(c[dateCol] ?? "", order);
		const weight = parseNumber(c[weightCol] ?? "");
		if (!parsedDate || !Number.isFinite(weight) || weight <= 0) {
			skipped++;
			continue;
		}
		const rawTime = timeCol >= 0 ? (c[timeCol] ?? "") : "";
		const time = /^\d{1,2}:\d{2}/.test(rawTime)
			? `${pad(Number(rawTime.split(":")[0]))}:${rawTime.split(":")[1].slice(0, 2)}`
			: parsedDate.time;
		const note = noteCol >= 0 ? (c[noteCol] ?? "").trim() : "";
		rows.push({
			date: parsedDate.date,
			time,
			weight,
			note: note ? note.slice(0, 500) : null,
		});
	}
	return {
		source: vitta ? "vitta" : libra ? "libra" : "csv",
		rows,
		unit: vitta ? "kg" : unit,
		skipped,
	};
};

// Exportación JSON de Vitta: [{ date, time, weight, note }] en kg.
const parseJson = (text: string): ParsedImport => {
	const data: unknown = JSON.parse(text);
	if (!Array.isArray(data)) throw new Error("not-array");
	const rows: ImportRow[] = [];
	let skipped = 0;
	for (const item of data) {
		const e = item as Record<string, unknown>;
		const parsed = typeof e.date === "string" ? parseDate(e.date, "dmy") : null;
		const weight = typeof e.weight === "number" ? e.weight : Number(e.weight);
		if (!parsed || !Number.isFinite(weight) || weight <= 0) {
			skipped++;
			continue;
		}
		rows.push({
			date: parsed.date,
			time:
				typeof e.time === "string" && /^\d{2}:\d{2}/.test(e.time)
					? e.time.slice(0, 5)
					: parsed.time,
			weight,
			note: typeof e.note === "string" && e.note ? e.note.slice(0, 500) : null,
		});
	}
	return { source: "vitta", rows, unit: "kg", skipped };
};

export const parseWeightFile = (text: string): ParsedImport => {
	const trimmed = text.trimStart();
	return trimmed.startsWith("[") ? parseJson(trimmed) : parseCsv(text);
};
