import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { CalendarView } from "#/components/calendar-view";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { EntryDialog } from "#/components/entry-dialog";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { currentUserQuery } from "#/lib/profile";
import { weightEntriesQuery } from "#/lib/weight";
import {
	createWeightEntry,
	deleteWeightEntry,
	updateWeightEntry,
} from "#/lib/weight.functions";
import { formatDate, toDisplay, type WeightEntry } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/calendar")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: CalendarPage,
});

type DayEntry = { weight: number; diff: number };
type Selection = { date: string; entry: DayEntry | undefined };

type EntryPayload = {
	date: string;
	weight: number;
	time?: string;
	note?: string;
};

function CalendarPage() {
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const qc = useQueryClient();

	const [selected, setSelected] = useState<Selection | null>(null);
	const [editing, setEditing] = useState<WeightEntry | null>(null);
	const [newDate, setNewDate] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const dialogOpen = !!editing || !!newDate;

	const createMut = useMutation({
		mutationFn: (vars: EntryPayload) => createWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro añadido");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
			void qc.invalidateQueries({ queryKey: ["weight-stats"] });
			void qc.invalidateQueries({ queryKey: ["current-goal"] });
		},
		onError: () => toast.error("No se pudo añadir el registro"),
	});

	const updateMut = useMutation({
		mutationFn: (vars: { id: string; data: EntryPayload }) =>
			updateWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro actualizado");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
			void qc.invalidateQueries({ queryKey: ["weight-stats"] });
		},
		onError: () => toast.error("No se pudo actualizar el registro"),
	});

	const deleteMut = useMutation({
		mutationFn: (vars: { id: string }) => deleteWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro eliminado");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
			void qc.invalidateQueries({ queryKey: ["weight-stats"] });
		},
		onError: () => toast.error("No se pudo eliminar el registro"),
	});

	const handleNew = () => {
		setNewDate(selected?.date ?? null);
		setSelected(null);
	};

	const handleEdit = () => {
		const e = entries.find((x) => x.date === selected?.date);
		if (e) {
			setEditing(e);
		}
		setSelected(null);
	};

	const handleDelete = async () => {
		const e = entries.find((x) => x.date === selected?.date);
		if (e?.id) {
			await deleteMut.mutateAsync({ id: e.id });
		}
		setSelected(null);
		setConfirmDelete(false);
	};

	const handleSubmit = async (payload: EntryPayload) => {
		setEditing(null);
		setNewDate(null);
		if (editing?.id) {
			await updateMut.mutateAsync({ id: editing.id, data: payload });
		} else {
			await createMut.mutateAsync(payload);
		}
	};

	const closeDialog = () => {
		setEditing(null);
		setNewDate(null);
	};

	const selectedEntry =
		selected?.date != null
			? entries.find((x) => x.date === selected.date)
			: undefined;

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Calendario</h1>
			<div className="rounded-2xl bg-card border border-border p-4">
				<CalendarView
					entries={entries}
					unit={me.weightUnit}
					onDayClick={(date, entry) => setSelected({ date, entry })}
				/>
			</div>
			<div className="flex gap-4 text-xs text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<span className="size-3 rounded bg-positive/30" />
					Bajó
				</span>
				<span className="flex items-center gap-1.5">
					<span className="size-3 rounded bg-negative/30" />
					Subió
				</span>
				<span className="flex items-center gap-1.5">
					<span className="size-3 rounded bg-primary/20" />
					Igual
				</span>
			</div>

			<EntryDialog
				open={dialogOpen}
				onOpenChange={(o) => !o && closeDialog()}
				initial={
					editing ?? (newDate ? ({ date: newDate } as WeightEntry) : null)
				}
				unit={me.weightUnit}
				onSubmit={handleSubmit}
			/>

			<Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle className="font-display">
							{selected && formatDate(selected.date)}
						</DialogTitle>
						<DialogDescription>
							{selectedEntry
								? `${toDisplay(selectedEntry.weight, me.weightUnit).toFixed(1)} ${me.weightUnit}${
										selectedEntry.note ? ` · ${selectedEntry.note}` : ""
									}`
								: "Sin registro este día"}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-col gap-2 sm:flex-col">
						{selected?.entry ? (
							<>
								<Button onClick={handleEdit} className="w-full">
									Editar
								</Button>
								<Button
									variant="outline"
									onClick={() => setConfirmDelete(true)}
									className="w-full text-destructive"
								>
									Eliminar
								</Button>
							</>
						) : (
							<Button onClick={handleNew} className="w-full">
								Añadir registro
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<ConfirmDeleteDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				onConfirm={handleDelete}
				title="Eliminar registro"
				description="Se eliminara este registro de peso. Esta accion no se puede deshacer."
				isPending={deleteMut.isPending}
			/>
		</div>
	);
}
