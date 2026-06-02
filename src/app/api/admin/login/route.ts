import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPassword, setSessionCookie, hashPassword } from '@/lib/auth-helpers'
import { UserRole } from '@/types/admin'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

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
