type TierFeatureType = "positive" | "neutral" | "negative"

const PREFIXES: Record<TierFeatureType, string> = {
  positive: "✓ ",
  neutral: "• ",
  negative: "✗ ",
}

export const parseTierFeature = (raw: string): { type: TierFeatureType; label: string } => {
  for (const type of ["positive", "neutral", "negative"] as const) {
    const prefix = PREFIXES[type]
    if (raw.startsWith(prefix)) {
      return { type, label: raw.slice(prefix.length) }
    }
  }
  return { type: "neutral", label: raw }
}
