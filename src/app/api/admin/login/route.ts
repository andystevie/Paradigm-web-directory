import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPassword, setSessionCookie, hashPassword } from '@/lib/auth-helpers'
import { getLimiter, enforce, clientId } from '@/lib/rate-limit'
import { recordActivity } from '@/lib/activity-log'
import { LoginSchema, parseBody } from '@/lib/schemas'
import { UserRole } from '@/types/admin'

// 10 attempts per IP per 5 minutes for login.
const loginLimiter = getLimiter('login', 10, '5 m')

export async function POST(request: NextRequest) {
  const limited = await enforce(loginLimiter, clientId(request))
  if (limited) return limited

  try {
    const parsed = parseBody(LoginSchema, await request.json())
    if (parsed instanceof NextResponse) return parsed
    const { email, password } = parsed

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Opportunistic rehash: if the stored hash uses an older bcrypt cost,
    // upgrade it now that we have the plaintext password. Bcrypt format is
    // `$2a$<cost>$...`; cost 10 was the old default, cost 12 is current.
    const costMatch = user.passwordHash.match(/^\$2[aby]\$(\d{2})\$/)
    const currentCost = costMatch ? parseInt(costMatch[1], 10) : 0
    if (currentCost > 0 && currentCost < 12) {
      try {
        const upgraded = await hashPassword(password)
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: upgraded }
        })
      } catch (e) {
        console.error('Rehash failed (non-fatal):', e)
      }
    }

    // Create session
    await setSessionCookie({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole
    })

    await recordActivity({
      type: 'login',
      action: 'Logged in',
      author: user.email,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
