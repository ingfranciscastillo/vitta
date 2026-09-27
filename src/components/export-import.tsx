import { CrownMinimalisticIcon } from "@solar-icons/react/linear";
import { ExportIcon } from "@solar-icons/react/linear/export";
import { ImportIcon } from "@solar-icons/react/linear/import";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { PaywallDialog } from "#/components/paywall-dialog";
import { Segmented } from "#/components/tools/segmented";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	MAX_IMPORT_ROWS,
	type ParsedImport,
	parseWeightFile,
} from "#/lib/weight-import";
import {
	formatDate,
	fromDisplay,
	GOAL_WEIGHT_MAX_KG,
	GOAL_WEIGHT_MIN_KG,
	type WeightEntry,
	type WeightUnit,
} from "#/lib/weight-utils";

type ImportableEntry = Pick<WeightEntry, "date" | "time" | "weight" | "note">;

type ExportImportProps = {
	entries: WeightEntry[];
	// Recibe los registros ya convertidos a kg.
	onImport: (entries: ImportableEntry[]) => void;
	// Exportar es Premium; importar está disponible para todos.
	canExport: boolean;
	// Unidad del usuario, usada si el archivo no indica la suya.
	defaultUnit: WeightUnit;
};

const UNIT_OPTIONS: ReadonlyArray<{ id: WeightUnit; label: string }> = [
	{ id: "kg", label: "Kilogramos" },
	{ id: "lb", label: "Libras" },
];

const SOURCE_LABEL: Record<ParsedImport["source"], string> = {
	vitta: "Exportación de Vitta",
	libra: "Exportación de Libra",
	csv: "Archivo CSV",
};

// Evita que una nota se interprete como fórmula al abrir el CSV en una hoja
// de cálculo.
const safeCell = (v: string) => (/^[=+\-@]/.test(v) ? `'${v}` : v);

function download(name: string, content: string, type: string): void {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = name;
	a.click();
	URL.revokeObjectURL(url);
}

export function ExportImport({
	entries,
	onImport,
	canExport,
	defaultUnit,
}: ExportImportProps) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [paywallOpen, setPaywallOpen] = useState(false);
	const [preview, setPreview] = useState<ParsedImport | null>(null);
	const [unit, setUnit] = useState<WeightUnit>(defaultUnit);
	const ExportGlyph = canExport ? ExportIcon : CrownMinimalisticIcon;
	const guard = (fn: () => void) => () =>
		canExport ? fn() : setPaywallOpen(true);

	const exportCSV = (): void => {
		const rows: (string | number)[][] = [["date", "time", "weight_kg", "note"]];
		entries.forEach((e) =>
			rows.push([
				e.date,
				e.time ?? "",
				e.weight,
				safeCell(e.note ?? "").replace(/"/g, '""'),
			]),
		);
		const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
		download("vitta.csv", csv, "text/csv");
	};

	const exportJSON = (): void => {
		const data = entries.map((e) => ({
			date: e.date,
			time: e.time ?? null,
			weight: e.weight,
			note: e.note ?? null,
		}));
		download("vitta.json", JSON.stringify(data, null, 2), "application/json");
	};

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			toast.error("El archivo es demasiado grande (máximo 5 MB)");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const parsed = parseWeightFile(String(reader.result));
				if (parsed.rows.length === 0) {
					toast.error(
						"No encontramos registros. El archivo necesita una columna de fecha y otra de peso.",
					);
					return;
				}
				if (parsed.rows.length > MAX_IMPORT_ROWS) {
					toast.error(
						`Como máximo se importan ${MAX_IMPORT_ROWS} registros a la vez`,
					);
					return;
				}
				setUnit(parsed.unit ?? defaultUnit);
				setPreview(parsed);
			} catch {
				toast.error("No pudimos leer el archivo");
			}
		};
		reader.readAsText(file);
	};

	// Convierte a kg y descarta pesos fuera de rango antes de enviar.
	const toImport = (preview?.rows ?? [])
		.map((r) => ({ ...r, weight: fromDisplay(r.weight, unit) }))
		.filter(
			(r) => r.weight >= GOAL_WEIGHT_MIN_KG && r.weight <= GOAL_WEIGHT_MAX_KG,
		);
	const outOfRange = (preview?.rows.length ?? 0) - toImport.length;
	const sortedDates = toImport.map((r) => r.date).sort();

	const confirmImport = () => {
		onImport(
			toImport.map((r) => ({
				date: r.date,
				time: r.time,
				weight: Math.round(r.weight * 100) / 100,
				note: r.note,
			})),
		);
		setPreview(null);
	};

	return (
		<div className="grid grid-cols-3 gap-2">
			<Button
				variant="outline"
				onClick={guard(exportCSV)}
				className="font-display w-full text-xs"
			>
				<ExportGlyph className="w-4 h-4 mr-1.5" /> CSV
			</Button>
			<Button
				variant="outline"
				onClick={guard(exportJSON)}
				className="font-display w-full text-xs"
			>
				<ExportGlyph className="w-4 h-4 mr-1.5" /> JSON
			</Button>
			<Button
				variant="outline"
				onClick={() => fileRef.current?.click()}
				className="font-display w-full text-xs"
			>
				<ImportIcon className="w-4 h-4 mr-1.5" /> Importar
			</Button>
			<input
				ref={fileRef}
				type="file"
				accept=".csv,.json,text/csv,application/json"
				className="hidden"
				onChange={handleFile}
			/>
			<PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
			<Dialog
				open={preview !== null}
				onOpenChange={(o) => !o && setPreview(null)}
			>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>Importar registros</DialogTitle>
						<DialogDescription>
							{preview ? SOURCE_LABEL[preview.source] : ""}. Revisa los datos
							antes de guardarlos.
						</DialogDescription>
					</DialogHeader>
					{preview && (
						<div className="space-y-4 text-sm">
							<p>
								<span className="font-display tabular-nums">
									{toImport.length}
								</span>{" "}
								registros
								{sortedDates.length > 0 && (
									<>
										{" "}
										del {formatDate(sortedDates[0])} al{" "}
										{formatDate(sortedDates[sortedDates.length - 1])}
									</>
								)}
								.
							</p>
							<div className="space-y-2">
								<p className="text-muted-foreground">
									{preview.unit
										? "Unidad detectada en el archivo:"
										: "El archivo no indica la unidad. ¿En qué unidad están los pesos?"}
								</p>
								<Segmented
									label="Unidad del archivo"
									options={UNIT_OPTIONS}
									value={unit}
									onChange={setUnit}
								/>
							</div>
							{(preview.skipped > 0 || outOfRange > 0) && (
								<p className="text-muted-foreground">
									Se omitirán {preview.skipped + outOfRange} filas sin fecha o
									peso válidos.
								</p>
							)}
							<p className="text-muted-foreground">
								Los registros que ya tengas no se duplican.
							</p>
						</div>
					)}
					<DialogFooter>
						<Button
							size="cta"
							variant="outline"
							onClick={() => setPreview(null)}
						>
							Cancelar
						</Button>
						<Button
							size="cta"
							onClick={confirmImport}
							disabled={toImport.length === 0}
						>
							Importar {toImport.length}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default ExportImport;
