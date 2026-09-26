import { ArrowRightIcon } from "@solar-icons/react/outline";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center relative">
        <h1 className="font-display text-4xl sm:text-6xl leading-tight text-balance">
          Registra tu peso en 5 segundos.
          <br />
          <span className="text-primary">Mira tu progreso cada día.</span>
        </h1>
        <p className="mt-5 text-muted-foreground text-lg max-w-md mx-auto text-pretty">
          Peso, agua, pasos, sueño y medidas en un solo lugar. Gratis para
          empezar; Premium es un pago único, sin suscripción.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg" className="h-12 px-6 font-display">
            <Link to={"/register" as string}>
              Empezar gratis <ArrowRightIcon className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-6">
            <Link to={"/login" as string}>Ya tengo cuenta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
