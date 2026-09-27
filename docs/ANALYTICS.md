# Plan de medición de Vitta

- **Herramienta**: Umami Cloud (plan Hobby): sin cookies, sin datos personales.
- **Configuración**: `VITE_UMAMI_WEBSITE_ID` y `VITE_UMAMI_DOMAINS` (por defecto `vitta.app`). Sin identificador no se carga nada, y fuera de esos dominios no se cuenta.
- **Código**: `src/lib/analytics.ts` (`track`, `ctaAttributes`, `useTrackOnFirstChange`).
- **Última actualización**: 2026-09-27

## Reglas

1. Cada evento responde a una pregunta. Si no cambia una decisión, no se mide.
2. Nombres en formato `objeto_acción`, en minúsculas con guion bajo.
3. **Nunca datos personales ni de salud** en eventos: nada de email, peso, medidas ni notas.
4. La analítica nunca rompe la app: `track` no hace nada si Umami no cargó (bloqueadores, desarrollo).

## Eventos

| Evento | Pregunta que responde | Propiedades | Dónde se dispara |
|---|---|---|---|
| (visita) | ¿Qué páginas atraen tráfico? | automáticas | Umami, en cada página |
| `cta_clicked` | ¿Qué botón "Empezar gratis" convierte mejor? | `location`: nav, hero, cta_final, calc_peso_meta, calc_imc, guide | Clic en `StartFreeButton` y en la barra de navegación |
| `calculator_used` | ¿Las calculadoras se usan o solo se visitan? | `tool`: peso_meta, imc | Primer cambio de un valor en la calculadora (una vez por visita) |
| `signup_completed` | ¿Cuántos se registran con email? ¿Los que vienen de una calculadora se registran más? | `method`: email, `prefilled` | Registro por email completado |
| `onboarding_step_completed` | ¿En qué paso se abandona el onboarding? | `step`: units, weight, height, goal | Al completar un paso (no al saltarlo) |
| `onboarding_finished` | ¿Cuántos terminan y cuántos omiten? | `skipped` | Al salir de `/welcome` |
| `weight_logged` | Activación: ¿registran su primer peso? | `first` | Registro rápido de peso |
| `import_completed` | ¿Llegan usuarios de otras apps? | `source`: vitta, libra, csv, `rows` | Importación guardada |
| `checkout_started` | ¿Cuántos intentan comprar? | (ninguna) | Clic en comprar Premium |
| `purchase_completed` | ¿Cuántos compran? | `revenue`, `currency` | Página de pago completado (una vez por sesión) |

## Embudos a crear en Umami

1. **Calculadora a registro**: visita a calculadora, `calculator_used`, `cta_clicked` (calc_*), `signup_completed`.
2. **Activación**: `signup_completed`, `onboarding_step_completed` (weight), `onboarding_finished`, `weight_logged`.
3. **Compra**: `checkout_started`, `purchase_completed`.

## Limitaciones conocidas

- El registro con Google no dispara `signup_completed`: el usuario vuelve desde Google directo a `/welcome`. Se cuenta a través del embudo de onboarding.
- `purchase_completed` depende de que la persona llegue a la página de éxito; la fuente de verdad de ingresos es Dodo Payments.
