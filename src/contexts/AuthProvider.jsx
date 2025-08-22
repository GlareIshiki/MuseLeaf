import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase.js'

const AuthContext = createContext({ user: null })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function init() {
      try {
        if (!supabase) return
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!ignore) setUser(session?.user || null)
        supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null)
        })
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  const value = { user, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

