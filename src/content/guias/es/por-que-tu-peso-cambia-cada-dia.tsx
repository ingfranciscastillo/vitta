import type { Guide } from "#/content/guias/types";

// Referencias numeradas en el texto: [1], [2]... coinciden con `sources`.
function Ref({ n }: { n: number }) {
	return (
		<sup>
			<a href={`#fuente-${n}`} aria-label={`Fuente ${n}`}>
				[{n}]
			</a>
		</sup>
	);
}

function Body() {
	return (
		<>
			<p>
				Ayer la báscula marcaba 82.5 kg y hoy marca 83.1. No comiste nada fuera
				de lo normal. ¿Ganaste 600 gramos de grasa en una noche? Casi seguro que
				no.{" "}
				<strong>
					El peso de un día a otro cambia sobre todo por agua y por lo que
					tienes en el cuerpo en ese momento
				</strong>
				, no por grasa. La grasa cambia despacio; el agua, en horas.
			</p>
			<p>
				Entender esto te ahorra frustración y te ayuda a no abandonar justo
				cuando vas bien. Aquí tienes qué mueve la báscula y qué mirar en su
				lugar.
			</p>

			<h2>Lo que mueve la báscula de un día a otro</h2>

			<h3>Lo que comes y bebes</h3>
			<p>
				Un litro de agua pesa un kilo. La comida y la bebida pesan lo que pesan
				hasta que las digieres y las eliminas. Si te pesas después de cenar
				tarde o de tomar mucha agua, la báscula lo refleja al momento, aunque no
				haya cambiado nada de tu grasa corporal.
			</p>

			<h3>Los carbohidratos y el agua que los acompaña</h3>
			<p>
				Tu cuerpo guarda parte de los carbohidratos como glucógeno, en los
				músculos y el hígado. Cada gramo de glucógeno se almacena junto con al
				menos 3 gramos de agua
				<Ref n={1} />. Por eso, un día con más pan, arroz o pasta de lo habitual
				puede subir el peso al día siguiente, y un día con menos carbohidratos
				puede bajarlo rápido. En ambos casos es sobre todo agua.
			</p>

			<h3>La sal</h3>
			<p>
				Una comida muy salada también puede influir en el agua que retienes,
				aunque la respuesta varía mucho de una persona a otra. Si notas un salto
				después de una comida así, espera un par de días antes de sacar
				conclusiones.
			</p>

			<h3>El ciclo menstrual</h3>
			<p>
				Muchas mujeres notan más retención de líquidos en ciertos momentos del
				ciclo. En un estudio que siguió a 62 mujeres durante un año, la
				sensación de retención llegaba a su punto más alto el primer día de la
				menstruación
				<Ref n={2} />. Comparar tu peso con el del mismo momento del ciclo
				anterior suele ser más útil que compararlo con el de la semana pasada.
			</p>

			<h3>El fin de semana</h3>
			<p>
				Un estudio con 80 adultos que se pesaban a diario encontró un patrón
				semanal claro: el peso sube el fin de semana, llega a su punto más alto
				el domingo o el lunes y baja durante la semana
				<Ref n={3} />. Las personas que bajaban o mantenían su peso eran
				justamente las que más compensaban entre semana. Los autores concluyen
				que esta variación es normal y no una señal de que estés ganando peso.
			</p>

			<h3>La hora, la ropa y el baño</h3>
			<p>
				Pesarte por la mañana o por la noche, con ropa o sin ella, antes o
				después de ir al baño: cada detalle suma o resta. Si las condiciones
				cambian, el número cambia, aunque tú no.
			</p>

			<h2>Qué mirar en su lugar: la tendencia</h2>
			<p>
				Un dato suelto dice poco.{" "}
				<strong>La tendencia de varias semanas dice mucho.</strong> Hay dos
				formas sencillas de verla:
			</p>
			<ul>
				<li>
					<strong>La media de 7 días.</strong> Suma tus pesos de la última
					semana y divide entre siete. Compara esa media con la de la semana
					anterior. Los altibajos diarios se compensan entre sí y queda la
					dirección real.
				</li>
				<li>
					<strong>Un gráfico con muchos puntos.</strong> Cuando ves 30 días
					seguidos, un pico aislado se ve como lo que es: un pico. Lo que
					importa es hacia dónde apunta la línea.
				</li>
			</ul>
			<p>
				Pesarse a menudo y ver la evolución en un gráfico también parece ayudar.
				En un ensayo, las personas que se pesaban a diario y veían su progreso
				en un gráfico perdieron más peso en un año que el grupo de control,
				aunque la diferencia fue mayor en hombres que en mujeres
				<Ref n={4} />.
			</p>

			<h2>Cómo pesarte para que el dato sea comparable</h2>
			<ol>
				<li>A la misma hora, idealmente al despertar.</li>
				<li>Después de ir al baño y antes de comer o beber.</li>
				<li>Sin ropa o siempre con una ropa parecida.</li>
				<li>Con la misma báscula (o balanza), sobre un suelo firme y plano.</li>
				<li>
					Anotando el dato aunque no te guste. Los días “malos” también forman
					parte de la tendencia.
				</li>
			</ol>

			<h2>Cuándo sí conviene prestar atención</h2>
			<p>
				Si la media semanal sube varias semanas seguidas, ahí hay un cambio real
				que vale la pena revisar. Y si notas un aumento de peso rápido y grande
				sin explicación, o hinchazón en piernas, tobillos o manos, consúltalo
				con un profesional de la salud.
			</p>
		</>
	);
}

export const guide: Guide = {
	slug: "por-que-tu-peso-cambia-cada-dia",
	title: "Por qué tu peso cambia cada día (y qué mirar en su lugar)",
	description:
		"El peso sube y baja de un día a otro por el agua, los carbohidratos, el ciclo o el fin de semana. Aprende a leer la tendencia en vez del dato suelto.",
	published: "2026-09-26",
	updated: "2026-09-26",
	readingMinutes: 5,
	Body,
	tool: {
		to: "/calculadora-peso-meta",
		label: "Calcula cuándo llegarás a tu peso meta",
	},
	sources: [
		{
			label:
				"Murray B, Rosenbloom C. Fundamentals of glycogen metabolism for coaches and athletes. Nutrition Reviews, 2018.",
			url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6019055/",
		},
		{
			label:
				"White CP, Hitchcock CL, Vigna YM, Prior JC. Fluid Retention over the Menstrual Cycle: 1-Year Data from the Prospective Ovulation Cohort. Obstetrics and Gynecology International, 2011.",
			url: "https://pubmed.ncbi.nlm.nih.gov/21845193/",
		},
		{
			label:
				"Orsama AL, Mattila E, Ermes M, van Gils M, Wansink B, Korhonen I. Weight Rhythms: Weight Increases during Weekends and Decreases during Weekdays. Obesity Facts, 2014.",
			url: "https://karger.com/ofa/article/7/1/36/240088/Weight-Rhythms-Weight-Increases-during-Weekends",
		},
		{
			label:
				"Pacanowski CR, Levitsky DA. Frequent Self-Weighing and Visual Feedback for Weight Loss in Overweight Adults. Journal of Obesity, 2015.",
			url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4443883/",
		},
	],
};
