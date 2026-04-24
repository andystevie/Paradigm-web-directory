/**
 * Microsoft Graph API client for syncing users from Entra ID
 */

import { Employee } from '@/types/employee'

interface GraphUser {
  id: string
  givenName?: string
  surname?: string
  displayName?: string
  mail?: string
  userPrincipalName?: string
  jobTitle?: string
  department?: string
  officeLocation?: string
  businessPhones?: string[]
  mobilePhone?: string
  accountEnabled?: boolean
  proxyAddresses?: string[]
}

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID
  const clientId = process.env.AZURE_CLIENT_ID
  const clientSecret = process.env.AZURE_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Missing AZURE_TENANT_ID, AZURE_CLIENT_ID, or AZURE_CLIENT_SECRET')
  }

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  })

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to get access token: ${res.status} ${text}`)
  }

  const json = await res.json()
  return json.access_token as string
}

async function fetchAllUsers(token: string): Promise<GraphUser[]> {
  const fields = [
    'id',
    'givenName',
    'surname',
    'displayName',
    'mail',
    'userPrincipalName',
    'jobTitle',
    'department',
    'officeLocation',
    'businessPhones',
    'mobilePhone',
    'accountEnabled',
    'proxyAddresses',
  ].join(',')

  const all: GraphUser[] = []
  let nextUrl: string | null = `https://graph.microsoft.com/v1.0/users?$select=${fields}&$top=999`

  while (nextUrl !== null) {
    const res: Response = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Graph API error: ${res.status} ${text}`)
    }
    const json: { value?: GraphUser[]; '@odata.nextLink'?: string } = await res.json()
    all.push(...(json.value || []))
    nextUrl = json['@odata.nextLink'] || null
  }

  return all
}

/**
 * Guest-account UPNs from Entra look like `original_external.tld@paradigmhh.com`.
 * We detect that pattern so we can fall back to a constructed company email.
 */
function isMangledGuestUpn(email?: string): boolean {
  if (!email) return false
  const localPart = email.split('@')[0] || ''
  return /_[\w-]+\.[a-z]{2,}$/i.test(localPart)
}

/**
 * Construct a company email from name using the standard pattern: {lastname}{firstInitial}@paradigmhh.com
 */
function constructCompanyEmail(firstName?: string, lastName?: string): string | undefined {
  const first = firstName?.trim().toLowerCase()
  const last = lastName?.trim().toLowerCase()
  if (!first || !last) return undefined
  return `${last}${first[0]}@paradigmhh.com`
}

/**
 * Parse a phone number like "(903) 581-1223 x100" into main + extension
 */
function parsePhone(raw?: string): { phoneNumber?: string; extension?: string } {
  if (!raw) return {}

  const match = raw.match(/^(.*?)\s*(?:x|ext\.?|extension)\s*(\d+)\s*$/i)
  if (match) {
    return {
      phoneNumber: match[1].trim() || undefined,
      extension: match[2].trim(),
    }
  }

  return { phoneNumber: raw.trim() || undefined }
}

/**
 * Fetch all users from Entra and return as Employee records (no id — inserted by DB)
 */
export async function fetchEntraEmployees(): Promise<Omit<Employee, 'id'>[]> {
  const token = await getAccessToken()
  const users = await fetchAllUsers(token)

  const employees: Omit<Employee, 'id'>[] = []

  for (const u of users) {
    if (u.accountEnabled === false) continue

    const firstName = u.givenName?.trim()
    const lastName = u.surname?.trim()

    // Skip accounts without a real name (service accounts, shared mailboxes, etc.)
    if (!firstName && !lastName) continue

    const { phoneNumber, extension } = parsePhone(u.businessPhones?.[0])
    const primarySmtp = u.proxyAddresses?.find((a) => a.startsWith('SMTP:'))?.slice(5)
    let email = primarySmtp || u.userPrincipalName || u.mail
    if (isMangledGuestUpn(email)) {
      email = constructCompanyEmail(firstName, lastName) || email
    }

    employees.push({
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || undefined,
      extension: extension || undefined,
      phoneNumber: phoneNumber || u.mobilePhone || undefined,
      location: u.officeLocation || 'Remote',
      team: u.department || '',
      title: u.jobTitle || undefined,
      department: u.department || undefined,
    })
  }

  return employees
}
