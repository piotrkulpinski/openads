export const ONBOARDING_STEPS = ["workspace", "spot", "plan", "completed"] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]
