import { ShieldKeyholeIcon } from "@solar-icons/react/linear";

function UserNotRegisteredError() {
	return (
		<div className="flex flex-col items-center justify-center min-h-dvh bg-background">
			<div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-sm border border-border">
				<div className="text-center">
					<div className="inline-flex items-center justify-center size-16 mb-6 rounded-full bg-destructive/10">
						<ShieldKeyholeIcon className="w-8 h-8 text-destructive" />
					</div>
					<h1 className="text-3xl font-bold text-foreground mb-4 font-display text-balance">
						Acceso restringido
					</h1>
					<p className="text-muted-foreground mb-8">
						No estás registrado para usar esta aplicación. Contacta al
						administrador para solicitar acceso.
					</p>
					<div className="p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground text-left">
						<p>Si crees que es un error, puedes:</p>
						<ul className="list-disc list-inside mt-2 space-y-1">
							<li>Verificar que has iniciado sesión con la cuenta correcta</li>
							<li>Contactar al administrador para solicitar acceso</li>
							<li>Cerrar sesión y volver a iniciarla</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

export default UserNotRegisteredError;
