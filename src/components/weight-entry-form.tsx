import { useState } from "react";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	fromDisplay,
	nowTimeStr,
	toDisplay,
	todayStr,
	type WeightEntry,
	type WeightUnit,
} from "#/lib/weight-utils";

type WeightEntryFormProps = {
	initial?: Pick<
		WeightEntry,
		"id" | "weight" | "date" | "time" | "note"
	> | null;
	unit: WeightUnit;
	onSubmit: (payload: {
		weight: number;
		date: string;
		time?: string;
		note?: string;
	}) => void;
	onCancel: () => void;
	submitLabel?: string;
};

export function WeightEntryForm({
	initial,
	unit,
	onSubmit,
	onCancel,
	submitLabel = "Guardar",
}: WeightEntryFormProps) {
	const [val, setVal] = useState<string>(
		initial ? toDisplay(initial.weight, unit).toFixed(1) : "",
	);
	const [date, setDate] = useState<string>(initial?.date ?? todayStr());
	const [time, setTime] = useState<string>(initial?.time ?? nowTimeStr());
	const [note, setNote] = useState<string>(initial?.note ?? "");

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		const kg = fromDisplay(parseFloat(val), unit);
		if (Number.isNaN(kg) || kg <= 0) return;
		onSubmit({
			weight: kg,
			date,
			time: time || undefined,
			note: note || undefined,
		});
	};

	return (
		<form onSubmit={submit} className="space-y-4">
			<div className="space-y-1.5">
				<Label>Peso ({unit})</Label>
				<Input
					type="text"
					inputMode="decimal"
					value={val}
					onChange={(e) =>
						setVal(e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))
					}
					placeholder="0.0"
					className="h-11"
					autoFocus
				/>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<Label>Fecha</Label>
					<DatePicker
						id="weight-entry-date"
						value={date}
						onChange={(v) => setDate(v ?? "")}
					/>
				</div>
				<div className="space-y-1.5">
					<Label>Hora</Label>
					<Input
						type="time"
						value={time}
						onChange={(e) => setTime(e.target.value)}
						className="h-11"
					/>
				</div>
			</div>
			<div className="space-y-1.5">
				<Label>Nota (opcional)</Label>
				<Input
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder="..."
					className="h-11"
				/>
			</div>
			<div className="flex gap-2 pt-1">
				<Button size="cta"
					type="button"
					variant="outline"
					onClick={onCancel}
					className="flex-1"
				>
					Cancelar
				</Button>
				<Button size="cta" type="submit" className="flex-1">
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}

export default WeightEntryForm;
