import {
  AltArrowRightIcon,
  CrownMinimalisticIcon,
  Logout2Icon,
  QuestionCircleIcon,
  RestartIcon,
  ShieldIcon,
} from "@solar-icons/react/linear";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { ConfirmDeleteDialog } from "#/components/confirm-delete-dialog";
import { ExportImport } from "#/components/export-import";
import { PreferencesSection } from "#/components/profile/preferences-section";
import { SecuritySection } from "#/components/profile/security-section";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { authClient } from "#/lib/auth-client";
import { currentUserQuery } from "#/lib/profile";
import {
  deleteAllMyData,
  importEntries,
  updateProfile,
} from "#/lib/profile.functions";
import {
  type HeightUnit,
  lengthFromDisplay,
  lengthToDisplay,
  lengthUnitLabel,
  lengthUnitOf,
} from "#/lib/units";
import { weightEntriesQuery } from "#/lib/weight";
import type { WeightUnit } from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(currentUserQuery());
    context.queryClient.ensureQueryData(weightEntriesQuery());
  },
  component: ProfilePage,
});

type Sex = "male" | "female" | "other";

// Radix no pinta el valor elegido tras el render en servidor; se pasa explícito.
const SEX_LABELS: Record<Sex, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

function ProfilePage() {
  const me = useSuspenseQuery(currentUserQuery()).data!;

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.assign("/");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="size-12 shrink-0 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-display text-lg">
          {me.name.trim().charAt(0).toUpperCase() || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl truncate">{me.name}</h1>
          <p className="text-xs text-muted-foreground truncate">{me.email}</p>
        </div>
        {me.isPro && (
          <Badge className="shrink-0 gap-1">
            <CrownMinimalisticIcon className="size-3" />
            Premium
          </Badge>
        )}
      </header>

      {/* Remonta al cambiar de unidades para recalcular la altura mostrada. */}
      <PersonalSection
        key={me.weightUnit}
        initial={{
          name: me.name,
          sex: me.sex ?? null,
          birthDate: me.birthDate ?? null,
          heightCm: me.height ? Number(me.height) : null,
          heightUnit: lengthUnitOf(me.weightUnit),
        }}
      />
      <PreferencesSection />
      <SecuritySection />
      <DataSection isPremium={!!me.isPro} unit={me.weightUnit} />
      <HelpSection />

      <Button
        type="button"
        variant="destructive-outline"
        size="cta"
        onClick={handleLogout}
        className="w-full"
      >
        <Logout2Icon className="size-5" />
        Cerrar sesión
      </Button>
    </div>
  );
}

type PersonalInitial = {
  name: string;
  sex: Sex | null;
  birthDate: string | null;
  heightCm: number | null;
  heightUnit: HeightUnit;
};

function PersonalSection({ initial }: { initial: PersonalInitial }) {
  const qc = useQueryClient();
  const unitLabel = lengthUnitLabel(initial.heightUnit);

  const [name, setName] = useState<string>(initial.name);
  const [sex, setSex] = useState<Sex | "">(initial.sex ?? "");
  const [birth, setBirth] = useState<string>(initial.birthDate ?? "");
  const [height, setHeight] = useState<string>(
    initial.heightCm
      ? String(
          Math.round(lengthToDisplay(initial.heightCm, initial.heightUnit)),
        )
      : "",
  );

  const saveMutation = useMutation({
    mutationFn: (vars: {
      name?: string;
      sex?: Sex;
      birthDate?: string;
      height?: number;
    }) => updateProfile({ data: vars }),
    onSuccess: async () => {
      toast.success("Perfil guardado");
      await qc.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: () => {
      toast.error("No se pudo guardar el perfil");
    },
  });

  const save = () => {
    const heightCm = lengthFromDisplay(
      parseFloat(height) || 0,
      initial.heightUnit,
    );
    saveMutation.mutate({
      name: name || undefined,
      sex: sex || undefined,
      birthDate: birth || undefined,
      height: heightCm || undefined,
    });
  };

  return (
    <section className="space-y-3">
      <div className="font-display text-sm">Tus datos</div>
      <div className="space-y-3 rounded-2xl bg-card border border-border p-4">
        <Field>
          <Label htmlFor="profile-name">Nombre</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
           
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label>Sexo</Label>
            <Select value={sex || undefined} onValueChange={(v) => setSex(v as Sex)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar">
                  {sex ? SEX_LABELS[sex] : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male" className="h-11">
                  Masculino
                </SelectItem>
                <SelectItem value="female" className="h-11">
                  Femenino
                </SelectItem>
                <SelectItem value="other" className="h-11">
                  Otro
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <Label htmlFor="profile-height">Altura ({unitLabel})</Label>
            <Input
              id="profile-height"
              type="number"
              inputMode="decimal"
              
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Fecha de nacimiento</FieldLabel>
          <DatePicker
            id="birth-date"
            value={birth}
            onChange={(v) => setBirth(v ?? "")}
            captionLayout="dropdown"
          />
        </Field>
        <Button size="cta"
          type="button"
          onClick={save}
          disabled={saveMutation.isPending}
          aria-busy={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
          Guardar datos
        </Button>
      </div>
    </section>
  );
}

function DataSection({
  isPremium,
  unit,
}: {
  isPremium: boolean;
  unit: WeightUnit;
}) {
  const qc = useQueryClient();
  const entries = useSuspenseQuery(weightEntriesQuery()).data!;
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  const refreshWeightData = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ["weight-entries"] }),
      qc.invalidateQueries({ queryKey: ["weight-stats"] }),
      qc.invalidateQueries({ queryKey: ["current-goal"] }),
    ]);

  const importMutation = useMutation({
    mutationFn: (
      data: Array<{
        date: string;
        weight: number;
        time?: string | null;
        note?: string | null;
      }>,
    ) => importEntries({ data }),
    onSuccess: async (res) => {
      toast.success(
        res.skipped > 0
          ? `${res.inserted} registros importados (${res.skipped} ya los tenías)`
          : `${res.inserted} registros importados`,
      );
      await refreshWeightData();
    },
    onError: () => {
      toast.error("No se pudieron importar los registros");
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => deleteAllMyData(),
    onSuccess: async () => {
      toast.success("Datos eliminados");
      await refreshWeightData();
    },
    onError: () => {
      toast.error("No se pudieron eliminar los datos");
    },
  });

  return (
    <section id="datos" className="space-y-3 scroll-mt-20">
      <div className="font-display text-sm">Datos</div>
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <p className="text-xs text-muted-foreground text-pretty">
          {entries.length} registros de peso. Exporta en CSV o JSON. Para importar,
          sirve un CSV o JSON de Vitta, de Libra o de cualquier app con
          columnas de fecha y peso.
        </p>
        <ExportImport
          entries={entries}
          onImport={(data) => importMutation.mutate(data)}
          canExport={isPremium}
          defaultUnit={unit}
        />
        <Button
          type="button"
          variant="destructive-outline"
          size="cta"
          onClick={() => setConfirmDeleteAll(true)}
          disabled={deleteAllMutation.isPending}
          aria-busy={deleteAllMutation.isPending}
          className="w-full"
        >
          {deleteAllMutation.isPending && <Bars className="w-3 h-3 mr-1.5" />}
          Eliminar todos mis datos
        </Button>
        <ConfirmDeleteDialog
          open={confirmDeleteAll}
          onOpenChange={setConfirmDeleteAll}
          onConfirm={() => deleteAllMutation.mutate()}
          title="Eliminar todos mis datos"
          description="Se eliminarán todos tus registros de peso y tu objetivo. Esta acción no se puede deshacer."
        />
      </div>
    </section>
  );
}

const rowClass =
  "flex items-center gap-3 w-full min-h-12 px-4 py-3 text-sm text-left transition-colors duration-100 ease-out pointer-fine-hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

function HelpSection() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const resetTourMut = useMutation({
    mutationFn: () => updateProfile({ data: { completedTours: "" } }),
    onSuccess: async () => {
      toast.success("Tour reiniciado");
      await qc.invalidateQueries({ queryKey: ["current-user"] });
      navigate({ to: "/dashboard" });
    },
    onError: () => {
      toast.error("No se pudo reiniciar el tour");
    },
  });

  return (
    <section className="space-y-3">
      <div className="font-display text-sm">Ayuda</div>
      <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
        <Link to="/support" className={rowClass}>
          <QuestionCircleIcon className="size-5 text-primary shrink-0" />
          <span className="flex-1">Soporte</span>
          <AltArrowRightIcon className="size-4 text-muted-foreground" />
        </Link>
        <button
          type="button"
          onClick={() => resetTourMut.mutate()}
          disabled={resetTourMut.isPending}
          aria-busy={resetTourMut.isPending}
          className={rowClass}
        >
          <RestartIcon className="size-5 text-primary shrink-0" />
          <span className="flex-1">Ver el tour de nuevo</span>
          {resetTourMut.isPending && <Bars className="w-3 h-3" />}
        </button>
        <Link to="/privacy" className={rowClass}>
          <ShieldIcon className="size-5 text-primary shrink-0" />
          <span className="flex-1">Privacidad</span>
          <AltArrowRightIcon className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </section>
  );
}
