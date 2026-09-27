import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "#/components/ui/button";
import { Field } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { track } from "#/lib/analytics";
import { currentUserQuery } from "#/lib/profile";
import { updateProfile } from "#/lib/profile.functions";
import {
	getCurrentSubscription,
	getPushSupport,
	notificationPermission,
	PushPermissionError,
	type PushSupport,
	subscribeToPush,
	unsubscribeFromPush,
} from "#/lib/push-client";
import {
	ALL_DAYS,
	DEFAULT_REMINDER_TIME,
	hasDay,
	toggleDay,
	WEEK_DAYS,
} from "#/lib/reminder-schedule";
import { reminderSettingsQuery } from "#/lib/reminders";
import {
	deletePushSubscription,
	savePushSubscription,
	saveWeightReminder,
	sendTestPush,
} from "#/lib/reminders.functions";
import { cn } from "#/lib/utils";

type DeviceState = {
	support: PushSupport;
	permission: NotificationPermission;
	endpoint: string | null;
};

const cityOf = (tz: string) => tz.split("/").pop()?.replace(/_/g, " ") ?? tz;

export function RemindersSection() {
	const qc = useQueryClient();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const settings = useQuery(reminderSettingsQuery());
	// El soporte y el permiso solo existen en el navegador: se leen al montar.
	const [device, setDevice] = useState<DeviceState | null>(null);
	const [time, setTime] = useState(DEFAULT_REMINDER_TIME);
	const [days, setDays] = useState(ALL_DAYS);

	useEffect(() => {
		const support = getPushSupport();
		if (support !== "supported") {
			setDevice({ support, permission: "default", endpoint: null });
			return;
		}
		getCurrentSubscription()
			.catch(() => null)
			.then((sub) =>
				setDevice({
					support,
					permission: notificationPermission(),
					endpoint: sub?.endpoint ?? null,
				}),
			);
	}, []);

	const weight = settings.data?.weight;
	useEffect(() => {
		if (!weight) return;
		setTime(weight.time);
		setDays(weight.days);
	}, [weight]);

	const invalidate = () =>
		qc.invalidateQueries({ queryKey: reminderSettingsQuery().queryKey });

	const saveMut = useMutation({
		mutationFn: (vars: { enabled: boolean; time: string; days: number }) =>
			saveWeightReminder({ data: vars }),
		onSuccess: invalidate,
		onError: () => toast.error("No se pudo guardar el recordatorio"),
	});

	const enableMut = useMutation({
		mutationFn: async () => {
			const subscription = await subscribeToPush();
			await savePushSubscription({ data: subscription });
			await saveWeightReminder({ data: { enabled: true, time, days } });
			// Sin zona horaria real, el aviso llegaría a la hora de UTC.
			const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
			if (me.timezone === "UTC" && deviceTz && deviceTz !== "UTC") {
				await updateProfile({ data: { timezone: deviceTz } });
				await qc.invalidateQueries({ queryKey: ["current-user"] });
			}
			return subscription.endpoint;
		},
		onSuccess: async (endpoint) => {
			setDevice((d) => d && { ...d, permission: "granted", endpoint });
			track("reminder_enabled", { time });
			toast.success("Recordatorio activado");
			await invalidate();
		},
		onError: (error) => {
			if (error instanceof PushPermissionError) {
				setDevice((d) => d && { ...d, permission: notificationPermission() });
				toast.error("Necesitamos tu permiso para enviarte avisos");
				return;
			}
			toast.error("No se pudo activar el recordatorio");
		},
	});

	const disableMut = useMutation({
		mutationFn: async () => {
			await saveWeightReminder({ data: { enabled: false, time, days } });
			const endpoint = await unsubscribeFromPush().catch(() => null);
			if (endpoint) await deletePushSubscription({ data: { endpoint } });
		},
		onSuccess: async () => {
			setDevice((d) => d && { ...d, endpoint: null });
			toast.success("Recordatorio desactivado");
			await invalidate();
		},
		onError: () => toast.error("No se pudo desactivar el recordatorio"),
	});

	const testMut = useMutation({
		mutationFn: () => sendTestPush(),
		onSuccess: ({ delivered }) => {
			if (delivered > 0) toast.success("Aviso de prueba enviado");
			else toast.error("No encontramos ningún dispositivo activo");
		},
		onError: () => toast.error("No se pudo enviar el aviso de prueba"),
	});

	if (!settings.data?.pushAvailable) return null;

	const deviceRegistered =
		!!device?.endpoint &&
		settings.data.deviceEndpoints.includes(device.endpoint);
	const enabledHere = !!weight?.enabled && deviceRegistered;
	const enabledElsewhere =
		!!weight?.enabled &&
		!deviceRegistered &&
		settings.data.deviceEndpoints.length > 0;
	const busy = enableMut.isPending || disableMut.isPending;
	const canToggle =
		device?.support === "supported" && device.permission !== "denied";

	const saveSchedule = (next: { time?: string; days?: number }) => {
		const vars = {
			enabled: enabledHere,
			time: next.time ?? time,
			days: next.days ?? days,
		};
		if (enabledHere) saveMut.mutate(vars);
	};

	return (
		<section id="recordatorios" className="space-y-3 scroll-mt-20">
			<div className="font-display text-sm">Recordatorios</div>
			<div className="rounded-2xl bg-card border border-border p-4 space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<Label htmlFor="reminder-weight">Recordarme pesarme</Label>
						<p className="mt-1 text-xs text-muted-foreground text-pretty">
							Un aviso al día a la hora que elijas. Si ya te pesaste, no te
							molestamos.
						</p>
					</div>
					<Switch
						id="reminder-weight"
						className="mt-0.5"
						checked={enabledHere}
						disabled={!canToggle || busy}
						onCheckedChange={(on) =>
							on ? enableMut.mutate() : disableMut.mutate()
						}
					/>
				</div>

				<DeviceNotice device={device} enabledElsewhere={enabledElsewhere} />

				{enabledHere && (
					<>
						<Field>
							<Label htmlFor="reminder-time">Hora</Label>
							<Input
								id="reminder-time"
								type="time"
								value={time}
								onChange={(e) => {
									setTime(e.target.value);
									if (e.target.value) saveSchedule({ time: e.target.value });
								}}
								className="w-full min-w-0 appearance-none [-webkit-appearance:none] text-base tabular-nums"
							/>
							<p className="text-xs text-muted-foreground">
								Hora de {cityOf(me.timezone)}. Cámbiala en Preferencias si
								viajas.
							</p>
						</Field>
						<fieldset className="space-y-2">
							<legend className="text-sm font-medium">Días</legend>
							<div className="flex gap-1.5">
								{WEEK_DAYS.map((d) => {
									const on = hasDay(days, d.bit);
									return (
										<button
											key={d.bit}
											type="button"
											aria-pressed={on}
											aria-label={d.label}
											onClick={() => {
												const next = toggleDay(days, d.bit);
												// Al menos un día; para ninguno, se apaga el recordatorio.
												if (next === 0) return;
												setDays(next);
												saveSchedule({ days: next });
											}}
											className={cn(
												"flex-1 min-h-11 rounded-lg text-xs font-display transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
												on
													? "bg-primary text-primary-foreground"
													: "bg-muted text-muted-foreground pointer-fine-hover:text-foreground",
											)}
										>
											{d.short}
										</button>
									);
								})}
							</div>
						</fieldset>
						<Button
							type="button"
							variant="outline"
							className="w-full"
							disabled={testMut.isPending}
							onClick={() => testMut.mutate()}
						>
							Enviar aviso de prueba
						</Button>
					</>
				)}
			</div>
		</section>
	);
}

function DeviceNotice({
	device,
	enabledElsewhere,
}: {
	device: DeviceState | null;
	enabledElsewhere: boolean;
}) {
	if (!device) return null;
	const message =
		device.support === "ios-needs-install"
			? "En iPhone, primero agrega Vitta a tu pantalla de inicio (Compartir → Agregar a inicio) y ábrela desde allí."
			: device.support === "unsupported"
				? "Este navegador no permite notificaciones. Prueba con Chrome, Edge, Firefox o Safari."
				: device.permission === "denied"
					? "Bloqueaste las notificaciones de Vitta. Actívalas en los ajustes del navegador o del teléfono y vuelve aquí."
					: enabledElsewhere
						? "Está activo en otro dispositivo. Actívalo también aquí para recibirlo en este."
						: null;
	if (!message) return null;
	return (
		<p className="rounded-xl bg-muted px-3 py-2.5 text-xs text-muted-foreground text-pretty">
			{message}
		</p>
	);
}
