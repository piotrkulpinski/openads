export const ONBOARDING_STEPS = ["welcome", "workspace", "spot", "stripe", "completed"] as const

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]
