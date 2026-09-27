import { DumbbellIcon, TrashBinTrashIcon } from "@solar-icons/react/linear";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { EmptyState } from "#/components/empty-state";
import { PremiumGate } from "#/components/premium-gate";
import { StatCard } from "#/components/stat-card";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { activitiesQuery } from "#/lib/activities";
import { createActivity, deleteActivity } from "#/lib/activities.functions";
import type { ActivityIntensity } from "#/lib/health-types";
import { activityStats } from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import {
	formatDate,
	nowTimeStr,
	sortByDateDesc,
	todayStr,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/activity")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(activitiesQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: ActivityPage,
});

const INTENSITY: Array<{ id: ActivityIntensity; label: string }> = [
	{ id: "low", label: "Suave" },
	{ id: "medium", label: "Moderada" },
	{ id: "high", label: "Intensa" },
];

function ActivityPage() {
	const activities = useSuspenseQuery(activitiesQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const qc = useQueryClient();

	const stats = useMemo(() => activityStats(activities, 7), [activities]);
	const history = useMemo(
		() => sortByDateDesc(activities).slice(0, 15),
		[activities],
	);

	const [type, setType] = useState<string>("");
	const [duration, setDuration] = useState<string>("");
	const [date, setDate] = useState<string>(todayStr());
	const [intensity, setIntensity] = useState<ActivityIntensity>("medium");
	const [deletingActivity, setDeletingActivity] = useState<{
		id: string;
		type: string;
	} | null>(null);
	const typeInputRef = useRef<HTMLInputElement | null>(null);

	const invalidate = async () => {
		await qc.invalidateQueries({ queryKey: ["activities"] });
	};

	const createMut = useMutation({
		mutationFn: (vars: {
			type: string;
			durationMinutes: number;
			date: string;
			time: string;
			intensity: ActivityIntensity;
		}) =>
			createActivity({
				data: {
					type: vars.type,
					durationMinutes: vars.durationMinutes,
					date: vars.date,
					time: vars.time,
					intensity: vars.intensity,
				},
			}),
		onSuccess: async () => {
			toast.success("Actividad registrada");
			setType("");
			setDuration("");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo registrar la actividad");
		},
	});

	const deleteMut = useMutation({
		mutationFn: (id: string) => deleteActivity({ data: { id } }),
		onSuccess: async () => {
			toast.success("Actividad eliminada");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo eliminar la actividad");
		},
	});

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl text-balance">Actividad</h1>
				<PremiumGate
					title="Actividad física"
					description="Registra entrenamientos, consulta tu historial y tus estadísticas semanales con Premium."
				/>
			</div>
		);
	}

	const handleAdd = () => {
		const d = parseInt(duration, 10);
		if (!type.trim() || Number.isNaN(d) || d <= 0) return;
		createMut.mutate({
			type: type.trim(),
			durationMinutes: d,
			date,
			time: nowTimeStr(),
			intensity,
		});
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Actividad</h1>

			<div className="grid grid-cols-3 gap-3">
				<StatCard
					label="Minutos (7d)"
					value={stats.totalMinutes}
					icon={DumbbellIcon}
				/>
				<StatCard label="Sesiones" value={stats.sessions} />
				<StatCard label="Más frecuente" value={stats.topType || "—"} />
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="font-display text-sm">Registrar actividad</div>
				<Input
					ref={typeInputRef}
					value={type}
					onChange={(e) => setType(e.target.value)}
					placeholder="Tipo (correr, pesas, yoga...)"
				/>
				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase text-muted-foreground">
							Duración (min)
						</Label>
						<Input
							type="number"
							inputMode="numeric"
							value={duration}
							onChange={(e) => setDuration(e.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-[10px] uppercase text-muted-foreground">
							Fecha
						</Label>
						<DatePicker
							id="activity-date"
							value={date}
							onChange={(v) => setDate(v ?? "")}
						/>
					</div>
				</div>
				<div className="space-y-1.5">
					<Label className="text-[10px] uppercase text-muted-foreground">
						Intensidad
					</Label>
					<Select
						value={intensity}
						onValueChange={(v) => setIntensity(v as ActivityIntensity)}
					>
						<SelectTrigger className="w-full">
							<SelectValue>
								{INTENSITY.find((i) => i.id === intensity)?.label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{INTENSITY.map((i) => (
								<SelectItem key={i.id} value={i.id} className="h-11">
									{i.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Button size="cta"
					type="button"
					onClick={handleAdd}
					className="w-full"
					disabled={createMut.isPending}
				>
					Añadir actividad
				</Button>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="font-display text-sm mb-2">Historial</div>
				{history.length === 0 ? (
					<EmptyState
						icon={<DumbbellIcon className="size-6" />}
						title="Sin actividades registradas"
						description="Registra tu primera actividad para ver tu progreso aquí."
						action={{
							label: "Añadir actividad",
							onClick: () => typeInputRef.current?.focus(),
						}}
					/>
				) : (
					<div className="space-y-2">
						{history.map((a) => (
							<div
								key={a.id ?? `${a.date}-${a.type}-${a.time}`}
								className="flex items-center justify-between text-sm"
							>
								<div>
									<div className="font-medium">{a.type}</div>
									<div className="text-xs text-muted-foreground">
										{formatDate(a.date)} · {a.durationMinutes} min
										{a.intensity
											? ` · ${INTENSITY.find((i) => i.id === a.intensity)?.label ?? a.intensity}`
											: ""}
									</div>
								</div>
								<button
									type="button"
									onClick={() =>
										a.id && setDeletingActivity({ id: a.id, type: a.type })
									}
									className="text-muted-foreground hover:text-destructive"
									aria-label="Eliminar"
								>
									<TrashBinTrashIcon className="w-4 h-4" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
			<ConfirmDeleteDialog
				open={deletingActivity !== null}
				onOpenChange={(o) => !o && setDeletingActivity(null)}
				onConfirm={() => {
					if (deletingActivity) deleteMut.mutate(deletingActivity.id);
					setDeletingActivity(null);
				}}
				title="Eliminar actividad"
				description={`Se eliminará "${deletingActivity?.type ?? ""}". Esta acción no se puede deshacer.`}
				isPending={deleteMut.isPending}
			/>
		</div>
	);
}
