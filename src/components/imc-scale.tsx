import type { ImcTone } from "#/lib/weight-utils";

// Rangos de IMC de la OMS sobre una escala de 15 a 35.
const IMC_RANGES = [
	{ label: "Bajo", from: 15, to: 18.5, className: "bg-primary/40" },
	{ label: "Normal", from: 18.5, to: 25, className: "bg-positive" },
	{ label: "Sobrepeso", from: 25, to: 30, className: "bg-warning" },
	{ label: "Obesidad", from: 30, to: 35, className: "bg-negative" },
] as const;

const SCALE = { min: 15, max: 35 } as const;
const pct = (v: number) => ((v - SCALE.min) / (SCALE.max - SCALE.min)) * 100;
const clamp = (v: number) => Math.min(SCALE.max, Math.max(SCALE.min, v));

export const IMC_TONE_TEXT: Record<ImcTone, string> = {
	blue: "text-primary",
	green: "text-positive",
	amber: "text-warning",
	red: "text-negative",
};

// Barra de colores con un marcador en el IMC dado.
export function ImcScale({ imc }: { imc: number }) {
	return (
		<div aria-hidden="true">
			<div className="relative">
				<div className="flex h-2 overflow-hidden rounded-full">
					{IMC_RANGES.map((r) => (
						<span
							key={r.label}
							className={r.className}
							style={{ width: `${pct(r.to) - pct(r.from)}%` }}
						/>
					))}
				</div>
				<span
					className="absolute -top-1.5 h-5 w-1 -translate-x-1/2 rounded-full bg-foreground ring-2 ring-card transition-[left] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
					style={{ left: `${pct(clamp(imc))}%` }}
				/>
			</div>
			<div className="mt-2 flex text-[11px] text-muted-foreground">
				{IMC_RANGES.map((r) => (
					<span
						key={r.label}
						className="truncate pr-1"
						style={{ width: `${pct(r.to) - pct(r.from)}%` }}
					>
						{r.label}
					</span>
				))}
			</div>
		</div>
	);
}

export default ImcScale;
