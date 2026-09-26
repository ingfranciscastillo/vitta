import { PenIcon } from "@solar-icons/react/outline";
import { Progress } from "#/components/ui/progress";
import {
  computeGoalProgress,
  estimateGoalDate,
  formatDate,
  formatWeight,
  formatWeightValue,
  type Goal,
  type WeightUnit,
} from "#/lib/weight-utils";

type GoalCardProps = {
  goal: Goal | null | undefined;
  current: number | null;
  unit: WeightUnit;
  onEdit: () => void;
};

export function GoalCard({ goal, current, unit, onEdit }: GoalCardProps) {
  if (!goal) return null;
  const target = goal.target_weight;
  if (target == null) return null;
  if (current == null) {
    return (
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-sm">Objetivo</span>
          <button
            type="button"
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Editar objetivo"
          >
            <PenIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] uppercase text-muted-foreground">Meta</div>
        <div className="font-display text-xl text-primary">
          {formatWeightValue(target, unit)} {unit}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Registra tu peso para empezar a medir tu progreso.
        </p>
      </div>
    );
  }
  const start = goal.start_weight ?? current;
  const { pct, status, remaining } = computeGoalProgress(
    start,
    current,
    target,
  );
  const est = estimateGoalDate(current, target, goal.pace ?? "moderate");
  const isDone = status === "completed" || status === "exceeded";

  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm">Objetivo</span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Editar objetivo"
        >
          <PenIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-[10px] uppercase text-muted-foreground">
            Actual
          </div>
          <div className="font-display text-xl">
            {formatWeightValue(current, unit)} {unit}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-muted-foreground">
            Meta
          </div>
          <div className="font-display text-xl text-primary">
            {formatWeightValue(target, unit)} {unit}
          </div>
        </div>
      </div>
      <Progress value={pct} className="h-2 my-2" />

      {isDone ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-green-600">
            {status === "exceeded" ? "¡Meta superada!" : "¡Meta alcanzada!"}
          </span>
          {status === "exceeded" && (
            <span className="text-xs text-green-600">
              {formatWeight(Math.abs(remaining), unit)} por debajo de tu meta
            </span>
          )}
        </div>
      ) : (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{pct.toFixed(0)}% completado</span>
          <span>{formatWeight(Math.abs(remaining), unit)} por recorrer</span>
        </div>
      )}

      {est && !isDone && (
        <div className="text-xs text-muted-foreground mt-2">
          Estimación de llegada:{" "}
          <span className="text-foreground font-medium">{formatDate(est)}</span>
        </div>
      )}
    </div>
  );
}

export default GoalCard;
