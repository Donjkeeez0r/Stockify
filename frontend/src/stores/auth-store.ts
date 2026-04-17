import { create } from 'zustand'
import { TOKEN_STORAGE_KEY } from '@/services/api/axios'
import type { UserProfile } from '@/lib/types'

const parseJwtPayload = (token: string): UserProfile | null => {
  try {
    const payloadPart = token.split('.')[1]

    if (!payloadPart) {
      return null
    }

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payloadJson = atob(padded)
    const payload = JSON.parse(payloadJson) as {
      sub?: number
      email?: string
      role?: 'ADMIN' | 'MANAGER' | 'WORKER'
    }

    if (!payload.sub || !payload.email || !payload.role) {
      return null
    }

    return {
      userId: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    }
  } catch {
    return null
  }
}

const getInitialAuthState = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  return {
    token,
    user: token ? parseJwtPayload(token) : null,
  }
}

type AuthStore = {
  token: string | null
  user: UserProfile | null
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...getInitialAuthState(),
  setToken: (token) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    set({ token, user: parseJwtPayload(token) })
  },
  logout: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    set({ token: null, user: null })
  },
}))
