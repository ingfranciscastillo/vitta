import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import toast from "react-hot-toast";
import { Bars } from "#/components/bars";
import { GoalCard } from "#/components/goal-card";
import { GoalStepper } from "#/components/goal-stepper";
import { PremiumGate } from "#/components/premium-gate";
import { TourRunner } from "#/components/tour-runner";
import { GOALS_TOUR_STEPS } from "#/components/tours/goals-tour-steps";
import { Button } from "#/components/ui/button";
import { DatePicker } from "#/components/ui/date-picker";
import { Label } from "#/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { currentGoalQuery } from "#/lib/goals";
import { upsertGoal } from "#/lib/goals.functions";
import { currentUserQuery } from "#/lib/profile";
import { updateProfile } from "#/lib/profile.functions";
import { type Pace, paceLabel } from "#/lib/units";
import { weightEntriesQuery } from "#/lib/weight";
import {
  computeStats,
  fromDisplay,
  GOAL_WEIGHT_MAX_KG,
  GOAL_WEIGHT_MIN_KG,
  toDisplay,
} from "#/lib/weight-utils";

export const Route = createFileRoute("/_authenticated/goals")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(currentGoalQuery());
    context.queryClient.ensureQueryData(weightEntriesQuery());
    context.queryClient.ensureQueryData(currentUserQuery());
  },
  component: GoalsPage,
});

const PACES: ReadonlyArray<Pace> = ["slow", "moderate", "fast"];

function GoalsPage() {
  const { goal, unit } = useSuspenseQuery(currentGoalQuery()).data!;
  const entries = useSuspenseQuery(weightEntriesQuery()).data!;
  const me = useSuspenseQuery(currentUserQuery()).data!;
  const stats = computeStats(entries);
  const qc = useQueryClient();

  const isPremium = !!me?.isPro;

  const [editing, setEditing] = useState<boolean>(!goal);
  const [target, setTarget] = useState<string>(
    goal?.target_weight != null
      ? toDisplay(goal.target_weight, unit).toFixed(1)
      : "",
  );
  const [date, setDate] = useState<string>(goal?.target_date ?? "");
  const [pace, setPace] = useState<Pace>((goal?.pace as Pace) ?? "moderate");

  const waterGoal = me?.waterGoal != null ? Number(me.waterGoal) : 2000;
  const stepsGoal = me?.stepsGoal != null ? Number(me.stepsGoal) : 8000;
  const sleepGoal = me?.sleepGoal != null ? Number(me.sleepGoal) : 8;
  const calorieGoal = me?.calorieGoal != null ? Number(me.calorieGoal) : 2000;
  const proteinGoal = me?.proteinGoal != null ? Number(me.proteinGoal) : 100;
  const carbsGoal = me?.carbsGoal != null ? Number(me.carbsGoal) : 250;
  const fatGoal = me?.fatGoal != null ? Number(me.fatGoal) : 70;

  const [water, setWater] = useState<string>(String(waterGoal));
  const [steps, setSteps] = useState<string>(String(stepsGoal));
  const [sleep, setSleep] = useState<string>(String(sleepGoal));
  const [cal, setCal] = useState<string>(String(calorieGoal));
  const [protein, setProtein] = useState<string>(String(proteinGoal));
  const [carbs, setCarbs] = useState<string>(String(carbsGoal));
  const [fat, setFat] = useState<string>(String(fatGoal));

  const saveWeightMut = useMutation({
    mutationFn: (vars: {
      targetWeight: number;
      targetDate: string | null;
      pace: Pace;
    }) => upsertGoal({ data: vars }),
    onSuccess: async () => {
      toast.success("Objetivo de peso guardado");
      setEditing(false);
      await qc.invalidateQueries({ queryKey: ["current-goal"] });
    },
    onError: () => {
      toast.error("No se pudo guardar el objetivo de peso");
    },
  });

  const saveHabitsMut = useMutation({
    mutationFn: (vars: {
      waterGoal: number;
      stepsGoal: number;
      sleepGoal: number;
    }) =>
      updateProfile({
        data: {
          waterGoal: vars.waterGoal,
          stepsGoal: vars.stepsGoal,
          sleepGoal: vars.sleepGoal,
        },
      }),
    onSuccess: async () => {
      toast.success("Objetivos de hábitos guardados");
      await qc.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: () => {
      toast.error("No se pudieron guardar los hábitos");
    },
  });

  const saveNutritionMut = useMutation({
    mutationFn: (vars: {
      calorieGoal: number;
      proteinGoal: number;
      carbsGoal: number;
      fatGoal: number;
    }) =>
      updateProfile({
        data: {
          calorieGoal: vars.calorieGoal,
          proteinGoal: vars.proteinGoal,
          carbsGoal: vars.carbsGoal,
          fatGoal: vars.fatGoal,
        },
      }),
    onSuccess: async () => {
      toast.success("Objetivos nutricionales guardados");
      await qc.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: () => {
      toast.error("No se pudieron guardar los objetivos nutricionales");
    },
  });

  const saveWeight = () => {
    const kg = fromDisplay(parseFloat(target), unit);
    if (Number.isNaN(kg) || kg < GOAL_WEIGHT_MIN_KG || kg > GOAL_WEIGHT_MAX_KG) {
      const min = Math.ceil(toDisplay(GOAL_WEIGHT_MIN_KG, unit));
      const max = Math.floor(toDisplay(GOAL_WEIGHT_MAX_KG, unit));
      toast.error(`El peso objetivo debe estar entre ${min} y ${max} ${unit}`);
      return;
    }
    saveWeightMut.mutate({
      targetWeight: kg,
      targetDate: date || null,
      pace,
    });
  };

  const saveHabits = () => {
    saveHabitsMut.mutate({
      waterGoal: parseInt(water, 10) || 0,
      stepsGoal: parseInt(steps, 10) || 0,
      sleepGoal: parseFloat(sleep) || 0,
    });
  };

  const saveNutrition = () => {
    saveNutritionMut.mutate({
      calorieGoal: parseInt(cal, 10) || 0,
      proteinGoal: parseFloat(protein) || 0,
      carbsGoal: parseFloat(carbs) || 0,
      fatGoal: parseFloat(fat) || 0,
    });
  };

  const handleCancel = () => {
    setEditing(false);
    if (goal) {
      setTarget(
        goal.target_weight != null
          ? toDisplay(goal.target_weight, unit).toFixed(1)
          : "",
      );
      setDate(goal?.target_date ?? "");
      setPace((goal?.pace as Pace) ?? "moderate");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl text-balance">Objetivos</h1>

      <div
        data-tour="goal-habits"
        className="rounded-2xl bg-card border border-border p-4 space-y-3"
      >
        <div className="font-display text-sm">Hábitos diarios</div>
        <div className="divide-y divide-border">
          <GoalStepper
            label="Agua"
            unit="ml"
            value={water}
            onChange={setWater}
            step={250}
          />
          <GoalStepper
            label="Pasos"
            value={steps}
            onChange={setSteps}
            step={500}
          />
          <GoalStepper
            label="Sueño"
            unit="h"
            value={sleep}
            onChange={setSleep}
            step={0.5}
            decimals={1}
          />
        </div>
        <Button
          type="button"
          onClick={saveHabits}
          disabled={saveHabitsMut.isPending}
          aria-busy={saveHabitsMut.isPending}
          className="w-full h-11 font-display"
        >
          {saveHabitsMut.isPending && <Bars className="w-3 h-3 mr-1.5" />}
          Guardar hábitos
        </Button>
      </div>

      <div data-tour="goal-nutrition">
        {isPremium ? (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="font-display text-sm">Nutrición</div>
            <div className="divide-y divide-border">
              <GoalStepper
                label="Calorías"
                unit="kcal"
                value={cal}
                onChange={setCal}
                step={50}
              />
              <GoalStepper
                label="Proteínas"
                unit="g"
                value={protein}
                onChange={setProtein}
                step={5}
                decimals={1}
              />
              <GoalStepper
                label="Carbohidratos"
                unit="g"
                value={carbs}
                onChange={setCarbs}
                step={5}
                decimals={1}
              />
              <GoalStepper
                label="Grasas"
                unit="g"
                value={fat}
                onChange={setFat}
                step={5}
                decimals={1}
              />
            </div>
            <Button
              type="button"
              onClick={saveNutrition}
              disabled={saveNutritionMut.isPending}
              aria-busy={saveNutritionMut.isPending}
              className="w-full h-11 font-display"
            >
              {saveNutritionMut.isPending && (
                <Bars className="w-3 h-3 mr-1.5" />
              )}
              Guardar nutrición
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="font-display text-sm">Nutrición</div>
            <PremiumGate
              title="Objetivos nutricionales"
              description="Personaliza tus calorías y macros diarias con Premium."
            />
          </div>
        )}
      </div>

      <div data-tour="goal-weight">
        <div className="font-display text-sm text-balance">Peso</div>
        {goal && !editing ? (
          <GoalCard
            goal={goal}
            current={stats.current}
            unit={unit}
            onEdit={() => setEditing(true)}
          />
        ) : (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-4">
            <GoalStepper
              label="Peso objetivo"
              unit={unit}
              value={target}
              onChange={setTarget}
              step={0.1}
              decimals={1}
            />
            <div className="space-y-1.5">
              <Label>Fecha objetivo (opcional)</Label>
              <DatePicker
                id="target-date"
                value={date}
                onChange={(v) => setDate(v ?? "")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ritmo deseado</Label>
              <Select value={pace} onValueChange={(v) => setPace(v as Pace)}>
                <SelectTrigger className="h-11! w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACES.map((p) => (
                    <SelectItem key={p} value={p} className="h-11">
                      {paceLabel(p, unit)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {goal && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 h-11 font-display"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="button"
                onClick={saveWeight}
                disabled={saveWeightMut.isPending}
                aria-busy={saveWeightMut.isPending}
                className="flex-1 h-11 font-display"
              >
                {saveWeightMut.isPending && <Bars className="w-3 h-3 mr-1.5" />}
                Guardar
              </Button>
            </div>
          </div>
        )}
      </div>
      <TourRunner tourId="goals" steps={GOALS_TOUR_STEPS} me={me} />
    </div>
  );
}
