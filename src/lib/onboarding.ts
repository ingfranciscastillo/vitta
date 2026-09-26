// El onboarding no guarda estado propio: lo que falta se deduce de los datos.

export type OnboardingStep = "units" | "weight" | "height" | "goal" | "done";

export type ProfileGaps = {
	weight: boolean;
	height: boolean;
	goal: boolean;
};

export const profileGaps = ({
	height,
	entryCount,
	hasGoal,
}: {
	height: string | number | null | undefined;
	entryCount: number;
	hasGoal: boolean;
}): ProfileGaps => ({
	weight: entryCount === 0,
	height: !height || Number(height) <= 0,
	goal: !hasGoal,
});

export const hasProfileGaps = (gaps: ProfileGaps): boolean =>
	gaps.weight || gaps.height || gaps.goal;

// Las unidades siempre se preguntan: no hay forma de saber si el valor por
// defecto fue una elección. Es un solo toque.
export const onboardingSteps = (gaps: ProfileGaps): OnboardingStep[] => [
	"units",
	...(gaps.weight ? (["weight"] as const) : []),
	...(gaps.height ? (["height"] as const) : []),
	...(gaps.goal ? (["goal"] as const) : []),
	"done",
];

export const PROFILE_CARD_DISMISSED_KEY = "vitta:profile-card-dismissed";
