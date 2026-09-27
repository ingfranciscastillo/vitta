import { timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { runDueReminders } from "#/lib/reminders.server";

// Lo llama cron-job.org cada 15 minutos con `Authorization: Bearer
// CRON_SECRET` (el mismo formato que usa el cron de Vercel, por si se cambia).
function authorized(request: Request): boolean {
	const secret = process.env.CRON_SECRET;
	if (!secret) return false;
	const given = Buffer.from(request.headers.get("authorization") ?? "");
	const expected = Buffer.from(`Bearer ${secret}`);
	return given.length === expected.length && timingSafeEqual(given, expected);
}

export const Route = createFileRoute("/api/cron/reminders")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				if (!authorized(request)) {
					return new Response("Unauthorized", { status: 401 });
				}
				const result = await runDueReminders();
				return Response.json(result, {
					headers: { "Cache-Control": "no-store" },
				});
			},
		},
	},
});
