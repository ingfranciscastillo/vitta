import { FireIcon, MedalRibbonIcon } from "@solar-icons/react/linear";

type StreakCardProps = {
	current: number;
	best: number;
};

export function StreakCard({ current, best }: StreakCardProps) {
	return (
		<div className="grid grid-cols-2 gap-3">
			<div className="rounded-2xl bg-card border border-border p-4 text-center">
				<FireIcon className="w-5 h-5 mx-auto text-warning" />
				<div className="font-brand text-2xl mt-1 tabular-nums">{current}</div>
				<div className="text-[10px] uppercase text-muted-foreground">
					Racha actual
				</div>
			</div>
			<div className="rounded-2xl bg-card border border-border p-4 text-center">
				<MedalRibbonIcon className="w-5 h-5 mx-auto text-primary" />
				<div className="font-brand text-2xl mt-1 tabular-nums">{best}</div>
				<div className="text-[10px] uppercase text-muted-foreground">
					Mejor racha
				</div>
			</div>
		</div>
	);
}

export default StreakCard;
