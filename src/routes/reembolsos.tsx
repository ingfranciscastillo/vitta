import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "#/components/legal/legal-layout";
import { LEGAL } from "#/lib/legal";

export const Route = createFileRoute("/reembolsos")({
	head: () => ({
		meta: [
			{ title: "Política de reembolso y cancelación · Vitta" },
			{
				name: "description",
				content: `Vitta Premium es un pago único con ${LEGAL.refundDays} días para pedir el reembolso sin dar explicaciones.`,
			},
		],
		links: [{ rel: "canonical", href: `${LEGAL.site}/reembolsos` }],
	}),
	component: RefundsPage,
});

function RefundsPage() {
	return (
		<LegalLayout
			title="Política de reembolso y cancelación"
			summary={
				<p>
					Premium es un pago único de {LEGAL.premiumPrice}, sin suscripción. Si
					no te convence, tienes {LEGAL.refundDays} días desde la compra para
					pedir el reembolso completo, sin dar explicaciones.
				</p>
			}
		>
			<h2>Reembolso en {LEGAL.refundDays} días</h2>
			<p>
				Si compraste {LEGAL.product} Premium hace {LEGAL.refundDays} días o
				menos, te devolvemos el <strong>100 %</strong> del importe. No necesitas
				explicar el motivo.
			</p>

			<h2>Cómo pedirlo</h2>
			<ol>
				<li>
					Escríbenos a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> desde
					el email de tu cuenta, o responde al recibo de compra.
				</li>
				<li>
					Procesamos el reembolso a través de Dodo Payments, que gestiona los
					pagos de {LEGAL.product}.
				</li>
				<li>
					El dinero suele volver a tu método de pago en{" "}
					<strong>3 a 5 días hábiles</strong>, según tu banco.
				</li>
			</ol>
			<p>
				Cuando se completa el reembolso, tu cuenta vuelve al plan gratis. Tus
				datos no se borran.
			</p>

			<h2>Después de {LEGAL.refundDays} días</h2>
			<p>
				Pasado ese plazo no ofrecemos reembolsos, salvo que la ley de tu país lo
				exija o que haya un problema del servicio que no podamos resolver. Si
				algo no funciona, escríbenos igualmente: lo revisamos caso por caso.
			</p>

			<h2>Cancelación</h2>
			<p>
				Premium no es una suscripción: no hay cobros recurrentes, así que no hay
				nada que cancelar. Puedes dejar de usar {LEGAL.product} o pedir el
				cierre de tu cuenta cuando quieras. Cerrar la cuenta no genera un
				reembolso automático fuera del plazo de {LEGAL.refundDays} días.
			</p>

			<h2>Disputas con tu banco</h2>
			<p>
				Antes de abrir una disputa o un contracargo, escríbenos: suele ser más
				rápido y sencillo para ti. Más detalles en los{" "}
				<Link to="/terminos">Términos de servicio</Link>.
			</p>
		</LegalLayout>
	);
}
