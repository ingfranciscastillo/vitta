import {
  BoltIcon,
  CrownMinimalisticIcon,
  GraphNewIcon,
} from "@solar-icons/react/linear";
import type { ReactNode } from "react";

// Beneficios reales del producto; sustituyen a testimonios que no existen.
const HIGHLIGHTS = [
  {
    icon: BoltIcon,
    title: "Registra tu peso en 5 segundos",
    description: "Escribe tu peso y guarda. O repite el último con un toque.",
  },
  {
    icon: GraphNewIcon,
    title: "Mira hacia dónde vas",
    description:
      "Tu gráfico de 30 días muestra la tendencia, no solo el dato de hoy.",
  },
  {
    icon: CrownMinimalisticIcon,
    title: "Gratis para empezar",
    description:
      "Peso, agua, pasos, sueño y objetivos sin pagar. Premium es un pago único de $12.99.",
  },
] as const;

type AuthLayoutProps = {
  brandName: string;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthLayout({
  brandName,
  title,
  subtitle,
  footer,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-background">
      {/* Columna izquierda */}
      <div className="hidden lg:flex flex-col items-center border-r border-border bg-muted/30 p-10 xl:p-14">
        <span className="text-center text-lg text-foreground font-brand">
          {brandName}
        </span>

        <div className="flex flex-1 w-full items-center justify-center">
          <ul className="w-full max-w-sm space-y-8">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-4">
                <div className="size-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <h.icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-balance">
                    {h.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 text-pretty">
                    {h.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brandName}. Todos los derechos
          reservados.
        </p>
      </div>

      {/* Columna derecha */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <span className="lg:hidden block text-lg text-foreground mb-8 font-brand">
            {brandName}
          </span>

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground text-balance">
              {title}
            </h1>

            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
            )}
          </div>

          {children}

          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-6 text-pretty">
              {footer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
