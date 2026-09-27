type ProgressBarProps = {
	value: number;
	goal: number;
	className?: string;
};

export function ProgressBar({ value, goal, className = "" }: ProgressBarProps) {
	const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
	return (
		<div className={`h-2 rounded-full bg-muted overflow-hidden ${className}`}>
			<div
				className="h-full w-full origin-left rounded-full bg-primary transition-transform duration-500 ease-brand motion-reduce:transition-none"
				style={{ transform: `scaleX(${pct / 100})` }}
			/>
		</div>
	);
}

export default ProgressBar;
