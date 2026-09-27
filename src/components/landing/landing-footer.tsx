import { SiGithub, SiInstagram } from "@icons-pack/react-simple-icons";
import { Link } from "@tanstack/react-router";

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
              href="#"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="text-muted-foreground pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
            >
              <SiInstagram className="w-4.5 h-4.5" />
            </a>

            <a
              href="#"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="text-muted-foreground pointer-fine-hover:text-foreground transition-colors duration-100 ease-out"
            >
              <SiGithub className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
