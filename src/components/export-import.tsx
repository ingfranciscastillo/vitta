import { CrownMinimalisticIcon } from "@solar-icons/react/linear";
import { ExportIcon } from "@solar-icons/react/linear/export";
import { ImportIcon } from "@solar-icons/react/linear/import";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { PaywallDialog } from "#/components/paywall-dialog";
import { Button } from "#/components/ui/button";
import type { WeightEntry } from "#/lib/weight-utils";

type ImportableEntry = Pick<WeightEntry, "date" | "time" | "weight" | "note">;

type ExportImportProps = {
	entries: WeightEntry[];
	onImport: (entries: ImportableEntry[]) => void;
	// Exportar es Premium; importar está disponible para todos.
	canExport: boolean;
};

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
}: ExportImportProps) {
	const fileRef = useRef<HTMLInputElement>(null);
	const [paywallOpen, setPaywallOpen] = useState(false);
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
				(e.note ?? "").replace(/"/g, '""'),
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
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			try {
				const parsed = JSON.parse(String(reader.result));
				if (Array.isArray(parsed)) {
					onImport(parsed as ImportableEntry[]);
				} else {
					toast.error("Archivo inválido");
				}
			} catch {
				toast.error("Archivo inválido");
			}
		};
		reader.readAsText(file);
		e.target.value = "";
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
				accept=".json"
				className="hidden"
				onChange={handleFile}
			/>
			<PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
		</div>
	);
}

export default ExportImport;
