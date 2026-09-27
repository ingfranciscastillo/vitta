import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { Button } from "#/components/ui/button";
import { Field, FieldError } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { supportTicketSchema } from "#/lib/schemas/support";
import { createSupportTicket } from "#/lib/support.functions";

const FAQ: Array<{ q: string; a: string }> = [
	{
		q: "¿Cómo registro mi peso?",
		a: 'Toca el botón "+" en la parte superior, ingresa tu peso y guarda. El proceso toma menos de 5 segundos.',
	},
	{
		q: "¿Funciona sin conexión a internet?",
		a: "Sí. Puedes registrar pesos sin conexión; los cambios se sincronizan automáticamente cuando vuelves a estar en línea.",
	},
	{
		q: "¿Cómo cambio mis unidades (kg/lb)?",
		a: "Ve a Configuración y selecciona la unidad de peso y altura que prefieras.",
	},
	{
		q: "¿Puedo exportar mis datos?",
		a: "Sí. Usa la página Exportar Datos para descargar tu historial completo en CSV o JSON.",
	},
	{
		q: "¿Cómo edito o elimino un registro?",
		a: "En Historial o Calendario, toca cualquier registro para editarlo o eliminarlo.",
	},
];

export const Route = createFileRoute("/_authenticated/support")({
	component: SupportPage,
});

function SupportPage() {
	const mutation = useMutation({
		mutationFn: (vars: { subject: string; message: string }) =>
			createSupportTicket({ data: vars }),
		onSuccess: () => {
			toast.success("Reporte enviado. Te responderemos lo antes posible.");
		},
		onError: () => {
			toast.error("No se pudo enviar el reporte. Intenta de nuevo.");
		},
	});

	const form = useForm({
		defaultValues: {
			subject: "",
			message: "",
		},
		validators: {
			onChange: supportTicketSchema,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
			form.reset();
		},
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2">
				<h1 className="font-display text-xl text-balance">Soporte</h1>
			</div>

			<section className="space-y-3">
				<div className="font-display text-sm">Preguntas frecuentes</div>
				<FAQList items={FAQ} />
			</section>

			<section className="space-y-3">
				<div className="font-display text-sm">Reporta un problema</div>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						void form.handleSubmit();
					}}
					className="rounded-2xl bg-card border border-border p-4 space-y-3"
				>
					<form.Field name="subject">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<Label htmlFor="subject">Asunto</Label>
									<Input
										id="subject"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Describe brevemente el problema"
										className="h-11"
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="message">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<Label htmlFor="message">Mensaje</Label>
									<Textarea
										id="message"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										placeholder="Cuenta con detalle qué ocurrió"
										rows={4}
										aria-invalid={isInvalid}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<Button size="cta"
						type="submit"
						className="w-full"
						disabled={!form.state.canSubmit || mutation.isPending}
					>
						{mutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
						Enviar reporte
					</Button>
				</form>
			</section>
		</div>
	);
}

function FAQList({ items }: { items: Array<{ q: string; a: string }> }) {
	return <FAQItemsPlaceholder items={items} />;
}

function FAQItemsPlaceholder({
	items,
}: {
	items: Array<{ q: string; a: string }>;
}) {
	// The Accordion primitive lives in src/components/ui/accordion.tsx
	// (added by the user). Until it is available, render the FAQ as a
	// flat list so this page still functions.
	return (
		<div className="rounded-2xl bg-card border border-border px-4">
			{items.map((f) => (
				<div key={f.q} className="border-b border-border py-3 last:border-0">
					<div className="text-sm font-medium">{f.q}</div>
					<div className="text-sm text-muted-foreground mt-1">{f.a}</div>
				</div>
			))}
		</div>
	);
}
