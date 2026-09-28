import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "react-hot-toast";
import { PwaRegister } from "#/components/pwa-register";
import { ThemeProvider, ThemeScript } from "#/components/theme-provider";
import {
  UMAMI_DOMAINS,
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
} from "#/lib/analytics";
import { OG_IMAGE, SITE_URL } from "#/lib/site";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      {
        title: "Vitta — Registro de peso, hábitos y bienestar",
      },
      {
        name: "description",
        content:
          "Registra tu peso en 5 segundos y sigue agua, pasos, sueño y medidas en un solo lugar. Gratis para empezar; Premium es un pago único, sin suscripción.",
      },
      { name: "apple-mobile-web-app-title", content: "Vitta" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Vitta" },
      {
        property: "og:title",
        content: "Vitta — Registro de peso, hábitos y bienestar",
      },
      {
        property: "og:description",
        content:
          "Registra tu peso en 5 segundos y mira tu progreso cada día. Gratis para empezar.",
      },
      { property: "og:locale", content: "es_ES" },
      { property: "og:image", content: OG_IMAGE.url },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: OG_IMAGE.width },
      { property: "og:image:height", content: OG_IMAGE.height },
      { property: "og:image:alt", content: OG_IMAGE.alt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE.url },
      { name: "twitter:image:alt", content: OG_IMAGE.alt },
      {
        name: "twitter:title",
        content: "Vitta — Registro de peso, hábitos y bienestar",
      },
      {
        name: "twitter:description",
        content:
          "Registra tu peso en 5 segundos y mira tu progreso cada día. Gratis para empezar.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/logo.png", type: "image/png" },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon-180x180.png",
      },
      // App instalable: public/manifest.webmanifest y public/sw.js.
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      // Analítica sin cookies; solo se carga si hay un sitio configurado.
      ...(UMAMI_WEBSITE_ID
        ? [
            {
              src: UMAMI_SCRIPT_URL,
              defer: true,
              "data-website-id": UMAMI_WEBSITE_ID,
              "data-domains": UMAMI_DOMAINS,
            },
          ]
        : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Vitta",
          url: SITE_URL,
          applicationCategory: "HealthApplication",
          operatingSystem: "Web",
          inLanguage: "es",
          description:
            "Registro de peso, hábitos, ayuno, mediciones y nutrición con tendencias y objetivos.",
          offers: {
            "@type": "Offer",
            price: "12.99",
            priceCurrency: "USD",
            category: "one-time payment",
          },
        }),
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-ES" suppressHydrationWarning>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <Toaster
            position="top-center"
            gutter={8}
            toastOptions={{
              duration: 4000,
              className: "rounded-xl border border-border font-body shadow-sm",
              style: {
                padding: "12px 16px",
                minWidth: "260px",
                maxWidth: "420px",
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
              },
              success: {
                iconTheme: {
                  primary: "hsl(var(--primary))",
                  secondary: "hsl(var(--card))",
                },
              },
              error: {
                className: "rounded-xl border border-destructive shadow-sm",
                style: {
                  background: "hsl(var(--destructive) / 0.1)",
                  color: "hsl(var(--destructive))",
                },
                iconTheme: {
                  primary: "hsl(var(--destructive))",
                  secondary: "hsl(var(--card))",
                },
              },
            }}
          />
          {children}
          <PwaRegister />
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ThemeProvider>

        <Scripts />
      </body>
    </html>
  );
}
