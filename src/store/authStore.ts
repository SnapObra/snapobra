import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      error: null,
      setUser: (user) => set({ user, error: null }),
      setSession: (session) => set({ session, user: session?.user ?? null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      signOut: async () => {
        set({ isLoading: true })
        const { error } = await supabase.auth.signOut()
        if (error) set({ error: error.message })
        set({ user: null, session: null, isLoading: false })
      },
      initialize: async () => {
        set({ isLoading: true })
        
        // 1. Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          set({ session, user: session.user, isLoading: false })
        } else {
          set({ session: null, user: null, isLoading: false })
        }

        // 2. Listen for changes
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ 
            session, 
            user: session?.user ?? null, 
            isLoading: false 
          })
        })

        // No need to unsubscribe here as this is a global store initialization,
        // but it's good to keep track if needed.
        // For now, we just ensure isLoading is set to false once we have a result.
      }
    }),
    {
      name: 'snapobra-auth',
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
)
