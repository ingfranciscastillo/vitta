import {
	CalendarIcon,
	GraphDownIcon,
	GraphUpIcon,
	StarIcon,
	TargetIcon,
} from "@solar-icons/react/linear";
import type { ComponentType, SVGProps } from "react";

type SolarIcon = ComponentType<SVGProps<SVGSVGElement>>;

type InsightsListProps = {
	insights: string[];
};

function pickIcon(text: string): SolarIcon {
	const lower = text.toLowerCase();
	if (lower.includes("baj") || lower.includes("descend")) return GraphDownIcon;
	if (lower.includes("sub") || lower.includes("ascend")) return GraphUpIcon;
	if (lower.includes("objetivo")) return TargetIcon;
	if (lower.includes("días") || lower.includes("dias")) return CalendarIcon;
	return StarIcon;
}

export function InsightsList({ insights }: InsightsListProps) {
	return (
		<div className="space-y-2">
			{insights.map((t) => {
				const Icon = pickIcon(t);
				return (
					<div
						key={crypto.randomUUID()}
						className="flex items-start gap-2.5 rounded-xl bg-muted/50 p-3"
					>
						<Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
						<span className="text-sm">{t}</span>
					</div>
				);
			})}
		</div>
	);
}

export default InsightsList;
