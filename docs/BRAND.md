# Guía de marca de Vitta

Reglas para que cada pantalla se sienta parte del mismo producto. Si algo no encaja aquí, se discute antes de añadir una excepción.

## Personalidad

**Clara, constante y cercana.** Vitta acompaña un hábito diario: nada estridente, nada que asuste. El movimiento es rápido para responder y suave para cambiar de estado; nunca rebota ni llama la atención por sí mismo.

## Tipografía

| Uso | Fuente | Notas |
|---|---|---|
| Texto, títulos, cifras y botones | Nunito Sans | Títulos y botones en 700 (`font-display`) |
| Marca | Silkscreen (`font-brand`) | Solo el logo "Vitta" y los contadores de racha |

- Frases en mayúscula inicial. Sin mayúsculas forzadas, salvo las etiquetas pequeñas de datos en tarjetas (por ejemplo, "Peso actual").
- Cifras con `tabular-nums` cuando cambian o se comparan.

## Color

Todo sale de los tokens de `src/styles.css`; nunca colores sueltos.

- **Primario (azul):** acción principal, datos destacados y progreso.
- **Positivo / aviso / negativo:** solo para estados reales (bajada de peso, sobrepeso, error).
- **Destructivo:** acciones irreversibles o de salida.

## Formas

| Elemento | Radio |
|---|---|
| Tarjetas y paneles | `rounded-2xl` (grandes y destacados: `rounded-3xl`) |
| Botones de la app | `rounded-md` (el del componente `Button`) |
| Botones de icono (−, +, cerrar) | `rounded-full` |
| Botones de la portada y páginas públicas | `rounded-full` (píldora) |

## Botones

| Caso | Componente |
|---|---|
| Acción principal (guardar, continuar, confirmar) | `<Button size="cta">` |
| Acción secundaria | `<Button size="cta" variant="outline">` |
| Irreversible o de salida (cerrar sesión, borrar datos, desactivar 2FA) | `<Button size="cta" variant="destructive-outline">` |
| Registro desde páginas públicas | `<StartFreeButton />` ("Empezar gratis") |
| Cargando | `<Bars />` dentro del botón, con `disabled` y `aria-busy` |

Una intención, una etiqueta: el registro siempre es "Empezar gratis" y el acceso siempre es "Iniciar sesión".

## Iconos

- Solo **Solar, estilo `linear`** (`@solar-icons/react/linear`). Nada de variantes con círculo ni `secondaryOpacity`.
- Tamaños: 16 px en controles pequeños, 20 px en botones y navegación.
- Trazo de 1.5 para todos, fijado con `--solar-stroke-width` en `src/styles.css`. No se cambia icono a icono.

## Movimiento

| Caso | Duración | Curva |
|---|---|---|
| Respuesta a un toque (hover, color, pulsar) | 100 ms | `ease-out` |
| Cambios de estado (abrir, mover, cambiar de vista) | 200–300 ms | `ease-brand` |
| Entrada de la portada (una sola vez) | 800 ms | curva de `.hero-rise` |
| Abrir diálogos y overlays | 250 ms (menús: 200 ms) | `ease-brand` |
| Cerrar diálogos y overlays | 150 ms (menús: 100 ms) | `ease-brand` |
| Barras de progreso al cambiar | 500 ms | `ease-brand` |
| Cifra que cambia por una acción (`ValuePulse`) | 220 ms | `ease-brand` |
| Cargas en bucle (`Bars`, skeleton) | continuo | `ease-in-out` |

- Al pulsar: `scale-[0.98]` en botones y `scale-[0.92]` en botones de icono.
- Cerrar siempre más rápido que abrir.
- `ValuePulse` solo en cifras que el usuario acaba de cambiar (agua, pasos, peso, racha). Nunca al cargar la página.
- En CSS escrito a mano usa la curva literal `cubic-bezier(0.32, 0.72, 0, 1)`: `ease-brand` vive en `@theme inline` y no existe como variable en tiempo de ejecución.
- Todo movimiento se desactiva con `prefers-reduced-motion`.
- Nada de rebotes, brillos ni animaciones en bucle decorativas.

## Texto

- Tú, español neutro (vale para España y Latinoamérica: "báscula (o balanza)").
- Frases cortas y concretas. Sin exclamaciones, sin rayas largas (—) y sin promesas que la app no cumple.
- En salud: fuentes verificadas y el aviso "no sustituye el consejo de un profesional de la salud".
