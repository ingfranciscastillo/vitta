import { AddIcon } from "@solar-icons/react/linear/add";
import { MinusIcon } from "@solar-icons/react/linear/minus";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";

type GoalStepperProps = {
	label: string;
	unit?: string;
	value: string;
	onChange: (v: string) => void;
	step: number;
	decimals?: number;
};

export function GoalStepper({
	label,
	unit,
	value,
	onChange,
	step,
	decimals = 0,
}: GoalStepperProps) {
	const stepVal = (delta: number) => {
		const n = parseFloat(value || "0") || 0;
		const next = Math.max(0, n + delta);
		onChange(decimals > 0 ? next.toFixed(decimals) : String(Math.round(next)));
	};

	return (
		<div className="flex items-center justify-between gap-3 py-1">
			<div className="text-xs text-muted-foreground shrink-0">
				{label}
				{unit && <span className="ml-1 opacity-60">{unit}</span>}
			</div>
			<div className="flex items-center gap-1.5">
				<Button
					type="button"
					variant="outline"
					size="icon"
					aria-label="Restar"
					className="rounded-full size-7 shrink-0 pointer-fine-hover:bg-primary/10 pointer-fine-hover:text-primary transition-colors duration-100 ease-out"
					onClick={() => stepVal(-step)}
				>
					<MinusIcon size={16} className="size-4" />
				</Button>
				<div className="flex items-baseline justify-center w-20">
					<Input
						type="text"
						inputMode="decimal"
						value={value}
						onChange={(e) =>
							onChange(
								e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."),
							)
						}
						className="font-display text-lg text-center tabular-nums border-0 bg-transparent focus-visible:ring-0 px-0 h-9 w-16"
					/>
				</div>
				<Button
					type="button"
					variant="outline"
					size="icon"
					aria-label="Sumar"
					className="rounded-full h-7 w-7 shrink-0 pointer-fine-hover:bg-primary/10 pointer-fine-hover:text-primary transition-colors duration-100 ease-out"
					onClick={() => stepVal(step)}
				>
					<AddIcon size={16} className="size-4" />
				</Button>
			</div>
		</div>
	);
}

export default GoalStepper;
