import {
  CalendarDateIcon,
  CalendarIcon,
  ChartSquareIcon,
  CrownMinimalisticIcon,
  DumbbellIcon,
  HealthIcon,
  HistoryIcon,
  LightbulbIcon,
  MedalRibbonIcon,
  PlateIcon,
  RulerIcon,
  StopwatchIcon,
  TargetIcon,
} from "@solar-icons/react/linear";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/more")({
  component: MorePage,
});

type LinkItem = {
  to:
    | "/goals"
    | "/measurements"
    | "/imc"
    | "/nutrition"
    | "/fasting"
    | "/activity"
    | "/insights"
    | "/weekly-summary"
    | "/history"
    | "/charts"
    | "/calendar"
    | "/statistics"
    | "/achievements"
    | "/pricing";
  label: string;
  icon: typeof TargetIcon;
  featured?: boolean;
};

type Section = {
  title: string;
  items: LinkItem[];
};

const SECTIONS: Section[] = [
  {
    title: "Salud",
    items: [
      { to: "/goals", label: "Objetivos", icon: TargetIcon },
      { to: "/measurements", label: "Medidas", icon: RulerIcon },
      { to: "/imc", label: "IMC", icon: HealthIcon },
      { to: "/nutrition", label: "Nutrición", icon: PlateIcon },
      { to: "/fasting", label: "Ayuno", icon: StopwatchIcon },
      { to: "/activity", label: "Actividad", icon: DumbbellIcon },
    ],
  },
  {
    title: "Seguimiento",
    items: [
      { to: "/insights", label: "Recomendaciones", icon: LightbulbIcon },
      {
        to: "/weekly-summary",
        label: "Resumen semanal",
        icon: CalendarDateIcon,
      },
      { to: "/history", label: "Historial", icon: HistoryIcon },
      { to: "/charts", label: "Gráficos", icon: ChartSquareIcon },
      { to: "/calendar", label: "Calendario", icon: CalendarIcon },
      { to: "/statistics", label: "Estadísticas", icon: ChartSquareIcon },
    ],
  },
  {
    title: "Cuenta",
    items: [
      { to: "/achievements", label: "Logros", icon: MedalRibbonIcon },
      {
        to: "/pricing",
        label: "Premium",
        icon: CrownMinimalisticIcon,
        featured: true,
      },
    ],
  },
];

function MorePage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl text-balance">Más</h1>

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="font-display text-sm text-balance">{section.title}</h2>
          <div className="grid grid-cols-3 gap-3 auto-rows-fr">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    item.featured
                      ? "group relative rounded-2xl border border-accent/40 bg-accent/15 p-4 flex flex-col items-center justify-center gap-2 h-full transition-[transform,background-color] duration-100 ease-out pointer-fine-pointer-fine-hover:bg-muted/50 pointer-fine-hover:scale-[1.015] active:scale-[0.98] motion-reduce:active:scale-100"
                      : "group relative rounded-2xl border border-border bg-card p-4 flex flex-col items-center justify-center gap-2 h-full transition-[transform,background-color] duration-100 ease-out pointer-fine-pointer-fine-hover:bg-muted/50 pointer-fine-hover:scale-[1.015] active:scale-[0.98] motion-reduce:active:scale-100"
                  }
                >
                  <Icon
                    className={
                      item.featured
                        ? "size-6 text-accent-foreground transition-transform group-hover:scale-105"
                        : "size-6 text-primary transition-transform group-hover:scale-105"
                    }
                  />
                  <span className="text-xs text-center font-display wrap-break-word hyphens-auto">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
