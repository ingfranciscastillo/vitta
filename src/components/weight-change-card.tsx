import { CheckIcon } from "@solar-icons/react/linear/check";
import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { InfoCircleIcon } from "@solar-icons/react/linear/info-circle";
import { Link } from "@tanstack/react-router";
import { cn } from "#/lib/utils";
import type {
	WeightChangeExplanation,
	WeightChangeTone,
} from "#/lib/weight-change";

const TONE: Record<
	WeightChangeTone,
	{ Icon: typeof InfoCircleIcon; className: string }
> = {
	calm: { Icon: InfoCircleIcon, className: "bg-primary/10 text-primary" },
	positive: { Icon: CheckIcon, className: "bg-positive/10 text-positive" },
	attention: {
		Icon: DangerTriangleIcon,
		className: "bg-warning/10 text-warning",
	},
};

// Explica el último cambio de peso en lenguaje llano, con enlace a la guía
// que cita las fuentes.
export function WeightChangeCard({
	explanation,
}: {
	explanation: WeightChangeExplanation;
}) {
	const { Icon, className } = TONE[explanation.tone];
	return (
		<section
			aria-live="polite"
			className="flex gap-3 rounded-2xl border border-border bg-card p-4"
		>
			<span
				aria-hidden="true"
				className={cn(
					"flex size-9 shrink-0 items-center justify-center rounded-full",
					className,
				)}
			>
				<Icon size={18} />
			</span>
			<div className="min-w-0">
				<h2 className="font-display text-sm">{explanation.title}</h2>
				<p className="mt-1 text-sm text-muted-foreground text-pretty">
					{explanation.body}
				</p>
				<Link
					to="/guias/$slug"
					params={{ slug: "por-que-tu-peso-cambia-cada-dia" }}
					className="mt-2 inline-block text-xs text-primary underline-offset-4 pointer-fine-hover:underline"
				>
					Por qué pasa esto
				</Link>
			</div>
		</section>
	);
}

export default WeightChangeCard;
