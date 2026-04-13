import Papa from 'papaparse'
import { NextivaUser, CSVImportResult, CSVValidationError } from '@/types/csv'
import { Employee } from '@/types/employee'

// Field mapping for common CSV column names from Nextiva
const FIELD_MAPPINGS: Record<string, string> = {
  // Names - Nextiva format
  'name': 'firstName', // Will need manual splitting for full names
  'first name': 'firstName',
  'firstname': 'firstName',
  'first_name': 'firstName',
  'last name': 'lastName',
  'lastname': 'lastName',
  'last_name': 'lastName',

  // Contact - Nextiva format
  'email': 'email',
  'email address': 'email',
  'extension': 'extensionNumber',
  'ext': 'extensionNumber',
  'extension number': 'extensionNumber',
  'phone number': 'did',
  'phone': 'did',
  'did': 'did',
  'direct number': 'did',

  // Organization - Nextiva format
  'team': 'team',
  'group': 'team',
  'department': 'department',
  'dept': 'department',
  'location': 'location',
  'office': 'location',
  'site': 'location',
  'role': 'jobTitle',
  'title': 'jobTitle',
  'job title': 'jobTitle',
  'position': 'jobTitle'
}

function normalizeColumnName(columnName: string): string {
  return columnName.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '')
}

function mapCsvColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  headers.forEach((header, index) => {
    const normalizedHeader = normalizeColumnName(header)
    const mappedField = FIELD_MAPPINGS[normalizedHeader]

    if (mappedField) {
      mapping[header] = mappedField
    }
  })

  return mapping
}

function validateRow(data: any, rowIndex: number, columnMapping: Record<string, string>): CSVValidationError[] {
  const errors: CSVValidationError[] = []

  // Check required fields - only Name is required now
  const nameKey = Object.keys(columnMapping).find(k => columnMapping[k] === 'firstName')
  const name = nameKey ? data[nameKey] : undefined

  if (!name || name.trim() === '') {
    errors.push({
      row: rowIndex,
      field: 'name',
      message: 'Name is required',
      value: name
    })
  }

  // Team and location are optional - no validation errors, just warnings handled elsewhere

  // Validate email format if provided
  const emailKey = Object.keys(columnMapping).find(k => columnMapping[k] === 'email')
  const email = emailKey ? data[emailKey] : undefined
  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      errors.push({
        row: rowIndex,
        field: 'email',
        message: 'Invalid email format',
        value: email
      })
    }
  }

  return errors
}

// Location normalization mapping for CSV data
const LOCATION_MAPPINGS: Record<string, string> = {
  // ETX
  'tyler': 'Tyler',
  'longview': 'Longview',
  // DFW
  'ft. worth': 'Ft. Worth/Keller',
  'ft worth': 'Ft. Worth/Keller',
  'fort worth': 'Ft. Worth/Keller',
  'keller': 'Ft. Worth/Keller',
  'ft. worth/keller': 'Ft. Worth/Keller',
  'plano': 'Plano',
  // WTX
  'abilene': 'Abilene',
  'san angelo': 'San Angelo',
  'sanangelo': 'San Angelo',
  // CTX
  'temple': 'Temple',
  'whitney': 'Whitney',
  'cedar park': 'Cedar Park',
  'cedarpark': 'Cedar Park'
}

function normalizeLocation(location: string): string {
  if (!location) return ''

  const cleaned = location.toLowerCase().trim()

  // Check for exact matches first
  if (LOCATION_MAPPINGS[cleaned]) {
    return LOCATION_MAPPINGS[cleaned]
  }

  // Check if location contains any of our target cities
  for (const [key, value] of Object.entries(LOCATION_MAPPINGS)) {
    if (cleaned.includes(key)) {
      return value
    }
  }

  // If no match found, return the original location capitalized
  return location.trim().split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

function transformRowData(data: any, columnMapping: Record<string, string>): NextivaUser {
  const user: NextivaUser = {
    firstName: ''
  }

  // Map all available fields
  Object.entries(columnMapping).forEach(([csvColumn, userField]) => {
    const value = data[csvColumn]
    if (value && value.trim() !== '') {
      if (userField === 'location') {
        (user as any)[userField] = normalizeLocation(value.trim())
      } else {
        (user as any)[userField] = value.trim()
      }
    }
  })

  // Handle special case: if name field contains full name, try to split it
  if (user.firstName && !user.lastName && user.firstName.includes(' ')) {
    const nameParts = user.firstName.split(' ')
    user.firstName = nameParts[0]
    user.lastName = nameParts.slice(1).join(' ')
  }

  return user
}

export function parseCSVFile(file: File): Promise<CSVImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = []
        const warnings: string[] = []
        const validationErrors: CSVValidationError[] = []

        // Check if we have data
        if (!results.data || results.data.length === 0) {
          errors.push('CSV file is empty or contains no valid data')
          resolve({ success: false, data: [], errors, warnings })
          return
        }

        // Map CSV columns to our data structure
        const headers = Object.keys(results.data[0] as any)
        const columnMapping = mapCsvColumns(headers)

        // Check if we found essential mappings
        const hasName = Object.values(columnMapping).includes('firstName') // firstName field maps to "Name" column
        const hasTeam = Object.values(columnMapping).includes('team')
        const hasLocation = Object.values(columnMapping).includes('location')

        if (!hasName) {
          errors.push('Could not find name column. Expected column: "Name"')
        }
        if (!hasTeam) {
          warnings.push('Could not find team/group column. Users will need teams assigned manually.')
        }
        if (!hasLocation) {
          warnings.push('Could not find location/office column. Users will need locations assigned manually.')
        }

        if (errors.length > 0) {
          resolve({ success: false, data: [], errors, warnings })
          return
        }

        // Process each row
        const processedData: NextivaUser[] = []

        results.data.forEach((row: any, index: number) => {
          const rowErrors = validateRow(row, index + 2, columnMapping) // +2 for header + 0-index
          validationErrors.push(...rowErrors)

          if (rowErrors.length === 0) {
            const userData = transformRowData(row, columnMapping)
            processedData.push(userData)
          }
        })

        // Add validation errors to main errors array
        if (validationErrors.length > 0) {
          validationErrors.forEach(error => {
            errors.push(`Row ${error.row}, ${error.field}: ${error.message} (value: "${error.value}")`)
          })
        }

        // Add summary info
        if (processedData.length > 0) {
          warnings.push(`Successfully processed ${processedData.length} users`)
        }

        resolve({
          success: processedData.length > 0,
          data: processedData,
          errors,
          warnings
        })
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse CSV file: ${error.message}`],
          warnings: []
        })
      }
    })
  })
}

export function convertToEmployees(nextiveUsers: NextivaUser[]): Employee[] {
  return nextiveUsers.map((user, index) => ({
    id: `imported-${index + 1}`,
    firstName: user.firstName,
    lastName: user.lastName || '', // Default to empty string if no lastName
    email: user.email,
    extensionNumber: user.extensionNumber,
    did: user.did,
    team: user.team || 'Unassigned',
    location: user.location || 'Unknown',
    department: user.department,
    jobTitle: user.jobTitle
  }))
}

export function generateSampleCSV(): string {
  const sampleData = [
    {
      'First Name': 'Jane',
      'Last Name': 'Smith',
      'Email': 'jane.smith@paradigmhh.com',
      'Extension': '2001',
      'DID': '+1-555-0101',
      'Team': 'Nursing',
      'Location': 'Tyler',
      'Department': 'Nursing',
      'Job Title': 'RN Case Manager'
    },
    {
      'First Name': 'John',
      'Last Name': 'Johnson',
      'Email': 'john.johnson@paradigmhh.com',
      'Extension': '3001',
      'DID': '+1-555-0102',
      'Team': 'Physical Therapy',
      'Location': 'Ft. Worth/Keller',
      'Department': 'Physical Therapy',
      'Job Title': 'Physical Therapist'
    },
    {
      'First Name': 'Maria',
      'Last Name': 'Garcia',
      'Email': 'maria.garcia@paradigmhh.com',
      'Extension': '4001',
      'DID': '+1-555-0103',
      'Team': 'Administration',
      'Location': 'Abilene',
      'Department': 'Administration',
      'Job Title': 'Intake Coordinator'
    },
    {
      'First Name': 'David',
      'Last Name': 'Lee',
      'Email': 'david.lee@paradigmhh.com',
      'Extension': '5001',
      'DID': '+1-555-0104',
      'Team': 'Speech Therapy',
      'Location': 'Temple',
      'Department': 'Speech Therapy',
      'Job Title': 'Speech-Language Pathologist'
    }
  ]

  return Papa.unparse(sampleData)
}