import { AddIcon } from "@solar-icons/react/linear/add";
import { MinusIcon } from "@solar-icons/react/linear/minus";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "#/components/ui/drawer";
import { Input } from "#/components/ui/input";

type HabitType = "water" | "steps" | "sleep";

type HabitConfig = {
	label: string;
	unit: string;
	step: number;
};

const CONFIG: Record<HabitType, HabitConfig> = {
	water: { label: "Agua", unit: "ml", step: 250 },
	steps: { label: "Pasos", unit: "", step: 500 },
	sleep: { label: "Sueño", unit: "h", step: 0.5 },
};

type HabitLogDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	type: HabitType;
	currentToday: number;
	onSave: (type: HabitType, value: number) => void;
};

export function HabitLogDialog({
	open,
	onOpenChange,
	type,
	currentToday,
	onSave,
}: HabitLogDialogProps) {
	const cfg = CONFIG[type] ?? CONFIG.water;
	const { label, unit, step } = cfg;
	const [val, setVal] = useState<string>(String(step));

	const stepVal = (delta: number) => {
		const n = parseFloat(val || "0") || 0;
		const next = Math.max(0, n + delta);
		setVal(step < 1 ? next.toFixed(1) : String(Math.round(next)));
	};

	const handleSave = () => {
		const n = parseFloat(val) || 0;
		if (n <= 0) return;
		onSave(type, n);
		onOpenChange(false);
	};

	const displayCurrent = (v: number) =>
		step < 1 ? v.toFixed(1) : Math.round(v).toLocaleString();

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent
				key={`${open ? "open" : "closed"}-${type}`}
				className="rounded-t-3xl max-w-md mx-auto"
			>
				<DrawerHeader className="text-center pb-0">
					<DrawerTitle className="font-display text-lg">
						Añadir {label.toLowerCase()}
					</DrawerTitle>
				</DrawerHeader>

				<div className="px-4 pt-2 space-y-2">
					<div className="text-center text-xs text-muted-foreground">
						Hoy: {displayCurrent(currentToday)} {unit}
					</div>

					<div className="flex items-center justify-center gap-3 py-2">
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Restar"
							className="rounded-full size-12 shrink-0"
							onClick={() => stepVal(-step)}
						>
							<MinusIcon size={20} className="size-5" />
						</Button>
						<div className="flex items-baseline">
							<Input
								type="text"
								inputMode="decimal"
								value={val}
								onChange={(e) =>
									setVal(
										e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."),
									)
								}
								className="font-display text-4xl text-center tabular-nums border-0 bg-transparent focus-visible:ring-0 w-32 px-0 h-14"
								placeholder={String(step)}
							/>
							{unit && (
								<span className="font-display text-lg text-muted-foreground ml-1">
									{unit}
								</span>
							)}
						</div>
						<Button
							type="button"
							variant="outline"
							size="icon"
							aria-label="Sumar"
							className="rounded-full h-12 w-12 shrink-0"
							onClick={() => stepVal(step)}
						>
							<AddIcon size={20} className="size-5" />
						</Button>
					</div>
				</div>

				<DrawerFooter className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
					<Button
						type="button"
						onClick={handleSave}
						className="w-full h-12 rounded-xl font-display text-sm"
					>
						Guardar
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default HabitLogDialog;
