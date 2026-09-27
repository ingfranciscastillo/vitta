import { cn } from "#/lib/utils.ts";

function Bars({
	className,
	bars = 3,
	...props
}: React.ComponentProps<"span"> & { bars?: number }) {
	return (
		<span
			role="status"
			className={cn("inline-flex items-stretch gap-[5%]", className)}
			{...props}
		>
			{Array.from({ length: bars }, (_, index) => (
				<span
					key={index}
					aria-hidden="true"
					className="inline-block h-full rounded-[1px] bg-current"
					style={{
						width: `${100 / bars}%`,
						animation: "loading-ui-wave-bars 1.8s ease-in-out infinite",
						animationDelay: `calc(0.2s * ${index})`,
					}}
				/>
			))}
			<span className="sr-only">Cargando</span>
		</span>
	);
}

export { Bars };
