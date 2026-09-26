import {
  BoltIcon,
  GraphNewIcon,
  MedalRibbonIcon,
  RulerIcon,
  TargetIcon,
  WalkingIcon,
} from "@solar-icons/react/outline";
import type { ComponentType, SVGProps } from "react";

type SolarIcon = ComponentType<SVGProps<SVGSVGElement>>;

type Feature = {
  icon: SolarIcon;
  title: string;
  desc: string;
};

const features: Feature[] = [
  {
    icon: BoltIcon,
    title: "Registro en segundos",
    desc: "Escribe tu peso y guarda. ¿Mismo peso que ayer? Repítelo con un toque.",
  },
  {
    icon: WalkingIcon,
    title: "Hábitos diarios",
    desc: "Agua, pasos y sueño con un toque, cada uno con su propia meta.",
  },
  {
    icon: TargetIcon,
    title: "Objetivo con fecha estimada",
    desc: "Elige tu peso meta y tu ritmo. Vitta calcula cuándo llegarás.",
  },
  {
    icon: GraphNewIcon,
    title: "Tu tendencia, no solo el dato de hoy",
    desc: "El gráfico de 30 días muestra hacia dónde vas. Con Premium, media móvil y línea de meta.",
  },
  {
    icon: MedalRibbonIcon,
    title: "Rachas y logros",
    desc: "Cada día que registras suma a tu racha. Desbloquea hitos por el camino.",
  },
  {
    icon: RulerIcon,
    title: "Medidas, nutrición y ayuno",
    desc: "Con Premium: cintura y cadera, comidas y macros, ayuno y actividad, junto a tu peso.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="max-w-5xl mx-auto px-4 py-16 scroll-mt-16"
    >
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl text-balance">
          Lo que puedes hacer con Vitta
        </h2>
        <p className="text-muted-foreground mt-2">
          Lo básico es gratis. Lo avanzado, un solo pago.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-2xl bg-card border border-border p-5"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Features;
