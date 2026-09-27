import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link } from "@tanstack/react-router";
import { LEGAL } from "#/lib/legal";

export function LandingFooter() {
  return (
    <footer className="border-t border-border mt-8">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="font-brand text-base">Vitta</span>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ingfranciscastillo/peso_log"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="text-muted-foreground pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
            >
              <SiGithub className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

        <nav
          aria-label="Enlaces del sitio"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:justify-start"
        >
          <Link
            to="/calculadora-peso-meta"
            className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
          >
            Calculadora de peso meta
          </Link>
          <Link
            to="/calculadora-imc"
            className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
          >
            Calculadora de IMC
          </Link>
          <Link
            to="/guias"
            className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
          >
            Guías
          </Link>
          <Link
            to="/terminos"
            className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
          >
            Términos
          </Link>
          <Link
            to="/privacy"
            className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
          >
            Privacidad
          </Link>
          <Link
            to="/reembolsos"
            className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
          >
            Reembolsos
          </Link>
          <a
            href={`mailto:${LEGAL.email}`}
            className="pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
          >
            Contacto
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default LandingFooter;
