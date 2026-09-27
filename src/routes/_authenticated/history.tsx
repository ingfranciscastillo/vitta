import { StarsMinimalisticIcon } from "@solar-icons/react/linear/stars-minimalistic";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { EntryDialog } from "#/components/entry-dialog";
import { HistoryTable } from "#/components/history-table";
import { PaywallDialog } from "#/components/paywall-dialog";
import { useQuickLog } from "#/components/quick-log-context";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { currentUserQuery } from "#/lib/profile";
import { weightEntriesQuery } from "#/lib/weight";
import {
	createWeightEntry,
	deleteWeightEntry,
	updateWeightEntry,
} from "#/lib/weight.functions";
import type { WeightEntry } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/history")({
	loader: ({ context }) => {
		context.queryClient.ensureQueryData(weightEntriesQuery());
		context.queryClient.ensureQueryData(currentUserQuery());
	},
	component: HistoryPage,
});

type EntryPayload = {
	date: string;
	weight: number;
	time?: string;
	note?: string;
};

function HistoryPage() {
	const entries = useSuspenseQuery(weightEntriesQuery()).data!;
	const { open: openQuickLog } = useQuickLog();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const qc = useQueryClient();

	const isPremium = !!me?.isPro;
	const visible = isPremium ? entries : entries.slice(0, 30);
	const limited = !isPremium && entries.length > 30;

	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [editing, setEditing] = useState<WeightEntry | null>(null);
	const [deleting, setDeleting] = useState<WeightEntry | null>(null);
	const [paywallOpen, setPaywallOpen] = useState<boolean>(false);

	const createMut = useMutation({
		mutationFn: (vars: EntryPayload) => createWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro añadido");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
			void qc.invalidateQueries({ queryKey: ["weight-stats"] });
			void qc.invalidateQueries({ queryKey: ["current-goal"] });
		},
		onError: () => {
			toast.error("No se pudo añadir el registro");
		},
	});

	const updateMut = useMutation({
		mutationFn: (vars: { id: string; data: EntryPayload }) =>
			updateWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro actualizado");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
			void qc.invalidateQueries({ queryKey: ["weight-stats"] });
		},
		onError: () => {
			toast.error("No se pudo actualizar el registro");
		},
	});

	const deleteMut = useMutation({
		mutationFn: (vars: { id: string }) => deleteWeightEntry({ data: vars }),
		onSuccess: () => {
			toast.success("Registro eliminado");
			void qc.invalidateQueries({ queryKey: ["weight-entries"] });
			void qc.invalidateQueries({ queryKey: ["weight-stats"] });
		},
		onError: () => {
			toast.error("No se pudo eliminar el registro");
		},
	});

	const handleEdit = (e: WeightEntry) => {
		setEditing(e);
		setDialogOpen(true);
	};

	const handleSubmit = async (payload: EntryPayload) => {
		setDialogOpen(false);
		if (editing?.id) {
			await updateMut.mutateAsync({ id: editing.id, data: payload });
		} else {
			await createMut.mutateAsync(payload);
		}
	};

	const confirmDelete = async () => {
		if (!deleting?.id) return;
		await deleteMut.mutateAsync({ id: deleting.id });
		setDeleting(null);
	};

	return (
		<div className="space-y-4">
			<h1 className="font-display text-xl text-balance">Historial</h1>
			{limited && (
				<button
					type="button"
					onClick={() => setPaywallOpen(true)}
					className="w-full flex items-center gap-2 rounded-2xl bg-accent/20 border border-accent/40 px-4 py-3 text-left"
				>
					<StarsMinimalisticIcon className="w-4 h-4 text-accent-foreground flex-shrink-0" />
					<span className="text-xs flex-1">
						Mostrando tus últimos 30 registros. Desbloquea el historial
						ilimitado con Premium.
					</span>
					<span className="text-xs font-display text-primary">Ver</span>
				</button>
			)}
			<HistoryTable
				entries={visible}
				unit={me.weightUnit}
				onEdit={handleEdit}
				onDelete={setDeleting}
				onCreateFirst={openQuickLog}
			/>
			<EntryDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				initial={editing}
				unit={me.weightUnit}
				onSubmit={handleSubmit}
			/>
			<AlertDialog
				open={!!deleting}
				onOpenChange={(o) => !o && setDeleting(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleteMut.isPending && <Bars className="w-3 h-3 mr-1.5" />}
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<PaywallDialog open={paywallOpen} onOpenChange={setPaywallOpen} />
		</div>
	);
}
