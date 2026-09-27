import {
	AltArrowLeftIcon,
	AltArrowRightIcon,
} from "@solar-icons/react/linear";
import {
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameMonth,
	startOfMonth,
	startOfWeek,
	subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import {
	toDisplay,
	type WeightEntry,
	type WeightUnit,
} from "#/lib/weight-utils";

type DayEntry = { weight: number; diff: number };
type DayMap = Record<string, DayEntry>;

type CalendarViewProps = {
	entries: WeightEntry[];
	unit: WeightUnit;
	onDayClick: (date: string, entry: DayEntry | undefined) => void;
};

export function CalendarView({ entries, unit, onDayClick }: CalendarViewProps) {
	const [cursor, setCursor] = useState<Date>(new Date());

	const map: DayMap = useMemo(() => {
		const m: DayMap = {};
		const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
		let prev: number | null = null;
		sorted.forEach((e) => {
			const diff = prev != null ? e.weight - prev : 0;
			m[e.date] = { weight: e.weight, diff };
			prev = e.weight;
		});
		return m;
	}, [entries]);

	const days = useMemo(() => {
		const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
		const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
		return eachDayOfInterval({ start, end });
	}, [cursor]);

	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<button
					type="button"
					onClick={() => setCursor((c) => subMonths(c, 1))}
					className="p-2 rounded-lg pointer-fine-hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					aria-label="Mes anterior"
				>
					<AltArrowLeftIcon className="w-4 h-4" />
				</button>
				<div className="font-display text-sm capitalize">
					{format(cursor, "MMMM yyyy", { locale: es })}
				</div>
				<button
					type="button"
					onClick={() => setCursor((c) => addMonths(c, 1))}
					className="p-2 rounded-lg pointer-fine-hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					aria-label="Mes siguiente"
				>
					<AltArrowRightIcon className="w-4 h-4" />
				</button>
			</div>
			<div className="grid grid-cols-7 gap-1 mb-1">
				{["L", "M", "X", "J", "V", "S", "D"].map((d) => (
					<div
						key={d}
						className="text-center text-[10px] font-medium uppercase text-muted-foreground py-1"
					>
						{d}
					</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-1">
				{days.map((day) => {
					const ds = format(day, "yyyy-MM-dd");
					const entry = map[ds];
					const inMonth = isSameMonth(day, cursor);
					const tone = entry
						? entry.diff < 0
							? "bg-positive/15 text-positive"
							: entry.diff > 0
								? "bg-negative/15 text-negative"
								: "bg-primary/10 text-primary"
						: "";
					return (
						<button
							type="button"
							key={ds}
							onClick={() => onDayClick(ds, entry)}
							aria-label={`${format(day, "PPP", { locale: es })}${
								entry ? ", peso registrado" : ""
							}`}
							className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-colors ${
								inMonth ? "" : "opacity-30"
							} ${entry ? tone : inMonth ? "pointer-fine-hover:bg-muted text-muted-foreground" : ""}`}
						>
							<span className="text-[11px]">{format(day, "d")}</span>
							{entry && (
								<span className="font-display text-[10px] leading-none mt-0.5">
									{toDisplay(entry.weight, unit).toFixed(0)}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default CalendarView;
