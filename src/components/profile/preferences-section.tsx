import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "#/components/theme-provider";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
} from "#/components/ui/combobox";
import { Field } from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import { currentUserQuery } from "#/lib/profile";
import { updateProfile } from "#/lib/profile.functions";
import { UNIT_SYSTEMS, type UnitSystem, unitSystemOf } from "#/lib/units";
import { cn } from "#/lib/utils";

type Theme = "light" | "dark" | "system";

const THEME_OPTIONS: ReadonlyArray<{ id: Theme; label: string }> = [
	{ id: "light", label: "Claro" },
	{ id: "dark", label: "Oscuro" },
	{ id: "system", label: "Sistema" },
];

type TimezoneOption = {
	value: string;
	label: string;
};

const COMMON_TIMEZONES: ReadonlyArray<TimezoneOption> = [
	{ value: "America/Mexico_City", label: "Ciudad de México (UTC-6)" },
	{ value: "America/Bogota", label: "Bogotá (UTC-5)" },
	{ value: "America/Lima", label: "Lima (UTC-5)" },
	{ value: "America/Santo_Domingo", label: "Santo Domingo (UTC-4)" },
	{ value: "America/Santiago", label: "Santiago (UTC-4)" },
	{ value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
	{ value: "America/Montevideo", label: "Montevideo (UTC-3)" },
	{ value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
	{ value: "America/Caracas", label: "Caracas (UTC-4)" },
	{ value: "America/New_York", label: "Nueva York (UTC-5/-4)" },
	{ value: "America/Chicago", label: "Chicago (UTC-6/-5)" },
	{ value: "America/Denver", label: "Denver (UTC-7/-6)" },
	{ value: "America/Los_Angeles", label: "Los Ángeles (UTC-8/-7)" },
	{ value: "America/Tijuana", label: "Tijuana (UTC-8/-7)" },
	{ value: "Europe/Madrid", label: "Madrid (UTC+1/+2)" },
	{ value: "Atlantic/Canary", label: "Canarias (UTC+0/+1)" },
	{ value: "UTC", label: "UTC" },
	{ value: "Europe/London", label: "Londres (UTC+0/+1)" },
	{ value: "Europe/Berlin", label: "Berlín (UTC+1/+2)" },
	{ value: "Asia/Tokyo", label: "Tokio (UTC+9)" },
	{ value: "Asia/Shanghai", label: "Shanghái (UTC+8)" },
	{ value: "Asia/Singapore", label: "Singapur (UTC+8)" },
	{ value: "Australia/Sydney", label: "Sídney (UTC+10/+11)" },
];

function formatTimezoneLabel(tz: string): string {
	const city = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
	try {
		const offset = new Intl.DateTimeFormat("en-US", {
			timeZone: tz,
			timeZoneName: "shortOffset",
		})
			.formatToParts(new Date())
			.find((p) => p.type === "timeZoneName")?.value;
		return offset ? `${city} (${offset})` : city;
	} catch {
		return city;
	}
}

type SegmentedOption<T extends string> = {
	id: T;
	label: string;
	hint?: string;
};

function Segmented<T extends string>({
	label,
	options,
	value,
	onChange,
	disabled,
}: {
	label: string;
	options: ReadonlyArray<SegmentedOption<T>>;
	value: T;
	onChange: (v: T) => void;
	disabled?: boolean;
}) {
	return (
		<fieldset className="flex min-w-0 gap-1.5">
			<legend className="sr-only">{label}</legend>
			{options.map((o) => {
				const active = o.id === value;
				return (
					<button
						key={o.id}
						type="button"
						aria-pressed={active}
						disabled={disabled}
						onClick={() => !active && onChange(o.id)}
						className={cn(
							"flex-1 min-h-11 rounded-lg px-2 py-2 text-xs font-display transition-colors duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
							active
								? "bg-primary text-primary-foreground"
								: "bg-muted text-muted-foreground pointer-fine-hover:text-foreground",
						)}
					>
						<span className="block">{o.label}</span>
						{o.hint && (
							<span className="block text-[10px] font-sans opacity-75">
								{o.hint}
							</span>
						)}
					</button>
				);
			})}
		</fieldset>
	);
}

const UNIT_OPTIONS: ReadonlyArray<SegmentedOption<UnitSystem>> = (
	Object.keys(UNIT_SYSTEMS) as UnitSystem[]
).map((id) => ({
	id,
	label: UNIT_SYSTEMS[id].label,
	hint: UNIT_SYSTEMS[id].hint,
}));

export function PreferencesSection() {
	const qc = useQueryClient();
	const me = useSuspenseQuery(currentUserQuery()).data!;
	const { theme, setTheme } = useTheme();
	const savedTz = me.timezone ?? "UTC";
	const [tz, setTz] = useState<string>(savedTz);

	const unitsMut = useMutation({
		mutationFn: (system: UnitSystem) =>
			updateProfile({
				data: {
					weightUnit: UNIT_SYSTEMS[system].weightUnit,
					heightUnit: UNIT_SYSTEMS[system].heightUnit,
				},
			}),
		onSuccess: async () => {
			toast.success("Unidades actualizadas");
			// La unidad también viaja en el objetivo y en las estadísticas.
			await Promise.all([
				qc.invalidateQueries({ queryKey: ["current-user"] }),
				qc.invalidateQueries({ queryKey: ["current-goal"] }),
				qc.invalidateQueries({ queryKey: ["weight-stats"] }),
			]);
		},
		onError: () => {
			toast.error("No se pudieron cambiar las unidades");
		},
	});

	const tzMut = useMutation({
		mutationFn: (timezone: string) => updateProfile({ data: { timezone } }),
		onSuccess: async () => {
			toast.success("Zona horaria guardada");
			await qc.invalidateQueries({ queryKey: ["current-user"] });
		},
		onError: () => {
			toast.error("No se pudo guardar la zona horaria");
			setTz(savedTz);
		},
	});

	const tzOptions: TimezoneOption[] = COMMON_TIMEZONES.some(
		(o) => o.value === savedTz,
	)
		? [...COMMON_TIMEZONES]
		: [
				{ value: savedTz, label: formatTimezoneLabel(savedTz) },
				...COMMON_TIMEZONES,
			];

	const handleTz = (v: TimezoneOption | null) => {
		if (!v || v.value === tz) return;
		setTz(v.value);
		tzMut.mutate(v.value);
	};

	return (
		<section id="preferencias" className="space-y-3 scroll-mt-20">
			<div className="font-display text-sm">Preferencias</div>
			<div className="rounded-2xl bg-card border border-border p-4 space-y-4">
				<Field>
					<Label>Unidades</Label>
					<Segmented
						label="Unidades"
						options={UNIT_OPTIONS}
						value={unitSystemOf(me.weightUnit)}
						onChange={(s) => unitsMut.mutate(s)}
						disabled={unitsMut.isPending}
					/>
				</Field>
				<Field>
					<Label>Tema</Label>
					<Segmented
						label="Tema"
						options={THEME_OPTIONS}
						value={theme}
						onChange={setTheme}
					/>
				</Field>
				<Field>
					<Label htmlFor="profile-timezone">Zona horaria</Label>
					<Combobox
						value={tzOptions.find((o) => o.value === tz) ?? null}
						onValueChange={handleTz}
						items={tzOptions}
						itemToStringLabel={(item: TimezoneOption) => item.label}
						itemToStringValue={(item: TimezoneOption) => item.value}
					>
						<ComboboxInput
							id="profile-timezone"
							placeholder="Buscar zona horaria…"
							className="w-full"
							disabled={tzMut.isPending}
						/>
						<ComboboxContent>
							<ComboboxList>
								{(item: TimezoneOption) => (
									<ComboboxItem key={item.value} value={item}>
										<ComboboxValue>{item.label}</ComboboxValue>
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
				</Field>
			</div>
		</section>
	);
}
