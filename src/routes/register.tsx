import { LetterIcon, LockIcon } from "@solar-icons/react/linear";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthLayout } from "#/components/auth-layout";
import { Bars } from "#/components/bars";
import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { PasswordInput } from "#/components/ui/password-input.tsx";
import { Google } from "#/components/ui/svgs/google";
import { getSession } from "#/lib/auth.functions";
import { authClient } from "#/lib/auth-client";
import { mapAuthError } from "#/lib/auth-errors";
import { registerSchema } from "#/lib/schemas/auth";
import {
	parseSignupPrefill,
	type SignupPrefill,
	signupPrefillQuery,
} from "#/lib/signup-prefill";

export const Route = createFileRoute("/register")({
	// Datos de las calculadoras públicas que se pasan al onboarding.
	validateSearch: (search: Record<string, unknown>): SignupPrefill =>
		parseSignupPrefill(search),
	beforeLoad: async () => {
		const session = await getSession();
		if (session) throw redirect({ to: "/dashboard" });
	},
	component: RegisterPage,
});

function RegisterPage() {
	const welcomeUrl = `/welcome${signupPrefillQuery(Route.useSearch())}`;
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onChange: registerSchema,
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);
			const { error } = await authClient.signUp.email({
				name: value.name,
				email: value.email,
				password: value.password,
			});
			if (error) {
				setSubmitError(mapAuthError(error));
				return;
			}
			toast.success("Cuenta creada. Revisa tu email para verificarla.");
			window.location.assign(welcomeUrl);
		},
	});

	const handleGoogle = (): void => {
		void authClient.signIn.social({
			provider: "google",
			callbackURL: "/dashboard",
			newUserCallbackURL: welcomeUrl,
		});
	};

	return (
		<AuthLayout
			brandName="Vitta"
			title="Crear cuenta"
			subtitle="Gratis para empezar. No necesitas tarjeta."
			footer={
				<>
					¿Ya tienes cuenta?{" "}
					<Link
						to={"/login" as string}
						className="text-primary font-medium hover:underline"
					>
						Iniciar sesión
					</Link>
				</>
			}
		>
			<Button size="cta"
				type="button"
				variant="outline"
				className="w-full mb-6"
				onClick={handleGoogle}
			>
				<Google className="w-5 h-5 mr-2" />
				Continuar con Google
			</Button>

			<div className="relative mb-6">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border" />
				</div>

				<div className="relative flex justify-center">
					<span className="bg-background px-3 text-xs font-medium text-muted-foreground uppercase">
						O
					</span>
				</div>
			</div>

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
				<form.Field name="name">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="name">Nombre</Label>
								<Input
									id="name"
									type="text"
									autoComplete="name"
									autoFocus
									placeholder="Tu nombre"
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

				<form.Field name="email">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="email">Email</Label>
								<div className="relative">
									<LetterIcon
										className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
										aria-hidden="true"
									/>
									<Input
										id="email"
										type="email"
										autoComplete="email"
										placeholder="tu@ejemplo.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										className="pl-10"
										aria-invalid={isInvalid}
									/>
								</div>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				</form.Field>

				<form.Field name="password">
					{(field) => {
						const isInvalid =
							field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<Label htmlFor="password">Contraseña</Label>
								<PasswordInput
									id="password"
									startIcon={<LockIcon className="size-4" aria-hidden="true" />}
									showStrengthMeter
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
							{isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
						</Button>
					)}
				</form.Subscribe>
			</form>

			<p className="mt-4 text-xs text-muted-foreground text-pretty">
				Al crear tu cuenta, con email o con Google, aceptas los{" "}
				<Link to="/terminos" className="text-primary underline-offset-4 hover:underline">
					Términos
				</Link>{" "}
				y la{" "}
				<Link to="/privacy" className="text-primary underline-offset-4 hover:underline">
					Política de Privacidad
				</Link>
				, y das tu consentimiento para que guardemos los datos de salud que
				registres con el único fin de mostrártelos.
			</p>
		</AuthLayout>
	);
}
