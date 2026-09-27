import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { authClient } from "#/lib/auth-client";

export function LandingNavbar() {
  const { data: session, isPending } = authClient.useSession();
  const signedIn = !isPending && !!session?.user;

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border pt-[env(safe-area-inset-top)]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="font-brand text-lg">Vitta</span>
        </Link>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button asChild className="h-9 rounded-full px-4">
              <Link to={"/dashboard" as string}>Mi inicio</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="h-9 rounded-full px-4">
                <Link to={"/login" as string}>Iniciar sesión</Link>
              </Button>
              <Button asChild className="h-9 rounded-full px-4">
                <Link to={"/register" as string}>Empezar gratis</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;
