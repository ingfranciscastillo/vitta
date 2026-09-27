import { AddIcon } from "@solar-icons/react/linear/add";
import { MinusIcon } from "@solar-icons/react/linear/minus";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";

// Número grande con botones − y +. Usado en el onboarding y en las
// calculadoras públicas.
export function NumberStepper({
	value,
	onChange,
	step,
	unit,
	label,
	decimals = 1,
	base,
	autoFocus = false,
	size = "lg",
}: {
	value: string;
	onChange: (v: string) => void;
	step: number;
	unit: string;
	label: string;
	decimals?: number;
	// Valor desde el que empiezan los botones si el campo está vacío.
	base: number;
	autoFocus?: boolean;
	size?: "lg" | "md";
}) {
	const bump = (delta: number) => {
		const n = parseFloat(value) || base;
		onChange(Math.max(0, n + delta).toFixed(decimals));
	};
	const buttonClass = cn(
		"shrink-0 rounded-full",
		size === "lg" ? "size-12" : "size-11",
	);
	return (
		<div className="flex items-center justify-center gap-4">
			<Button
				type="button"
				variant="outline"
				size="icon"
				aria-label={`Restar ${step} ${unit}`}
				className={buttonClass}
				onClick={() => bump(-step)}
			>
				<MinusIcon size={20} />
			</Button>
			<div className="flex items-baseline gap-1.5">
				<Input
					type="text"
					inputMode="decimal"
					aria-label={label}
					placeholder={base.toFixed(decimals)}
					autoFocus={autoFocus}
					value={value}
					onChange={(e) =>
						onChange(e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."))
					}
					className={cn(
						"border-0 bg-transparent px-0 text-center font-display tabular-nums shadow-none focus-visible:ring-0 dark:bg-transparent",
						size === "lg"
							? "h-16 w-32 text-5xl md:text-5xl"
							: "h-14 w-28 text-4xl md:text-4xl",
					)}
				/>
				<span className="font-display text-lg text-muted-foreground">
					{unit}
				</span>
			</div>
			<Button
				type="button"
				variant="outline"
				size="icon"
				aria-label={`Sumar ${step} ${unit}`}
				className={buttonClass}
				onClick={() => bump(step)}
			>
				<AddIcon size={20} />
			</Button>
		</div>
	);
}

export default NumberStepper;
