import { CheckIcon } from "@solar-icons/react/linear/check";
import {
	FireIcon,
	GraphDownIcon,
	HashtagIcon,
	MedalRibbonIcon,
	TargetIcon,
} from "@solar-icons/react/outline";
import type { ComponentType, SVGProps } from "react";

type SolarIcon = ComponentType<SVGProps<SVGSVGElement>>;

const icons: Record<string, SolarIcon> = {
	award: MedalRibbonIcon,
	flame: FireIcon,
	hash: HashtagIcon,
	trendingDown: GraphDownIcon,
	target: TargetIcon,
};

type AchievementIconKey = keyof typeof icons;

type Achievement = {
	id: string;
	label: string;
	icon: AchievementIconKey;
	unlocked: boolean;
	progress: number;
};

type AchievementsListProps = {
	achievements: Achievement[];
};

export function AchievementsList({ achievements }: AchievementsListProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{achievements.map((a) => {
				const Icon = icons[a.icon] ?? MedalRibbonIcon;
				return (
					<div
						key={a.id}
						className={`rounded-2xl border p-4 flex items-center gap-3 ${
							a.unlocked
								? "bg-card border-border"
								: "bg-muted/40 border-border opacity-70"
						}`}
					>
						<div
							className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
								a.unlocked
									? "bg-primary/15 text-primary"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{a.unlocked ? (
								<CheckIcon className="w-5 h-5" />
							) : (
								<Icon className="w-5 h-5" />
							)}
						</div>
						<div className="flex-1">
							<div className="text-sm font-medium">{a.label}</div>
							{!a.unlocked && a.progress < 1 && (
								<div className="text-[10px] text-muted-foreground">
									{Math.round(a.progress * 100)}%
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default AchievementsList;
export type { Achievement, AchievementIconKey };
