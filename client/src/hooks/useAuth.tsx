import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api } from "../lib/api"

type AdminUser = { id: string; email: string }

type AuthContextValue = {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = "rk_token"
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get<{ user: AdminUser }>("/auth/me")
      .then((res) => {
        if (active) setUser(res.user)
      })
      .catch(() => {
        if (active) {
          localStorage.removeItem(TOKEN_KEY)
          setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post<{ token: string; user: AdminUser }>("/auth/login", { email, password })
    localStorage.setItem(TOKEN_KEY, res.token)
    setUser(res.user)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
