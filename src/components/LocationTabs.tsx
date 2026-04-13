'use client'

import { REGIONS } from '@/lib/locations'

interface LocationTabsProps {
  locations: string[]
  selectedRegion: string
  selectedLocation: string
  onRegionChange: (region: string) => void
  onLocationChange: (location: string) => void
  employeeCounts: Record<string, number>
  regionCounts: Record<string, number>
  totalCount: number
}

export default function LocationTabs({
  locations,
  selectedRegion,
  selectedLocation,
  onRegionChange,
  onLocationChange,
  employeeCounts,
  regionCounts,
  totalCount
}: LocationTabsProps) {
  const regionKeys = Object.keys(REGIONS) as (keyof typeof REGIONS)[]

  return (
    <div>
      {/* Primary row: Regions */}
      <div className="phh-tabs">
        <button
          onClick={() => onRegionChange('All')}
          className={`phh-tab ${selectedRegion === 'All' ? 'phh-tab--active' : ''}`}
        >
          All<span className="phh-tab-count">{totalCount}</span>
        </button>

        {regionKeys.map((region) => (
          <button
            key={region}
            onClick={() => onRegionChange(region)}
            className={`phh-tab ${selectedRegion === region ? 'phh-tab--active' : ''}`}
          >
            {region}<span className="phh-tab-count">{regionCounts[region] || 0}</span>
          </button>
        ))}
      </div>

      {/* Secondary row: Individual locations within selected region */}
      {selectedRegion !== 'All' && (
        <div className="phh-tabs" style={{ paddingTop: 0 }}>
          <button
            onClick={() => onLocationChange('All')}
            className={`phh-tab ${selectedLocation === 'All' ? 'phh-tab--active' : ''}`}
          >
            All {selectedRegion}<span className="phh-tab-count">{regionCounts[selectedRegion] || 0}</span>
          </button>

          {(REGIONS[selectedRegion as keyof typeof REGIONS] || []).map((location) => (
            <button
              key={location}
              onClick={() => onLocationChange(location)}
              className={`phh-tab ${selectedLocation === location ? 'phh-tab--active' : ''}`}
            >
              {location}<span className="phh-tab-count">{employeeCounts[location] || 0}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
