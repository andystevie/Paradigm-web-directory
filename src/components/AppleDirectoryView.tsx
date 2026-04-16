'use client'

import { useState, useMemo } from 'react'
import { Employee } from '@/types/employee'
import { REGIONS, ALL_LOCATIONS, getRegionForLocation } from '@/lib/locations'
import LocationTabs from './LocationTabs'
import ExportMenu from './ExportMenu'

interface AppleDirectoryViewProps {
  employees: Employee[]
}

export default function AppleDirectoryView({ employees }: AppleDirectoryViewProps) {
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedLocation, setSelectedLocation] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const { locations, employeeCounts, regionCounts } = useMemo(() => {
    const locationSet = new Set<string>()
    const counts: Record<string, number> = {}
    const regCounts: Record<string, number> = Object.fromEntries(Object.keys(REGIONS).map(r => [r, 0]))

    employees.forEach(emp => {
      if (emp.location) {
        locationSet.add(emp.location)
        counts[emp.location] = (counts[emp.location] || 0) + 1
        const region = getRegionForLocation(emp.location)
        if (region && regCounts[region] !== undefined) {
          regCounts[region]++
        }
      }
    })

    return {
      locations: Array.from(locationSet).sort(),
      employeeCounts: counts,
      regionCounts: regCounts
    }
  }, [employees])

  const { groupedEmployees, filteredEmployees } = useMemo(() => {
    let locationFiltered = employees

    if (selectedRegion !== 'All') {
      const regionLocations = REGIONS[selectedRegion as keyof typeof REGIONS] || []
      if (selectedLocation !== 'All') {
        locationFiltered = employees.filter(emp => emp.location === selectedLocation)
      } else {
        locationFiltered = employees.filter(emp => (regionLocations as readonly string[]).includes(emp.location))
      }
    } else if (selectedLocation !== 'All') {
      locationFiltered = employees.filter(emp => emp.location === selectedLocation)
    }

    const searchFiltered = searchTerm
      ? locationFiltered.filter(emp => {
          const searchText = `${emp.firstName} ${emp.lastName} ${emp.title || ''} ${emp.team || ''} ${emp.location || ''} ${emp.email || ''}`.toLowerCase()
          return searchText.includes(searchTerm.toLowerCase())
        })
      : locationFiltered

    const grouped: Record<string, Employee[]> = {}
    searchFiltered.forEach(emp => {
      if (!grouped[emp.location]) {
        grouped[emp.location] = []
      }
      grouped[emp.location].push(emp)
    })

    Object.keys(grouped).forEach(location => {
      grouped[location].sort((a, b) => {
        const emailA = (a.email || '\uffff').toLowerCase()
        const emailB = (b.email || '\uffff').toLowerCase()
        return emailA.localeCompare(emailB)
      })
    })

    return {
      groupedEmployees: grouped,
      filteredEmployees: searchFiltered
    }
  }, [employees, selectedRegion, selectedLocation, searchTerm])

  const totalFilteredCount = filteredEmployees.length

  const getInitials = (employee: Employee) => {
    const firstInitial = employee.firstName?.[0] || ''
    const lastInitial = employee.lastName?.[0] || ''
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    setSelectedLocation('All')
  }

  const sortedLocations = useMemo(() => {
    if (selectedRegion !== 'All') {
      const regionLocs = REGIONS[selectedRegion as keyof typeof REGIONS] || []
      return regionLocs.filter(loc => locations.includes(loc) || true)
    }
    return locations
  }, [selectedRegion, locations])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* ── Branded Header ── */}
      <header className="phh-header">
        <div className="phh-header-inner">
          {/* Top row: Brand + Export */}
          <div className="phh-header-top">
            <div className="phh-brand">
              <div className="phh-brand-icon">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <div className="phh-brand-text">
                <h1>Paradigm Home Health</h1>
                <p>The Proactive Plan for Care&trade;</p>
              </div>
            </div>

            <ExportMenu
              employees={filteredEmployees}
              selectedLocation={selectedLocation}
            />
          </div>

          {/* Search */}
          <div className="phh-search-row">
            <div className="phh-search-wrapper">
              <svg
                className="phh-search-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                id="employee-search"
                type="text"
                className="phh-search-input"
                placeholder="Search employees..."
                autoComplete="off"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  className="phh-search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <p className="phh-result-count">
              {totalFilteredCount} of {employees.length} employees
            </p>
          </div>

          {/* Location Tabs */}
          <LocationTabs
            locations={sortedLocations}
            selectedRegion={selectedRegion}
            selectedLocation={selectedLocation}
            onRegionChange={handleRegionChange}
            onLocationChange={setSelectedLocation}
            employeeCounts={employeeCounts}
            regionCounts={regionCounts}
            totalCount={employees.length}
          />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="directory-main">
        {Object.keys(groupedEmployees).length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <h3 className="empty-state-title">No employees found</h3>
            <p className="empty-state-description">
              Try adjusting your search or location filter
            </p>
          </div>
        ) : (
          <div>
            {ALL_LOCATIONS
              .filter(location => groupedEmployees[location])
              .map((location, locationIndex) => (
                <div
                  key={location}
                  className="location-section"
                  style={{ animationDelay: `${locationIndex * 0.08}s` }}
                >
                  {/* Location header (only in multi-location views) */}
                  {(selectedLocation === 'All') && (
                    <div className="location-section-header">
                      <h2 className="location-section-title">{location}</h2>
                      <span className="location-section-count">
                        {groupedEmployees[location].length} {groupedEmployees[location].length === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  )}

                  {/* Employee Grid */}
                  <div className="employee-grid">
                    {groupedEmployees[location].map((employee) => (
                      <div
                        key={employee.id}
                        className="employee-card"
                        onClick={() => setSelectedEmployee(employee)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Avatar */}
                        {employee.photoUrl ? (
                          <img
                            src={employee.photoUrl}
                            alt={`${employee.firstName} ${employee.lastName}`}
                            className="employee-avatar"
                          />
                        ) : (
                          <div className="employee-avatar-placeholder">
                            {getInitials(employee)}
                          </div>
                        )}

                        {/* Info */}
                        <div className="employee-info">
                          <h3 className="employee-name">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          {employee.title && (
                            <p className="employee-title">{employee.title}</p>
                          )}
                          {employee.team && (
                            <p className="employee-department">{employee.team}</p>
                          )}

                          {/* Contact */}
                          {(employee.email || employee.extension || employee.phoneNumber) && (
                            <div className="employee-details">
                              {employee.email && (
                                <div className="employee-detail-item">
                                  <svg className="employee-detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                  </svg>
                                  <a href={`mailto:${employee.email}`} className="employee-email" onClick={(e) => e.stopPropagation()}>
                                    {employee.email}
                                  </a>
                                </div>
                              )}
                              {employee.extension && (
                                <div className="employee-detail-item employee-detail-item--extension">
                                  <svg className="employee-detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                  </svg>
                                  <span>Ext. {employee.extension}</span>
                                </div>
                              )}
                              {employee.phoneNumber && (
                                <div className="employee-detail-item employee-detail-item--extension">
                                  <svg className="employee-detail-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                  </svg>
                                  <a href={`tel:${employee.phoneNumber}`} onClick={(e) => e.stopPropagation()}>
                                    {employee.phoneNumber}
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div
          onClick={() => setSelectedEmployee(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card, #fff)',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedEmployee(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div style={{ padding: '32px', textAlign: 'center' }}>
              {selectedEmployee.photoUrl ? (
                <img
                  src={selectedEmployee.photoUrl}
                  alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto 16px',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6b46c1, #d4af37)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    fontWeight: 600,
                    margin: '0 auto 16px',
                  }}
                >
                  {getInitials(selectedEmployee)}
                </div>
              )}

              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary, #111)' }}>
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </h2>
              {selectedEmployee.title && (
                <p style={{ fontSize: '15px', margin: '0 0 4px', color: 'var(--text-secondary, #555)' }}>
                  {selectedEmployee.title}
                </p>
              )}
              {selectedEmployee.team && (
                <p style={{ fontSize: '13px', margin: '0 0 20px', color: 'var(--text-tertiary, #888)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {selectedEmployee.team}
                </p>
              )}
            </div>

            <div style={{ padding: '0 32px 32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedEmployee.email && (
                  <DetailRow label="Email">
                    <a href={`mailto:${selectedEmployee.email}`} style={{ color: '#6b46c1', textDecoration: 'none' }}>
                      {selectedEmployee.email}
                    </a>
                  </DetailRow>
                )}
                {selectedEmployee.extension && (
                  <DetailRow label="Extension">Ext. {selectedEmployee.extension}</DetailRow>
                )}
                {selectedEmployee.phoneNumber && (
                  <DetailRow label="Phone">
                    <a href={`tel:${selectedEmployee.phoneNumber}`} style={{ color: '#6b46c1', textDecoration: 'none' }}>
                      {selectedEmployee.phoneNumber}
                    </a>
                  </DetailRow>
                )}
                {selectedEmployee.did && (
                  <DetailRow label="Direct">
                    <a href={`tel:${selectedEmployee.did}`} style={{ color: '#6b46c1', textDecoration: 'none' }}>
                      {selectedEmployee.did}
                    </a>
                  </DetailRow>
                )}
                {selectedEmployee.location && (
                  <DetailRow label="Location">{selectedEmployee.location}</DetailRow>
                )}
                {getRegionForLocation(selectedEmployee.location) && (
                  <DetailRow label="Region">{getRegionForLocation(selectedEmployee.location)}</DetailRow>
                )}
                {selectedEmployee.department && (
                  <DetailRow label="Department">{selectedEmployee.department}</DetailRow>
                )}
                {selectedEmployee.jobTitle && selectedEmployee.jobTitle !== selectedEmployee.title && (
                  <DetailRow label="Job Title">{selectedEmployee.jobTitle}</DetailRow>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', fontSize: '14px' }}>
      <span style={{ fontWeight: 600, color: 'var(--text-secondary, #555)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary, #111)', textAlign: 'right' }}>{children}</span>
    </div>
  )
}
