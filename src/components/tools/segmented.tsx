import { cn } from "#/lib/utils";

// Selector de opciones exclusivas (unidades, ritmo) para las calculadoras.
export function Segmented<T extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: ReadonlyArray<{ id: T; label: string }>;
	value: T;
	onChange: (v: T) => void;
}) {
	return (
		<fieldset className="flex min-w-0 gap-1.5">
			<legend className="sr-only">{label}</legend>
			{options.map((o) => {
				const active = o.id === value;
				return (
					<button
						key={o.id}
						type="button"
						aria-pressed={active}
						onClick={() => onChange(o.id)}
						className={cn(
							"min-h-11 flex-1 rounded-full px-3 text-sm font-display transition-colors duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							active
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground pointer-fine-hover:text-foreground",
						)}
					>
						{o.label}
					</button>
				);
			})}
		</fieldset>
	);
}

export default Segmented;
