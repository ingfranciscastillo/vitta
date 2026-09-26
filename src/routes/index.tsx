import {
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import Features from "#/components/landing/features";
import Hero from "#/components/landing/hero";
import LandingFooter from "#/components/landing/landing-footer";
import LandingNavbar from "#/components/landing/landing-navbar";
import PremiumCTA from "#/components/premium-cta";
import { getSession } from "#/lib/auth.functions";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

function Landing() {
  const pathname = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });
  return (
    <div className="min-h-dvh bg-background">
      <LandingNavbar />
      <main key={pathname} className="page-enter">
        <Hero />
        <Features />
        <PremiumCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
