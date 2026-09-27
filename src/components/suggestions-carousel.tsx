import { LightbulbIcon } from "@solar-icons/react/linear";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "#/components/ui/carousel";
import type { Suggestion, SuggestionKind } from "#/lib/health-utils";
import { cn } from "#/lib/utils";

type SuggestionsCarouselProps = {
	suggestions: Suggestion[];
	max?: number;
	className?: string;
};

const KIND_BG: Record<SuggestionKind, string> = {
	"weight-down": "bg-secondary/60 border-secondary",
	"weight-up": "bg-secondary/60 border-secondary",
	"weight-trend": "bg-accent/15 border-accent/40",
	water: "bg-secondary/60 border-secondary",
	steps: "bg-secondary/60 border-secondary",
	sleep: "bg-accent/15 border-accent/40",
	calories: "bg-warning/10 border-warning/40",
	protein: "bg-warning/10 border-warning/40",
	"imc-high": "bg-warning/10 border-warning/40",
	"imc-low": "bg-warning/10 border-warning/40",
	"fast-active": "bg-accent/15 border-accent/40",
	"fast-completed": "bg-secondary/60 border-secondary",
	"streak-7": "bg-accent/15 border-accent/40",
	"streak-30": "bg-accent/15 border-accent/40",
	"streak-broken": "bg-muted border-border",
	empty: "bg-primary/5 border-primary/20",
};

export function SuggestionsCarousel({
	suggestions,
	max = 6,
	className,
}: SuggestionsCarouselProps) {
	const [api, setApi] = React.useState<CarouselApi>();
	const [current, setCurrent] = React.useState(0);
	const [count, setCount] = React.useState(0);

	const visible = suggestions.slice(0, max);

	React.useEffect(() => {
		if (!api) return;
		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);
		api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
	}, [api]);

	if (visible.length === 0) return null;

	if (visible.length === 1) {
		return (
			<div className={cn("space-y-1", className)}>
				<div className="flex items-center gap-2">
					<LightbulbIcon className="size-4 text-primary" />
					<span className="font-display text-sm">Sugerencia del día</span>
				</div>
				<SuggestionCard suggestion={visible[0]} />
			</div>
		);
	}

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex items-center justify-between gap-2 px-1">
				<div className="flex items-center gap-2">
					<LightbulbIcon className="size-4 text-primary" />
					<span className="font-display text-sm">Sugerencias del día</span>
				</div>
				<div className="hidden lg:flex items-center gap-1.5">
					<span className="text-xs text-muted-foreground tabular-nums">
						{current} / {count}
					</span>
				</div>
			</div>

			<div className="relative">
				<Carousel
					setApi={setApi}
					opts={{ align: "start", loop: false, containScroll: "trimSnaps" }}
					className="lg:[&]:px-0"
				>
					<CarouselContent className="-ml-3">
						{visible.map((s) => (
							<CarouselItem key={s.id} className="pl-3 basis-full lg:basis-1/2">
								<SuggestionCard suggestion={s} />
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="hidden lg:flex -left-4 size-8" />
					<CarouselNext className="hidden lg:flex -right-4 size-8" />
				</Carousel>
				<div className="flex justify-center gap-1.5 pt-2 lg:hidden">
					{visible.map((s, i) => {
						const isActive = current - 1 === i;
						return (
							<span
								key={s.id}
								className={cn(
									"h-1.5 rounded-full transition-all duration-200",
									isActive ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30",
								)}
								aria-hidden="true"
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
	return (
		<div
			className={cn(
				"rounded-2xl border p-4 h-full flex flex-col gap-1.5",
				KIND_BG[suggestion.kind],
			)}
		>
			<span className="font-display text-[11px] uppercase tracking-wide text-foreground/80">
				{suggestion.title}
			</span>
			<p className="text-sm text-pretty">{suggestion.message}</p>
			{suggestion.kind === "empty" && (
				<Link
					to={"/dashboard" as string}
					className="text-xs text-primary hover:underline mt-auto self-start"
				>
					Ir a registrar →
				</Link>
			)}
		</div>
	);
}

export default SuggestionsCarousel;
