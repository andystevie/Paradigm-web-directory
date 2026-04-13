/**
 * Paradigm Home Health — Location & Region Configuration
 */

export const REGIONS = {
  Corp: ['Tyler', 'Plano', 'Ft. Worth/Keller', 'Whitney', 'Remote'],
  ETX: ['Tyler', 'Longview'],
  DFW: ['Plano', 'Ft. Worth/Keller'],
  CTX: ['Whitney', 'Temple', 'Cedar Park'],
  WTX: ['San Angelo', 'Abilene'],
} as const

export type RegionKey = keyof typeof REGIONS

export const ALL_LOCATIONS = [
  'Tyler', 'Longview', 'Plano', 'Ft. Worth/Keller', 'Whitney',
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
