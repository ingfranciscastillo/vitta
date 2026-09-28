import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { PasswordInput } from "#/components/ui/password-input";
import { authClient } from "#/lib/auth-client";
import { unsubscribeFromPush } from "#/lib/push-client";

// Sin contraseña (cuenta de Google) se pide escribir esta palabra para evitar
// borrados accidentales; Better Auth exige además una sesión reciente.
const CONFIRM_WORD = "ELIMINAR";

export function DeleteAccount() {
	const [open, setOpen] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmText, setConfirmText] = useState("");
	const [error, setError] = useState<string | null>(null);

	const accounts = useQuery({
		queryKey: ["auth-accounts"],
		queryFn: async () => {
			const { data } = await authClient.listAccounts();
			return data ?? [];
		},
		enabled: open,
	});
	const hasPassword = !!accounts.data?.some(
		(a) => a.providerId === "credential",
	);

	const deleteMut = useMutation({
		mutationFn: async () => {
			// Sin esperar al servidor: si falla, la suscripción caduca sola.
			await unsubscribeFromPush().catch(() => null);
			const { error } = await authClient.deleteUser(
				hasPassword ? { password } : {},
			);
			if (error) throw error;
		},
		onSuccess: () => {
			window.location.assign("/");
		},
		onError: (err: { code?: string }) => {
			if (err.code === "INVALID_PASSWORD") {
				setError("Contraseña incorrecta.");
			} else if (err.code === "SESSION_EXPIRED") {
				setError(
					"Por seguridad, cierra sesión, vuelve a entrar y repite el borrado.",
				);
			} else if (err.code === "TOO_MANY_REQUESTS") {
				setError("Demasiados intentos. Espera un rato.");
			} else {
				toast.error("No se pudo eliminar la cuenta");
			}
		},
	});

	const ready = hasPassword
		? password.length > 0
		: confirmText.trim().toUpperCase() === CONFIRM_WORD;

	const reset = (next: boolean) => {
		if (deleteMut.isPending) return;
		setOpen(next);
		if (!next) {
			setPassword("");
			setConfirmText("");
			setError(null);
		}
	};

	return (
		<>
			<Button
				type="button"
				variant="destructive-outline"
				size="cta"
				onClick={() => setOpen(true)}
				className="w-full"
			>
				Eliminar mi cuenta
			</Button>
			<AlertDialog open={open} onOpenChange={reset}>
				<AlertDialogContent size="sm">
					<form
						className="contents"
						onSubmit={(e) => {
							e.preventDefault();
							if (ready && !deleteMut.isPending) {
								setError(null);
								deleteMut.mutate();
							}
						}}
					>
						<AlertDialogHeader>
							<AlertDialogTitle className="text-balance">
								Eliminar mi cuenta
							</AlertDialogTitle>
							<AlertDialogDescription className="text-pretty">
								Se borran tu cuenta, todos tus registros, tus recordatorios y
								tus sesiones. Si compraste Premium, también se pierde. No se
								puede deshacer.
							</AlertDialogDescription>
						</AlertDialogHeader>

						{accounts.isPending ? (
							<div className="flex justify-center py-2">
								<Bars className="w-4 h-4" />
							</div>
						) : hasPassword ? (
							<Field>
								<FieldLabel htmlFor="delete-password">Tu contraseña</FieldLabel>
								<PasswordInput
									id="delete-password"
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</Field>
						) : (
							<Field>
								<FieldLabel htmlFor="delete-confirm">
									Escribe {CONFIRM_WORD} para confirmar
								</FieldLabel>
								<Input
									id="delete-confirm"
									autoComplete="off"
									autoCapitalize="characters"
									value={confirmText}
									onChange={(e) => setConfirmText(e.target.value)}
								/>
							</Field>
						)}

						{error && (
							<p role="alert" className="text-sm text-destructive">
								{error}
							</p>
						)}

						<AlertDialogFooter>
							<AlertDialogCancel type="button" disabled={deleteMut.isPending}>
								Cancelar
							</AlertDialogCancel>
							<Button
								type="submit"
								variant="destructive"
								disabled={!ready || deleteMut.isPending}
								aria-busy={deleteMut.isPending}
							>
								{deleteMut.isPending && <Bars className="w-3 h-3 mr-1.5" />}
								Eliminar para siempre
							</Button>
						</AlertDialogFooter>
					</form>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
