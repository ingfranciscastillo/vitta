import { ArrowRightIcon } from "@solar-icons/react/linear/arrow-right";
import { Link } from "@tanstack/react-router";
import type { SignupPrefill } from "#/lib/signup-prefill";
import { cn } from "#/lib/utils";

// CTA principal de la portada. Una sola etiqueta para la intención "registrarse".
export function StartFreeButton({
	variant = "primary",
	prefill,
	className,
}: {
	variant?: "primary" | "inverse";
	// Datos de una calculadora que se precargan en el onboarding.
	prefill?: SignupPrefill;
	className?: string;
}) {
	return (
		<Link
			to="/register"
			search={prefill ?? {}}
			className={cn(
				"group inline-flex h-12 items-center gap-3 rounded-full pl-6 pr-1.5 font-display text-base transition-[transform,background-color] duration-300 ease-brand active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				variant === "primary"
					? "bg-primary text-primary-foreground pointer-fine-hover:bg-primary/90"
					: "bg-primary-foreground text-primary pointer-fine-hover:bg-primary-foreground/90",
				className,
			)}
		>
			Empezar gratis
			<span
				aria-hidden="true"
				className={cn(
					"flex size-9 items-center justify-center rounded-full transition-transform duration-300 ease-brand group-hover:translate-x-0.5 group-hover:scale-105 motion-reduce:transition-none",
					variant === "primary" ? "bg-primary-foreground/15" : "bg-primary/10",
				)}
			>
				<ArrowRightIcon size={18} className="size-[18px]" />
			</span>
		</Link>
	);
}

export default StartFreeButton;
