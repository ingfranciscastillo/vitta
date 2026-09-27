import {
	GraphUpIcon,
	InfoCircleIcon,
	MedalRibbonIcon,
	PlayIcon,
	StopIcon,
	StopwatchIcon,
} from "@solar-icons/react/linear";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { EmptyState } from "#/components/empty-state";
import { PremiumGate } from "#/components/premium-gate";
import { StatCard } from "#/components/stat-card";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Label } from "#/components/ui/label";
import {
	TimePicker,
	TimePickerInput,
	TimePickerInputGroup,
} from "#/components/ui/time-picker";
import { fastsQuery } from "#/lib/fasts";
import { createFast, updateFast } from "#/lib/fasts.functions";
import {
	fastElapsedMinutes,
	fastElapsedSeconds,
	fastStats,
	metricExplanations,
} from "#/lib/health-utils";
import { currentUserQuery } from "#/lib/profile";
import {
	combineDateTime,
	formatDate,
	formatDateInTimeZone,
	parseLocalDateTime,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/fasting")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(fastsQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: FastingPage,
});

function formatDuration(mins: number): string {
	const h = Math.floor(mins / 60);
	const m = Math.floor(mins % 60);
	return `${h}h ${m}m`;
}

function formatClock(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function FastingPage() {
	const fasts = useSuspenseQuery(fastsQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const isPremium = !!me?.isPro;
	const qc = useQueryClient();

	const stats = fastStats(fasts);
	const [, setTick] = useState<number>(0);
	const [mStartDate, setMStartDate] = useState<string>("");
	const [mStartTime, setMStartTime] = useState<string>("");
	const [mEndDate, setMEndDate] = useState<string>("");
	const [mEndTime, setMEndTime] = useState<string>("");
	const startButtonRef = useRef<HTMLButtonElement | null>(null);

	const mDuration = useMemo(() => {
		const startStr = combineDateTime(mStartDate, mStartTime);
		const endStr = combineDateTime(mEndDate, mEndTime);
		if (!startStr || !endStr) return null;
		const startD = new Date(startStr);
		const endD = new Date(endStr);
		if (Number.isNaN(startD.getTime()) || Number.isNaN(endD.getTime()))
			return null;
		if (endD <= startD) return null;
		return Math.max(0, (endD.getTime() - startD.getTime()) / 60000);
	}, [mStartDate, mStartTime, mEndDate, mEndTime]);

	const completed = fasts
		.filter((f) => f.status === "completed")
		.sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? ""));

	useEffect(() => {
		if (!stats.active) return;
		const id = setInterval(() => setTick((t) => t + 1), 1000);
		return () => clearInterval(id);
	}, [stats.active]);

	const invalidate = async () => {
		await qc.invalidateQueries({ queryKey: ["fasts"] });
	};

	const startMut = useMutation({
		mutationFn: () =>
			createFast({
				data: {
					status: "active",
					startedAt: new Date().toISOString(),
				},
			}),
		onSuccess: async () => {
			toast.success("Ayuno iniciado");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo iniciar el ayuno");
		},
	});

	const stopMut = useMutation({
		mutationFn: (vars: {
			id: string;
			endedAt: string;
			durationMinutes: number;
		}) =>
			updateFast({
				data: {
					id: vars.id,
					status: "completed",
					endedAt: vars.endedAt,
					durationMinutes: vars.durationMinutes,
				},
			}),
		onSuccess: async (_data, vars) => {
			toast.success(
				`Ayuno finalizado · ${formatDuration(vars.durationMinutes)}`,
			);
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo finalizar el ayuno");
		},
	});

	const manualMut = useMutation({
		mutationFn: (vars: {
			startedAt: string;
			endedAt: string;
			durationMinutes: number;
		}) =>
			createFast({
				data: {
					status: "completed",
					startedAt: vars.startedAt,
					endedAt: vars.endedAt,
					durationMinutes: vars.durationMinutes,
				},
			}),
		onSuccess: async (_res, vars) => {
			toast.success(
				`Ayuno registrado · ${formatDuration(vars.durationMinutes)}`,
			);
			setMStartDate("");
			setMStartTime("");
			setMEndDate("");
			setMEndTime("");
			await invalidate();
		},
		onError: () => {
			toast.error("No se pudo registrar el ayuno");
		},
	});

	if (!isPremium) {
		return (
			<div className="space-y-4">
				<h1 className="font-display text-xl text-balance">Ayuno</h1>
				<PremiumGate
					title="Ayuno intermitente"
					description="Inicia ayunos con timer en vivo, registra tu historial y consulta información con Premium."
				/>
			</div>
		);
	}

	const elapsed = stats.active ? fastElapsedSeconds(stats.active) : 0;

	const handleStart = () => {
		startMut.mutate();
	};

	const handleStop = () => {
		if (!stats.active?.id) return;
		const now = new Date().toISOString();
		const mins = fastElapsedMinutes(stats.active);
		stopMut.mutate({
			id: stats.active.id,
			endedAt: now,
			durationMinutes: mins,
		});
	};

	const handleSaveManual = () => {
		const startStr = combineDateTime(mStartDate, mStartTime);
		const endStr = combineDateTime(mEndDate, mEndTime);
		if (!startStr || !endStr) return;
		const startD = parseLocalDateTime(startStr);
		const endD = parseLocalDateTime(endStr);
		if (!startD || !endD) {
			toast.error("Fecha u hora inválida");
			return;
		}
		if (endD <= startD) {
			toast.error("La hora de fin debe ser posterior a la de inicio");
			return;
		}
		const mins = Math.round((endD.getTime() - startD.getTime()) / 60000);
		manualMut.mutate({
			startedAt: startD.toISOString(),
			endedAt: endD.toISOString(),
			durationMinutes: mins,
		});
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Ayuno</h1>

			<div className="rounded-3xl bg-primary text-primary-foreground p-6 text-center">
				<StopwatchIcon className="w-6 h-6 mx-auto mb-2 opacity-80" />
				{stats.active ? (
					<>
						<div className="font-display text-4xl tabular-nums">
							{formatClock(elapsed)}
						</div>
						<div className="text-xs opacity-70 mt-2">Ayuno en curso</div>
						<Button size="cta"
							type="button"
							onClick={handleStop}
							variant="secondary"
							className="mt-4"
							disabled={stopMut.isPending}
						>
							<StopIcon className="w-4 h-4 mr-2" /> Finalizar ayuno
						</Button>
					</>
				) : (
					<>
						<div className="font-display text-lg opacity-80">
							Sin ayuno activo
						</div>
						<Button size="cta"
							ref={startButtonRef}
							type="button"
							onClick={handleStart}
							className="mt-4"
							disabled={startMut.isPending}
						>
							<PlayIcon className="w-4 h-4 mr-2" /> Iniciar ayuno
						</Button>
					</>
				)}
			</div>

			<div className="rounded-2xl bg-card border border-border p-4 space-y-3">
				<div className="font-display text-sm">Registrar ayuno manual</div>

				<div className="space-y-1.5">
					<Label className="text-[10px] uppercase text-muted-foreground">
						Hora de inicio
					</Label>
					<div className="grid grid-cols-[1fr_auto] gap-2">
						<DatePicker
							id="fast-manual-start-date"
							value={mStartDate}
							onChange={(v) => setMStartDate(v ?? "")}
							className="h-11"
						/>
						<TimePicker
							id="fast-manual-start-time"
							value={mStartTime}
							onValueChange={setMStartTime}
							className="w-[110px]"
						>
							<TimePickerInputGroup>
								<TimePickerInput segment="hour" />
								<span className="text-muted-foreground">:</span>
								<TimePickerInput segment="minute" />
								<TimePickerInput segment="period" />
							</TimePickerInputGroup>
						</TimePicker>
					</div>
				</div>

				<div className="space-y-1.5">
					<Label className="text-[10px] uppercase text-muted-foreground">
						Hora de fin
					</Label>
					<div className="grid grid-cols-[1fr_auto] gap-2">
						<DatePicker
							id="fast-manual-end-date"
							value={mEndDate}
							onChange={(v) => setMEndDate(v ?? "")}
							className="h-11"
						/>
						<TimePicker
							id="fast-manual-end-time"
							value={mEndTime}
							onValueChange={setMEndTime}
							className="w-[110px]"
						>
							<TimePickerInputGroup>
								<TimePickerInput segment="hour" />
								<span className="text-muted-foreground">:</span>
								<TimePickerInput segment="minute" />
								<TimePickerInput segment="period" />
							</TimePickerInputGroup>
						</TimePicker>
					</div>
				</div>

				{mDuration != null && (
					<div className="text-sm text-muted-foreground">
						Duración:{" "}
						<span className="font-medium text-foreground">
							{formatDuration(mDuration)}
						</span>
					</div>
				)}

				<Button size="cta"
					type="button"
					onClick={handleSaveManual}
					disabled={
						!mStartDate ||
						!mStartTime ||
						!mEndDate ||
						!mEndTime ||
						manualMut.isPending
					}
					className="w-full"
				>
					{manualMut.isPending && <Bars className="w-3 h-3 mr-1.5" />} Guardar
					ayuno
				</Button>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<StatCard
					label="Ayunos"
					value={stats.completed}
					icon={MedalRibbonIcon}
				/>
				<StatCard
					label="Promedio"
					value={stats.completed ? formatDuration(stats.avgDuration) : "—"}
					icon={GraphUpIcon}
				/>
				<StatCard
					label="Mejor"
					value={stats.longest ? formatDuration(stats.longest) : "—"}
					icon={MedalRibbonIcon}
				/>
			</div>

			<div className="rounded-2xl bg-card border border-border p-4">
				<div className="font-display text-sm mb-2">Historial</div>
				{completed.length === 0 ? (
					<EmptyState
						icon={<StopwatchIcon className="size-6" />}
						title="Aún no has completado ayunos"
						description="Inicia tu primer ayuno para empezar a registrar tu historial."
						action={{
							label: "Iniciar ayuno",
							onClick: handleStart,
						}}
					/>
				) : (
					<div className="space-y-1.5">
						{completed.slice(0, 10).map((f) => (
							<div
								key={f.id ?? `${f.startedAt}-${f.endedAt}`}
								className="flex items-center justify-between text-sm"
							>
								<span className="text-muted-foreground">
									{f.endedAt
										? formatDate(
												formatDateInTimeZone(
													f.endedAt,
													me?.timezone ?? undefined,
												),
											)
										: "—"}
								</span>
								<span className="font-medium">
									{formatDuration(f.durationMinutes ?? 0)}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			<div className="rounded-2xl bg-muted/50 border border-border p-4 flex gap-2.5">
				<InfoCircleIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
				<p className="text-xs text-muted-foreground text-pretty">
					{metricExplanations.fasting}
				</p>
			</div>
		</div>
	);
}
