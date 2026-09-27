import { NotebookIcon } from "@solar-icons/react/linear";
import { AddIcon } from "@solar-icons/react/linear/add";
import { MinusIcon } from "@solar-icons/react/linear/minus";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "#/components/ui/drawer";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
  fromDisplay,
  nowTimeStr,
  toDisplay,
  todayStr,
  type WeightUnit,
} from "#/lib/weight-utils";

type SavePayload = {
  weight: number;
  date: string;
  time: string;
  note?: string;
};

type QuickLogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lastWeightKg: number | null | undefined;
  unit: WeightUnit;
  onSave: (payload: SavePayload) => void;
  onRepeat: (payload: SavePayload) => void;
};

export function QuickLogDialog({
  open,
  onOpenChange,
  lastWeightKg,
  unit,
  onSave,
  onRepeat,
}: QuickLogDialogProps) {
  const lastDisp =
    lastWeightKg != null ? toDisplay(lastWeightKg, unit).toFixed(1) : "";
  const [val, setVal] = useState<string>(lastDisp);
  const [date, setDate] = useState<string>(todayStr());
  const [time, setTime] = useState<string>(nowTimeStr());
  const [note, setNote] = useState<string>("");
  const [showNote, setShowNote] = useState<boolean>(false);

  const step = (d: number): void => {
    const n = parseFloat(val || "0") || 0;
    setVal(Math.max(0, n + d).toFixed(1));
  };

  const handleSave = (): void => {
    const kg = fromDisplay(parseFloat(val), unit);
    if (Number.isNaN(kg) || kg <= 0) return;
    onSave({ weight: kg, date, time, note: note || undefined });
    onOpenChange(false);
  };

  const handleRepeat = (): void => {
    if (lastWeightKg == null) return;
    onRepeat({
      weight: lastWeightKg,
      date: todayStr(),
      time: nowTimeStr(),
    });
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        key={open ? "open" : "closed"}
        className="rounded-t-3xl max-w-md mx-auto"
      >
        <DrawerHeader className="text-center pb-0">
          <DrawerTitle className="font-display text-lg">
            Registrar peso
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pt-2 space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full size-12 shrink-0"
              onClick={() => step(-0.1)}
              aria-label="Restar 0.1"
            >
              <MinusIcon size={20} className="size-5" />
            </Button>
            <div className="flex items-baseline">
              <Input
                type="text"
                inputMode="decimal"
                value={val}
                onChange={(e) =>
                  setVal(
                    e.target.value.replace(/[^0-9.,]/g, "").replace(",", "."),
                  )
                }
                className="font-display text-4xl text-center tabular-nums border-0 bg-transparent focus-visible:ring-0 w-32 px-0 h-14"
                placeholder="0.0"
              />
              <span className="font-display text-lg text-muted-foreground ml-1">
                {unit}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 shrink-0"
              onClick={() => step(0.1)}
              aria-label="Sumar 0.1"
            >
              <AddIcon size={20} className="size-5" />
            </Button>
          </div>

          <div onPointerDownCapture={(e) => e.stopPropagation()}>
            <FieldGroup className="grid grid-cols-2 gap-3">
              <Field className="min-w-0">
                <FieldLabel
                  htmlFor="weight-date"
                  className="text-[10px] uppercase text-muted-foreground"
                >
                  Fecha
                </FieldLabel>
                <DatePicker
                  id="weight-date"
                  value={date}
                  onChange={(v) => setDate(v ?? "")}
                />
              </Field>
              <Field className="min-w-0">
                <FieldLabel
                  htmlFor="weight-time"
                  className="text-[10px] uppercase text-muted-foreground"
                >
                  Hora
                </FieldLabel>
                <Input
                  id="weight-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-11 w-full min-w-0 appearance-none [-webkit-appearance:none] text-base tabular-nums"
                />
              </Field>
            </FieldGroup>
          </div>

          {showNote ? (
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (opcional)"
              className="h-11"
            />
          ) : (
            <button
              type="button"
              onClick={() => setShowNote(true)}
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <NotebookIcon className="w-3.5 h-3.5" /> Añadir nota
            </button>
          )}
        </div>

        <DrawerFooter className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <Button size="cta"
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl text-sm"
          >
            Guardar
          </Button>
          {lastWeightKg != null && (
            <Button size="cta"
              type="button"
              onClick={handleRepeat}
              variant="secondary"
              className="w-full rounded-xl text-sm"
            >
              Repetir último: {lastDisp} {unit}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default QuickLogDialog;
