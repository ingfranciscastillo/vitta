import {
	MagnifierIcon,
	PenIcon,
	ScaleIcon,
	SortIcon,
	TrashBinTrashIcon,
} from "@solar-icons/react/linear";
import { useMemo, useState } from "react";
import { EmptyState } from "#/components/empty-state";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Input } from "#/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import {
	formatDate,
	formatDelta,
	toDisplay,
	type WeightEntry,
	type WeightUnit,
} from "#/lib/weight-utils";

type Row = WeightEntry & { diff: number };
type SortKey = "date" | "weight";
type SortState = { key: SortKey; dir: "asc" | "desc" };

type HistoryTableProps = {
	entries: WeightEntry[];
	unit: WeightUnit;
	onEdit: (entry: WeightEntry) => void;
	onDelete: (entry: WeightEntry) => void;
	onCreateFirst?: () => void;
};

export function HistoryTable({
	entries,
	unit,
	onEdit,
	onDelete,
	onCreateFirst,
}: HistoryTableProps) {
	const [query, setQuery] = useState<string>("");
	const [from, setFrom] = useState<string>("");
	const [to, setTo] = useState<string>("");
	const [sort, setSort] = useState<SortState>({ key: "date", dir: "desc" });

	const rows = useMemo<Row[]>(() => {
		let r = [...entries];
		if (from) r = r.filter((e) => e.date >= from);
		if (to) r = r.filter((e) => e.date <= to);
		if (query)
			r = r.filter((e) =>
				(e.note ?? "").toLowerCase().includes(query.toLowerCase()),
			);
		const sortedAsc = [...r].sort((a, b) =>
			(a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")),
		);
		const withDiff: Row[] = sortedAsc.map((e, i) => ({
			...e,
			diff: i > 0 ? e.weight - sortedAsc[i - 1].weight : 0,
		}));
		withDiff.reverse();
		if (sort.key === "weight")
			withDiff.sort((a, b) =>
				sort.dir === "asc" ? a.weight - b.weight : b.weight - a.weight,
			);
		if (sort.key === "date" && sort.dir === "asc") withDiff.reverse();
		return withDiff;
	}, [entries, query, from, to, sort]);

	const toggle = (key: SortKey): void =>
		setSort((s) =>
			s.key === key
				? { key, dir: s.dir === "asc" ? "desc" : "asc" }
				: { key, dir: "desc" },
		);

	return (
		<div>
			<div className="flex flex-col sm:flex-row gap-2 mb-3">
				<div className="relative flex-1">
					<MagnifierIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar nota..."
						className="pl-9"
					/>
				</div>
				<DatePicker
					id="history-from"
					value={from}
					onChange={(v) => setFrom(v ?? "")}
					className="sm:w-36"
				/>
				<DatePicker
					id="history-to"
					value={to}
					onChange={(v) => setTo(v ?? "")}
					className="sm:w-36"
				/>
			</div>
			<div className="rounded-2xl border border-border overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead
								aria-sort={
									sort.key === "date"
										? sort.dir === "asc"
											? "ascending"
											: "descending"
										: "none"
								}
							>
								<button
									type="button"
									className="flex items-center gap-1"
									aria-label="Ordenar por fecha"
									onClick={() => toggle("date")}
								>
									Fecha <SortIcon className="w-3 h-3" />
								</button>
							</TableHead>
							<TableHead
								aria-sort={
									sort.key === "weight"
										? sort.dir === "asc"
											? "ascending"
											: "descending"
										: "none"
								}
							>
								<button
									type="button"
									className="flex items-center gap-1"
									aria-label="Ordenar por peso"
									onClick={() => toggle("weight")}
								>
									Peso <SortIcon className="w-3 h-3" />
								</button>
							</TableHead>
							<TableHead className="hidden sm:table-cell">Cambio</TableHead>
							<TableHead className="hidden sm:table-cell">Nota</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.length === 0 && (
							<TableRow>
								<TableCell colSpan={5} className="p-0">
									<EmptyState
										icon={<ScaleIcon className="size-6" />}
										title="Sin registros"
										description="Añade tu primer peso para empezar tu historial."
										action={
											onCreateFirst
												? { label: "Añadir peso", onClick: onCreateFirst }
												: undefined
										}
									/>
								</TableCell>
							</TableRow>
						)}
						{rows.map((r) => (
							<TableRow key={r.id}>
								<TableCell className="font-medium">
									{formatDate(r.date)}
									{r.time && (
										<span className="block text-[10px] text-muted-foreground">
											{r.time}
										</span>
									)}
								</TableCell>
								<TableCell className="font-display">
									{toDisplay(r.weight, unit).toFixed(1)}{" "}
									<span className="text-muted-foreground text-xs">{unit}</span>
								</TableCell>
								<TableCell className="hidden sm:table-cell">
									<span
										className={
											r.diff < 0
												? "text-positive"
												: r.diff > 0
													? "text-negative"
													: "text-muted-foreground"
										}
									>
										{r.diff !== 0 ? formatDelta(r.diff, unit) : "—"}
									</span>
								</TableCell>
								<TableCell className="hidden sm:table-cell max-w-[160px] truncate text-muted-foreground">
									{r.note || "—"}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onEdit(r)}
											aria-label="Editar"
										>
											<PenIcon className="w-4 h-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onDelete(r)}
											aria-label="Eliminar"
										>
											<TrashBinTrashIcon className="w-4 h-4 text-destructive" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export default HistoryTable;
