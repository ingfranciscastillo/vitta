import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "#/components/legal/legal-layout";
import { LEGAL } from "#/lib/legal";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			{ title: "Política de privacidad · Vitta" },
			{
				name: "description",
				content:
					"Qué datos guarda Vitta, para qué, con quién se comparten, cuánto tiempo se conservan y cómo ejercer tus derechos.",
			},
		],
		links: [{ rel: "canonical", href: `${LEGAL.site}/privacy` }],
	}),
	component: PrivacyPage,
});

function PrivacyPage() {
	return (
		<LegalLayout
			title="Política de privacidad"
			summary={
				<ul className="list-disc space-y-1 pl-5">
					<li>
						Guardamos lo que tú registras (peso, hábitos, medidas) para
						mostrártelo. Nada más.
					</li>
					<li>
						No vendemos tus datos ni usamos publicidad. Medimos el uso de forma
						anónima y sin cookies.
					</li>
					<li>
						Solo los compartimos con los proveedores imprescindibles para que la
						app funcione.
					</li>
					<li>
						Puedes pedir una copia, corregirlos o borrarlos cuando quieras.
					</li>
				</ul>
			}
		>
			<h2>1. Quién es el responsable</h2>
			<p>
				El responsable de tus datos es {LEGAL.owner}, con domicilio en{" "}
				{LEGAL.country}, titular de {LEGAL.product}. Para cualquier asunto de
				privacidad escribe a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
				.
			</p>

			<h2>2. Qué datos guardamos</h2>
			<h3>Tu cuenta</h3>
			<ul>
				<li>Nombre y email.</li>
				<li>
					Tu contraseña, siempre cifrada; nunca la vemos en texto plano. Si
					entras con Google, recibimos tu nombre, email y foto de perfil.
				</li>
				<li>
					Si activas la verificación en dos pasos, los datos necesarios para
					comprobar tus códigos.
				</li>
			</ul>
			<h3>Tu perfil y preferencias</h3>
			<ul>
				<li>Sexo, fecha de nacimiento y altura, solo si decides indicarlos.</li>
				<li>Unidades, zona horaria y tus objetivos diarios.</li>
			</ul>
			<h3>Tus datos de salud</h3>
			<p>
				Lo que registras en la app: peso, objetivo de peso, medidas corporales,
				agua, pasos, sueño, comidas (calorías y macros), actividad física,
				ayunos y las notas que añadas.{" "}
				<strong>
					Son datos sensibles y los tratamos con especial cuidado.
				</strong>
			</p>
			<h3>Soporte</h3>
			<p>El asunto y el mensaje de las consultas que nos envíes.</p>
			<h3>Datos técnicos</h3>
			<ul>
				<li>
					La dirección IP y el tipo de navegador de tus sesiones activas, para
					mantenerte conectado y detectar accesos sospechosos.
				</li>
				<li>
					Registros temporales para limitar intentos repetidos de inicio de
					sesión.
				</li>
			</ul>
			<h3>Pagos</h3>
			<p>
				Si compras Premium, guardamos si tu cuenta es Premium y un identificador
				de cliente de Dodo Payments.{" "}
				<strong>No vemos ni guardamos los datos de tu tarjeta.</strong>
			</p>
			<p>
				<strong>No recogemos</strong> tu ubicación, tus contactos ni datos de
				otras apps, y no usamos publicidad.
			</p>
			<h3>Notificaciones</h3>
			<p>
				Si activas los recordatorios, guardamos la dirección de notificaciones
				que genera tu navegador para ese dispositivo, la hora y los días que
				eliges. El aviso no incluye tu peso ni ningún otro dato de salud. Puedes
				desactivarlos en tu perfil cuando quieras.
			</p>
			<h3>Estadísticas de uso anónimas</h3>
			<p>
				Contamos visitas y algunas acciones, como "se completó un registro" o
				"se usó la calculadora", con Umami. Son datos agregados y anónimos:
				no usan cookies, no te identifican y no incluyen el contenido de tus
				registros (ni tu peso ni tus hábitos).
			</p>

			<h2>3. Para qué los usamos</h2>
			<ul>
				<li>
					Prestarte el servicio: guardar tus registros y calcular tu tendencia,
					tu IMC, fechas estimadas y explicaciones.
				</li>
				<li>
					Enviarte emails necesarios: verificar tu cuenta y recuperar tu
					contraseña. No enviamos publicidad.
				</li>
				<li>Enviarte los recordatorios que actives.</li>
				<li>Atender tus consultas de soporte.</li>
				<li>Proteger tu cuenta y el servicio frente a abusos.</li>
				<li>
					Entender qué partes de Vitta se usan, con estadísticas anónimas, para
					mejorarla.
				</li>
				<li>Gestionar tu compra de Premium y cumplir obligaciones legales.</li>
			</ul>

			<h2>4. Base legal</h2>
			<ul>
				<li>
					<strong>Contrato:</strong> tratar los datos de tu cuenta es necesario
					para darte el servicio que pides.
				</li>
				<li>
					<strong>Consentimiento explícito:</strong> antes de registrar nada te
					pedimos consentimiento expreso para tratar tus datos de salud, y
					guardamos la fecha en que lo diste. Solo los usamos para mostrártelos.
					Puedes retirar ese consentimiento en cualquier momento borrándolos
					desde tu perfil.
				</li>
				<li>
					<strong>Interés legítimo:</strong> la seguridad del servicio, la
					prevención de abusos y las estadísticas anónimas de uso.
				</li>
				<li>
					<strong>Obligación legal:</strong> los registros de compras que la ley
					exige conservar.
				</li>
			</ul>

			<h2>5. Con quién los compartimos</h2>
			<p>
				<strong>No vendemos ni alquilamos tus datos.</strong> Solo trabajamos
				con estos proveedores, que los tratan en nuestro nombre y solo para lo
				necesario:
			</p>
			<ul>
				<li>
					<strong>Neon</strong>: base de datos donde se guarda tu información,
					en servidores de Estados Unidos.
				</li>
				<li>
					<strong>Resend</strong>: envío de los emails de la cuenta (tu email y
					el contenido del mensaje).
				</li>
				<li>
					<strong>Dodo Payments</strong>: cobro de Premium como vendedor
					registrado. Trata tus datos de pago según su propia política de
					privacidad.
				</li>
				<li>
					<strong>Google</strong>: solo si eliges iniciar sesión con Google.
				</li>
				<li>
					<strong>Vercel</strong>: alojamiento de la aplicación, en Estados
					Unidos. Procesa las peticiones de tu navegador, incluida tu dirección
					IP.
				</li>
				<li>
					<strong>Umami</strong>: estadísticas de uso anónimas, sin cookies.
				</li>
				<li>
					<strong>Servicios de notificaciones</strong> de Apple, Google o
					Mozilla, según tu navegador: solo si activas los recordatorios, para
					entregarte el aviso.
				</li>
			</ul>
			<p>
				También podríamos compartir datos si una autoridad lo exige legalmente.
			</p>

			<h2>6. Transferencias internacionales</h2>
			<p>
				Nuestros proveedores guardan los datos en Estados Unidos. Cuando la ley
				lo exige, nos apoyamos en las garantías contractuales que ofrecen esos
				proveedores para proteger tus datos fuera de tu país.
			</p>

			<h2>7. Cuánto tiempo los conservamos</h2>
			<ul>
				<li>
					Mientras tengas cuenta, conservamos tus datos para que puedas usarlos.
				</li>
				<li>
					Cuando borras datos desde la app, se eliminan de la base de datos de
					inmediato. Pueden permanecer en copias de seguridad de nuestro
					proveedor durante un tiempo limitado hasta que se sobrescriben.
				</li>
				<li>
					Si eliminas tu cuenta desde el perfil, borramos al instante todos tus
					datos de la base de datos. Si nos lo pides por email, lo hacemos en un
					plazo máximo de 30 días.
				</li>
				<li>
					Los registros de compra los conserva Dodo Payments durante el tiempo
					que exige la ley fiscal.
				</li>
			</ul>

			<h2>8. Tus derechos</h2>
			<p>Puedes, en cualquier momento:</p>
			<ul>
				<li>
					<strong>Ver y corregir</strong> tus datos directamente en la app.
				</li>
				<li>
					<strong>Obtener una copia</strong>: con Premium desde tu perfil, o
					gratis escribiéndonos.
				</li>
				<li>
					<strong>Borrar</strong> tus datos de salud o tu cuenta completa desde{" "}
					<Link to="/profile">tu perfil</Link>.
				</li>
				<li>
					<strong>Oponerte o limitar</strong> ciertos usos, y{" "}
					<strong>retirar tu consentimiento</strong>.
				</li>
				<li>
					<strong>Reclamar</strong> ante la autoridad de protección de datos de
					tu país.
				</li>
			</ul>
			<p>
				Para ejercerlos, escribe a{" "}
				<a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> desde el email de tu
				cuenta. Respondemos en un máximo de 30 días.
			</p>

			<h2>9. Cookies y almacenamiento local</h2>
			<p>
				Usamos solo lo imprescindible: una cookie de sesión para mantenerte
				conectado, y el almacenamiento de tu navegador para recordar
				preferencias como el tema. Las estadísticas de uso no usan cookies, y
				no usamos cookies de publicidad, por eso no te pedimos aceptarlas.
			</p>

			<h2>10. Seguridad</h2>
			<p>
				Toda la comunicación va cifrada por HTTPS. Las contraseñas se guardan
				cifradas, los accesos de Google se guardan cifrados y puedes activar la
				verificación en dos pasos. Cada persona solo puede acceder a sus propios
				datos. Ningún sistema es infalible: si ocurriera una brecha que te
				afecte, te avisaremos.
			</p>

			<h2>11. Menores</h2>
			<p>
				{LEGAL.product} es solo para mayores de 18 años. Si sabemos que una
				cuenta pertenece a un menor, la eliminaremos.
			</p>

			<h2>12. Cambios en esta política</h2>
			<p>
				Si hacemos cambios importantes, te avisaremos por email o dentro de la
				app antes de que se apliquen. La fecha de arriba indica la última
				actualización.
			</p>

			<h2>13. Relación con los términos</h2>
			<p>
				Esta política forma parte de nuestros{" "}
				<Link to="/terminos">Términos de servicio</Link>.
			</p>
		</LegalLayout>
	);
}
