/**
 * Paradigm Home Health — Location & Region Configuration
 */

export const REGIONS = {
  ETX: ['Tyler', 'Longview'],
  DFW: ['Plano', 'Fort Worth'],
  CTX: ['Whitney', 'Temple', 'Cedar Park'],
  WTX: ['San Angelo', 'Abilene'],
  Remote: ['Remote'],
} as const

export type RegionKey = keyof typeof REGIONS

export const ALL_LOCATIONS = [
  'Tyler', 'Longview', 'Plano', 'Fort Worth', 'Whitney',
  'Temple', 'Cedar Park', 'San Angelo', 'Abilene', 'Remote'
]

export function getRegionForLocation(location: string): RegionKey | null {
  for (const [region, locations] of Object.entries(REGIONS)) {
    if ((locations as readonly string[]).includes(location)) {
      return region as RegionKey
    }
  }
  return null
}

/**
 * Alias map for normalizing variant spellings to canonical location names.
 * Keys are looked up after lowercasing and stripping non-alphanumerics, so
 * "Ft. Worth", "FT WORTH", "ft.worth", "Fort Worth", "Keller" all collapse
 * to the same key and resolve to "Fort Worth".
 */
const LOCATION_ALIASES: Record<string, string> = {
  // Fort Worth + variants (Keller is a suburb where the office sits)
  fortworth: 'Fort Worth',
  ftworth: 'Fort Worth',
  keller: 'Fort Worth',
  ftworthkeller: 'Fort Worth',
  fortworthkeller: 'Fort Worth',
}

// Build canonical lookups for ALL_LOCATIONS so each one is self-aliasing
// (case/punctuation insensitive) without having to list every variant.
for (const loc of ALL_LOCATIONS) {
  const key = loc.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!LOCATION_ALIASES[key]) LOCATION_ALIASES[key] = loc
}

/**
 * Normalize an arbitrary office-location string to a canonical name.
 * - Empty / null / whitespace-only → "Remote"
 * - Known aliases (case/punctuation insensitive) → canonical name
 * - Unknown values → returned as-is (trimmed), so they still appear in the
 *   directory rather than vanishing.
 */
export function normalizeLocation(raw?: string | null): string {
  if (!raw) return 'Remote'
  const trimmed = raw.trim()
  if (!trimmed) return 'Remote'
  const key = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')
  return LOCATION_ALIASES[key] || trimmed
}
