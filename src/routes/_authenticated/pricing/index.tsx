import { ArrowLeftIcon } from "@solar-icons/react/linear";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PaywallContent } from "#/components/paywall-content";
import { currentUserQuery } from "#/lib/profile";

export const Route = createFileRoute("/_authenticated/pricing/")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: PricingPage,
});

function PricingPage() {
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;

	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<div className="w-full max-w-sm">
				<Link
					to="/dashboard"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-4"
				>
					<ArrowLeftIcon className="w-4 h-4" /> Volver
				</Link>
				<div className="rounded-3xl bg-card border border-border p-6">
					<PaywallContent isPro={isPremium} />
				</div>
			</div>
		</div>
	);
}
