import { LockKeyholeIcon } from "@solar-icons/react/linear";
import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	redirect,
	useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "#/components/auth-layout";
import { Bars } from "#/components/bars";
import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import { PasswordInput } from "#/components/ui/password-input.tsx";
import { getSession } from "#/lib/auth.functions";
import { authClient } from "#/lib/auth-client";
import { mapAuthError } from "#/lib/auth-errors";
import { resetPasswordSchema } from "#/lib/schemas/auth";

type ResetPasswordSearch = { token?: string };

export const Route = createFileRoute("/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: "/dashboard" });
	},
	component: ResetPasswordPage,
});

function InvalidLink() {
	return (
		<AuthLayout
			brandName="Vitta"
			title="Enlace inválido"
			subtitle="Este enlace de recuperación falta o es inválido"
			footer={
				<Link
					to={"/forgot-password" as string}
					className="text-primary font-medium hover:underline"
				>
					Solicitar uno nuevo
				</Link>
			}
		>
			<p className="text-sm text-foreground text-center">
				El enlace que usaste parece estar incompleto. Solicita un nuevo correo
				de recuperación.
			</p>
		</AuthLayout>
	);
}

function ResetPasswordForm({ token }: { token: string }) {
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: resetPasswordSchema
				.extend({
					confirmPassword: resetPasswordSchema.shape.password,
				})
				.refine((data) => data.password === data.confirmPassword, {
					message: "Las contraseñas no coinciden",
					path: ["confirmPassword"],
				}),
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);
			const { error } = await authClient.resetPassword({
				newPassword: value.password,
				token,
			});
			if (error) {
				setSubmitError(mapAuthError(error));
				return;
			}
			window.location.assign("/login");
		},
	});

	return (
		<AuthLayout
			brandName="Vitta"
			title="Nueva contraseña"
			subtitle="Ingresa tu nueva contraseña"
		>
			{submitError && (
				<div
					role="alert"
					className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
				>
					{submitError}
				</div>
			)}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					void form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.Field name="password">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="password">Nueva contraseña</Label>
								<PasswordInput
									id="password"
									startIcon={
										<LockKeyholeIcon className="size-4" aria-hidden="true" />
									}
									showStrengthMeter
									autoComplete="new-password"
									autoFocus
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="confirmPassword">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="confirm">Confirmar contraseña</Label>
								<PasswordInput
									id="confirm"
									startIcon={
										<LockKeyholeIcon className="size-4" aria-hidden="true" />
									}
									autoComplete="new-password"
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									aria-invalid={isInvalid}
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting] as const}
				>
					{([canSubmit, isSubmitting]) => (
						<Button size="cta"
							type="submit"
							className="w-full"
							disabled={!canSubmit || isSubmitting}
							aria-busy={isSubmitting}
						>
							{isSubmitting && <Bars className="w-3 h-3 mr-1.5" />}
							{isSubmitting ? "Restableciendo..." : "Restablecer contraseña"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</AuthLayout>
	);
}

function ResetPasswordPage() {
	const { token } = useSearch({ from: "/reset-password" });
	if (!token) return <InvalidLink />;
	return <ResetPasswordForm token={token} />;
}
