import { CheckCircleIcon, CloseCircleIcon } from "@solar-icons/react/outline";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Progress } from "#/components/ui/progress";
import {
	hasProfileGaps,
	PROFILE_CARD_DISMISSED_KEY,
	type ProfileGaps,
} from "#/lib/onboarding";
import { cn } from "#/lib/utils";

type ProfileCompletionCardProps = {
	gaps: ProfileGaps;
};

export function ProfileCompletionCard({ gaps }: ProfileCompletionCardProps) {
	// Se lee tras montar para no desajustar el HTML del servidor.
	const [dismissed, setDismissed] = useState(true);
	useEffect(() => {
		try {
			setDismissed(localStorage.getItem(PROFILE_CARD_DISMISSED_KEY) === "1");
		} catch {
			setDismissed(false);
		}
	}, []);

	if (dismissed || !hasProfileGaps(gaps)) return null;

	// "Cuenta creada" arranca marcado: el progreso nunca empieza en cero.
	const items = [
		{ label: "Crear tu cuenta", done: true },
		{ label: "Registrar tu peso", done: !gaps.weight },
		{ label: "Añadir tu altura", done: !gaps.height },
		{ label: "Definir tu objetivo", done: !gaps.goal },
	];
	const doneCount = items.filter((i) => i.done).length;

	const dismiss = () => {
		setDismissed(true);
		try {
			localStorage.setItem(PROFILE_CARD_DISMISSED_KEY, "1");
		} catch {
			// Sin almacenamiento solo se oculta hasta recargar.
		}
	};

	return (
		<section
			aria-labelledby="profile-completion-title"
			className="rounded-2xl border border-border bg-card p-4"
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<h2 id="profile-completion-title" className="font-display text-sm">
						Completa tu perfil
					</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{doneCount} de {items.length} listos
					</p>
				</div>
				<button
					type="button"
					onClick={dismiss}
					aria-label="Ocultar"
					className="-mr-2 -mt-2 flex size-11 items-center justify-center rounded-full text-muted-foreground pointer-fine-hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					<CloseCircleIcon className="size-5" />
				</button>
			</div>
			<Progress
				value={(doneCount / items.length) * 100}
				className="my-3 h-1.5"
			/>
			<ul className="space-y-1.5">
				{items.map((item) => (
					<li
						key={item.label}
						className={cn(
							"flex items-center gap-2 text-sm",
							item.done && "text-muted-foreground line-through",
						)}
					>
						<CheckCircleIcon
							className={cn(
								"size-4 shrink-0",
								item.done ? "text-primary" : "text-muted-foreground/40",
							)}
						/>
						{item.label}
					</li>
				))}
			</ul>
			<Link
				to="/welcome"
				className="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-primary font-display text-sm text-primary-foreground transition-opacity pointer-fine-hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				Completar ahora
			</Link>
		</section>
	);
}

export default ProfileCompletionCard;
