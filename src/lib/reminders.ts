import { queryOptions } from "@tanstack/react-query";
import { getReminderSettings } from "#/lib/reminders.functions";

export const reminderSettingsQuery = () =>
	queryOptions({
		queryKey: ["reminder-settings"] as const,
		queryFn: () => getReminderSettings(),
	});
