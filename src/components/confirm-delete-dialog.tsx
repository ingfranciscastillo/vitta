import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "#/components/ui/alert-dialog.tsx";
import { Bars } from "./bars";

type ConfirmDeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	title: string;
	description?: string;
	confirmLabel?: string;
	isPending?: boolean;
};

export function ConfirmDeleteDialog({
	open,
	onOpenChange,
	onConfirm,
	title,
	description = "Esta acción no se puede deshacer.",
	confirmLabel = "Eliminar",
	isPending = false,
}: ConfirmDeleteDialogProps) {
	return (
		<AlertDialog
			open={open}
			onOpenChange={(o) => !isPending && onOpenChange(o)}
		>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-balance">{title}</AlertDialogTitle>
					{description ? (
						<AlertDialogDescription className="text-pretty">
							{description}
						</AlertDialogDescription>
					) : null}
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isPending}
						aria-busy={isPending}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{isPending && <Bars className="w-3 h-3 mr-1.5" />}
						{confirmLabel}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
