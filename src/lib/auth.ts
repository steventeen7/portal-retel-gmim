import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET_STR = process.env.JWT_SECRET || 'retel-secret-key-2026'
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STR)

// ─── Password ────────────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(password, hashed)
}

// ─── JWT (Using jose for Edge & Node compatibility) ──────────────────────────
export type JWTPayload = {
  id: string
  email: string
  full_name: string
  role: string
  session_id?: string
  permissions?: string[]
  is_approved?: boolean
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch (err) {
    return null
  }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}
