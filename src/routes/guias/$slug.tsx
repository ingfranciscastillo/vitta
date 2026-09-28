import { createFileRoute, notFound } from "@tanstack/react-router";
import { GuideLayout } from "#/components/guides/guide-layout";
import { getGuide } from "#/content/guias";
import { SITE_URL } from "#/lib/site";

const SITE = SITE_URL;

export const Route = createFileRoute("/guias/$slug")({
	// Solo datos serializables: el cuerpo de la guía se resuelve al renderizar.
	loader: ({ params }) => {
		const guide = getGuide(params.slug);
		if (!guide) throw notFound();
		const { Body: _body, ...meta } = guide;
		return meta;
	},
	head: ({ loaderData }) => {
		if (!loaderData) return {};
		const url = `${SITE}/guias/${loaderData.slug}`;
		return {
			meta: [
				{ title: `${loaderData.title} · Vitta` },
				{ name: "description", content: loaderData.description },
				{ property: "og:type", content: "article" },
				{ property: "og:title", content: loaderData.title },
				{ property: "og:description", content: loaderData.description },
				{ property: "og:url", content: url },
				{ name: "twitter:title", content: loaderData.title },
				{ name: "twitter:description", content: loaderData.description },
			],
			links: [{ rel: "canonical", href: url }],
			scripts: [
				{
					type: "application/ld+json",
					children: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Article",
						headline: loaderData.title,
						description: loaderData.description,
						datePublished: loaderData.published,
						dateModified: loaderData.updated,
						inLanguage: "es",
						mainEntityOfPage: url,
						author: { "@type": "Organization", name: "Vitta", url: SITE },
						publisher: { "@type": "Organization", name: "Vitta", url: SITE },
						citation: loaderData.sources.map((s) => s.url),
					}),
				},
			],
		};
	},
	component: GuidePage,
});

function GuidePage() {
	const { slug } = Route.useParams();
	// El loader ya garantizó que existe.
	const guide = getGuide(slug);
	if (!guide) return null;
	return <GuideLayout guide={guide} />;
}
