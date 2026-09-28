import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "#/components/legal/legal-layout";
import { LEGAL } from "#/lib/legal";

export const Route = createFileRoute("/terminos")({
	head: () => ({
		meta: [
			{ title: "Términos de servicio · Vitta" },
			{
				name: "description",
				content:
					"Condiciones de uso de Vitta: qué es y qué no es, tu cuenta, tus datos, el plan Premium, pagos con Dodo Payments y reembolsos.",
			},
		],
		links: [{ rel: "canonical", href: `${LEGAL.site}/terminos` }],
	}),
	component: TermsPage,
});

function TermsPage() {
	return (
		<LegalLayout
			title="Términos de servicio"
			summary={
				<ul className="list-disc space-y-1 pl-5">
					<li>
						Vitta es una herramienta para registrar tu peso y tus hábitos. No es
						un servicio médico ni un programa para perder peso.
					</li>
					<li>Tus datos son tuyos: puedes pedir una copia o borrarlos.</li>
					<li>
						Premium es un pago único de {LEGAL.premiumPrice}. Tienes{" "}
						{LEGAL.refundDays} días para pedir el reembolso sin dar
						explicaciones.
					</li>
					<li>El pago lo gestiona Dodo Payments como vendedor registrado.</li>
				</ul>
			}
		>
			<p>
				Estos términos regulan el uso de {LEGAL.product} ({LEGAL.site}), un
				servicio ofrecido por {LEGAL.owner}, con domicilio en {LEGAL.country}{" "}
				("nosotros"). "Tú" eres la persona que usa {LEGAL.product}.
			</p>

			<h2>1. Aceptación</h2>
			<p>
				Al crear una cuenta o usar {LEGAL.product} aceptas estos términos y
				nuestra <Link to="/privacy">Política de Privacidad</Link>. Si no estás
				de acuerdo, no uses el servicio. Debes tener{" "}
				<strong>18 años o más</strong>.
			</p>

			<h2>2. Qué es Vitta y qué no es</h2>
			<p>
				{LEGAL.product} te ayuda a registrar tu peso, medidas y hábitos (agua,
				pasos, sueño, comidas, actividad y ayuno) y a ver tu evolución con
				gráficos, tendencias y explicaciones.
			</p>
			<p>
				<strong>
					{LEGAL.product} no es un servicio médico, nutricional ni psicológico,
					ni un programa para perder peso.
				</strong>{" "}
				Los cálculos (IMC, fechas estimadas, tendencias) y las explicaciones son
				orientativos y no sustituyen el consejo de un profesional de la salud.
				No uses {LEGAL.product} para tomar decisiones médicas ni en situaciones
				de emergencia. Si tienes o has tenido un trastorno de la conducta
				alimentaria, consulta con un profesional antes de usar herramientas de
				seguimiento del peso.
			</p>

			<h2>3. Tu cuenta</h2>
			<ul>
				<li>Usa datos reales y mantén tu contraseña en secreto.</li>
				<li>Una cuenta es personal: no la compartas.</li>
				<li>
					Te recomendamos activar la verificación en dos pasos desde tu perfil.
				</li>
				<li>
					Si sospechas que alguien entró en tu cuenta, cambia tu contraseña y
					avísanos.
				</li>
			</ul>

			<h2>4. Uso aceptable</h2>
			<p>No está permitido:</p>
			<ul>
				<li>Usar {LEGAL.product} para fines ilegales.</li>
				<li>Intentar acceder a cuentas o datos de otras personas.</li>
				<li>
					Extraer datos de forma automatizada, sobrecargar el servicio o
					intentar saltarte sus medidas de seguridad.
				</li>
				<li>
					Copiar, revender o hacer ingeniería inversa del servicio, salvo que la
					ley lo permita expresamente.
				</li>
			</ul>

			<h2>5. Tus datos</h2>
			<p>
				<strong>Tus datos te pertenecen.</strong> Solo los usamos para prestarte
				el servicio, como explica la{" "}
				<Link to="/privacy">Política de Privacidad</Link>. No los vendemos ni
				los usamos para publicidad.
			</p>
			<ul>
				<li>Puedes importar tu historial desde un archivo CSV o JSON.</li>
				<li>
					La exportación desde la app es una función Premium, pero cualquier
					persona puede pedirnos gratis una copia de sus datos escribiendo a{" "}
					<a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
				</li>
				<li>
					Puedes borrar tus datos de salud o tu cuenta completa desde tu perfil.
				</li>
			</ul>

			<h2>6. Plan gratis y Premium</h2>
			<p>
				El plan gratis incluye las funciones básicas. <strong>Premium</strong>{" "}
				desbloquea funciones adicionales mediante un{" "}
				<strong>pago único de {LEGAL.premiumPrice}</strong>, sin suscripción ni
				renovaciones automáticas.
			</p>
			<p>
				"De por vida" significa mientras {LEGAL.product} siga en funcionamiento.
				Premium incluye las funciones Premium actuales y las que añadamos
				después. Podemos cambiar el precio para compras futuras; eso no afecta a
				lo que ya pagaste.
			</p>

			<h2>7. Pagos</h2>
			<p>
				Los pagos los procesa <strong>Dodo Payments</strong>, que actúa como
				vendedor registrado (merchant of record): cobra el pago, emite el recibo
				y gestiona los impuestos correspondientes. Al pagar aceptas también las
				condiciones de Dodo Payments. Nosotros no vemos ni guardamos los datos
				de tu tarjeta.
			</p>

			<h2>8. Reembolsos</h2>
			<p>
				Tienes <strong>{LEGAL.refundDays} días desde la compra</strong> para
				pedir el reembolso completo, sin dar explicaciones. Los detalles están
				en la <Link to="/reembolsos">Política de Reembolso</Link>. Antes de
				abrir una disputa con tu banco, escríbenos: suele ser más rápido.
			</p>

			<h2>9. Disponibilidad y cambios del servicio</h2>
			<p>
				Trabajamos para que {LEGAL.product} funcione siempre, pero no podemos
				garantizarlo sin interrupciones. Podemos mejorar, cambiar o retirar
				funciones. Si alguna vez cerramos {LEGAL.product}, te avisaremos con al
				menos <strong>30 días</strong> de antelación y podrás descargar tus
				datos.
			</p>

			<h2>10. Propiedad intelectual</h2>
			<p>
				El nombre {LEGAL.product}, el diseño, el código y los contenidos (como
				las guías) nos pertenecen. Te damos una licencia personal, limitada y no
				transferible para usar el servicio.
			</p>

			<h2>11. Responsabilidad</h2>
			<p>
				{LEGAL.product} se ofrece "tal cual". En la medida en que la ley lo
				permita, no respondemos por daños indirectos ni por decisiones que tomes
				basándote en la información de la app, y nuestra responsabilidad total
				se limita a lo que nos hayas pagado en los últimos 12 meses.{" "}
				<strong>
					Nada de esto limita los derechos que te reconozca la ley de protección
					al consumidor de tu país.
				</strong>
			</p>

			<h2>12. Suspensión y cierre</h2>
			<p>
				Puedes dejar de usar {LEGAL.product} y eliminar tu cuenta desde tu
				perfil cuando quieras. Podemos suspender una cuenta que incumpla estos términos; salvo
				casos graves, te avisaremos antes y podrás explicarte.
			</p>

			<h2>13. Cambios en estos términos</h2>
			<p>
				Si hacemos cambios importantes, te avisaremos por email o dentro de la
				app al menos <strong>30 días</strong> antes de que se apliquen. Si no
				estás de acuerdo, puedes cerrar tu cuenta.
			</p>

			<h2>14. Ley aplicable</h2>
			<p>
				Estos términos se rigen por las leyes de {LEGAL.country}, sin perjuicio
				de las normas de protección al consumidor que te correspondan según tu
				país de residencia.
			</p>

			<h2>15. Contacto</h2>
			<p>
				Para cualquier duda sobre estos términos, escríbenos a{" "}
				<a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
			</p>
		</LegalLayout>
	);
}
