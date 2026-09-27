import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";

// Confirma visualmente que una cifra cambió por una acción del usuario
// (registrar agua, peso, pasos). No se anima al montar, solo en cambios.
export function ValuePulse({
	value,
	className,
	children,
}: {
	value: unknown;
	className?: string;
	children: ReactNode;
}) {
	const mounted = useRef(false);
	const [tick, setTick] = useState(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: el efecto reacciona solo a cambios de `value`
	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			return;
		}
		setTick((t) => t + 1);
	}, [value]);

	return (
		<span
			key={tick}
			className={cn("inline-block", tick > 0 && "value-pulse", className)}
		>
			{children}
		</span>
	);
}

export default ValuePulse;
