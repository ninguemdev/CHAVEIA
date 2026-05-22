import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase/client'
import type { Profile } from '../lib/supabase/types'
import { AuthContext, type AuthContextValue } from './auth'

function getReadableAuthError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid login credentials')) {
    return 'Email ou senha inválidos.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Confirme seu email antes de entrar.'
  }

  if (normalized.includes('rate limit')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.'
  }

  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [hasActiveCreatorPermission, setHasActiveCreatorPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profileError, setProfileError] = useState('')

  const refreshCreatorPermission = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()
    const currentUser = currentSession?.user ?? null

    if (!currentUser) {
      setHasActiveCreatorPermission(false)
      return false
    }

    const { data, error } = await supabase
      .from('tournament_creator_permissions')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('status', 'active')
      .limit(1)

    if (error) {
      setHasActiveCreatorPermission(false)
      return false
    }

    const isActive = data.length > 0
    setHasActiveCreatorPermission(isActive)
    return isActive
  }, [])

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()
    const currentUser = currentSession?.user ?? null

    if (!currentUser) {
      setProfile(null)
      setProfileError('')
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      setProfile(null)
      setProfileError(getReadableAuthError(error.message))
      return null
    }

    setProfile(data)
    setProfileError('')
    await refreshCreatorPermission()
    return data
  }, [refreshCreatorPermission])

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession()

      if (!isMounted) return

      if (error) {
        setProfileError(getReadableAuthError(error.message))
      }

      setSession(currentSession)
      if (currentSession) await refreshProfile()
      setIsLoading(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) {
        setProfile(null)
        setHasActiveCreatorPermission(false)
        setProfileError('')
        return
      }

      void refreshProfile()
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(getReadableAuthError(error.message))
    }

    setSession(null)
    setProfile(null)
    setHasActiveCreatorPermission(false)
    window.location.hash = '#/login'
  }

  const isAdmin = profile?.role === 'admin'

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isAdmin,
      canCreateTournaments: isAdmin || hasActiveCreatorPermission,
      isLoading,
      profileError,
      refreshProfile,
      refreshCreatorPermission,
      signOut,
    }),
    [
      hasActiveCreatorPermission,
      isAdmin,
      isLoading,
      profile,
      profileError,
      refreshCreatorPermission,
      refreshProfile,
      session,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
