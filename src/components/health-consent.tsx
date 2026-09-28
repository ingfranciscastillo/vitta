import { ShieldCheckIcon } from "@solar-icons/react/linear";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { authClient } from "#/lib/auth-client";
import { giveHealthConsent } from "#/lib/profile.functions";

// Consentimiento explícito para datos de salud (RGPD art. 9). Se muestra
// antes de poder registrar nada: en el onboarding y, para quien lo omitió o
// ya tenía cuenta, al entrar en la app.
export function HealthConsent() {
	const qc = useQueryClient();
	const [checked, setChecked] = useState(false);

	const mut = useMutation({
		mutationFn: () => giveHealthConsent(),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["current-user"] }),
		onError: () => toast.error("No se pudo guardar tu respuesta"),
	});

	const decline = async () => {
		await authClient.signOut();
		window.location.assign("/");
	};

	return (
		<div className="min-h-dvh bg-background">
			<main className="page-enter mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8 pt-[max(2rem,env(safe-area-inset-top))]">
				<span className="flex items-center justify-center gap-2 font-brand text-sm">
					<span className="size-2 rounded-full bg-primary" />
					Vitta
				</span>

				<div className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<ShieldCheckIcon className="size-6" />
				</div>
				<h1 className="mt-5 font-display text-2xl text-balance">
					Tus datos de salud, bajo tu control
				</h1>
				<div className="mt-3 space-y-3 text-sm text-muted-foreground text-pretty">
					<p>
						Para mostrarte tu progreso, Vitta guarda lo que registras: peso,
						medidas, agua, pasos, sueño, comidas, actividad y ayunos.
					</p>
					<ul className="list-disc space-y-1 pl-5">
						<li>Solo tú los ves. No los vendemos ni hay publicidad.</li>
						<li>Puedes descargarlos o borrarlos cuando quieras.</li>
					</ul>
				</div>

				<label
					htmlFor="health-consent"
					className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm"
				>
					<Checkbox
						id="health-consent"
						checked={checked}
						onCheckedChange={(v) => setChecked(v === true)}
						className="mt-0.5 size-5"
					/>
					<span className="text-pretty">
						Doy mi consentimiento para que Vitta trate mis datos de salud con el
						fin de ofrecerme el servicio, como explica la{" "}
						<Link
							to="/privacy"
							target="_blank"
							className="text-primary underline-offset-4 pointer-fine-hover:underline"
						>
							Política de privacidad
						</Link>
						.
					</span>
				</label>
				<p className="mt-3 text-xs text-muted-foreground text-pretty">
					Puedes retirarlo en cualquier momento borrando tus datos o tu cuenta
					desde el perfil.
				</p>

				<div className="mt-auto space-y-2 pt-8">
					<Button
						type="button"
						size="cta"
						className="w-full"
						disabled={!checked || mut.isPending}
						aria-busy={mut.isPending}
						onClick={() => mut.mutate()}
					>
						{mut.isPending && <Bars className="mr-1.5 h-3 w-3" />}
						Aceptar y continuar
					</Button>
					<Button
						type="button"
						size="cta"
						variant="ghost"
						className="w-full text-muted-foreground"
						disabled={mut.isPending}
						onClick={decline}
					>
						No acepto, cerrar sesión
					</Button>
				</div>
			</main>
		</div>
	);
}
