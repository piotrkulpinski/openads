export type TierFeatureType = "positive" | "neutral" | "negative"

const PREFIXES: Record<TierFeatureType, string> = {
  positive: "✓ ",
  neutral: "• ",
  negative: "✗ ",
}

export interface ParsedTierFeature {
  type: TierFeatureType
  label: string
}

export function parseTierFeature(raw: string): ParsedTierFeature {
  for (const type of ["positive", "neutral", "negative"] as TierFeatureType[]) {
    const prefix = PREFIXES[type]
    if (raw.startsWith(prefix)) {
      return { type, label: raw.slice(prefix.length) }
    }
  }
  return { type: "neutral", label: raw }
}

export const TIER_FEATURE_PREFIXES = PREFIXES
