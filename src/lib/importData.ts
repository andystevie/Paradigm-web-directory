/**
 * Import and transform CSV data into Employee format
 */

import Papa from 'papaparse'
import { Employee } from '@/types/employee'
import { getRegionForLocation } from '@/lib/locations'

interface CSVRow {
  Name: string
  Email: string
  Extension: string
  DID: string
  Team: string
  Location: string
  Department: string
  'Job Title': string
}

/**
 * Parse CSV file and convert to Employee array
 */
export async function parseCSV(file: File): Promise<Employee[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const employees = convertCSVToEmployees(results.data as CSVRow[])
          resolve(employees)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * Convert CSV rows to Employee objects
 */
export function convertCSVToEmployees(rows: CSVRow[]): Employee[] {
  return rows
    .filter(row => row.Name && row.Email) // Filter out invalid rows
    .map((row, index) => {
      const nameParts = row.Name.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const location = row.Location?.trim() || ''
      const region = getRegionForLocation(location) || undefined

      return {
        id: `phh-${index + 1}`,
        firstName,
        lastName,
        email: row.Email?.trim() || '',
        extension: row.Extension?.trim() || undefined,
        phoneNumber: row.DID?.trim() || undefined,
        team: row.Department?.trim() || undefined,
        location,
        title: row['Job Title'] === 'User' ? undefined : row['Job Title']?.trim(),
        department: row.Department?.trim() || undefined,
        region,
      } as Employee
    })
    .sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName)
      if (lastNameCompare !== 0) return lastNameCompare
      return a.firstName.localeCompare(b.firstName)
    })
}

/**
 * Load employees from CSV file path (server-side only)
 */
export async function loadEmployeesFromPath(filePath: string): Promise<Employee[]> {
  if (typeof window === 'undefined') {
    const fs = require('fs')
    const csvContent = fs.readFileSync(filePath, 'utf8')

    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const employees = convertCSVToEmployees(results.data as CSVRow[])
            resolve(employees)
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } else {
    throw new Error('loadEmployeesFromPath can only be called on the server')
  }
}
