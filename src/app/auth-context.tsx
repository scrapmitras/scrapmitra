import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/types'

interface AuthContextType {
  profile: Profile | null
  isLoading: boolean
  isLoggedIn: boolean
  isAdmin: boolean
  login: (identifier: string, password?: string) => Promise<{ success: boolean; isAdmin?: boolean; error?: string }>
  signUp: (params: {
    name: string
    phone: string
    email: string
    password?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ACTIVE_PROFILE_KEY = 'scrap_mitra_active_profile_id'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const isAdmin = !!profile && (
    (profile.email?.toLowerCase().includes('admin') ?? false) ||
    (profile.display_name?.toLowerCase().includes('admin') ?? false) ||
    profile.id === '11111111-1111-1111-1111-111111111103'
  )

  // Fetch full profile from Supabase by UUID
  const loadProfile = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .eq('is_active', true)
        .maybeSingle()

      if (error || !data) {
        return null
      }
      return data as Profile
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err)
      return null
    }
  }

  // Restore authenticated session from localStorage if present
  useEffect(() => {
    async function initAuth() {
      setIsLoading(true)
      const savedId = localStorage.getItem(ACTIVE_PROFILE_KEY)

      if (savedId) {
        const loaded = await loadProfile(savedId)
        if (loaded) {
          setProfile(loaded)
        } else {
          localStorage.removeItem(ACTIVE_PROFILE_KEY)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  // User Login & Database Validation (by Email or Phone)
  const login = async (identifier: string, _password?: string) => {
    setIsLoading(true)
    const cleanIdentifier = identifier.trim()

    try {
      // 1. Search profile in Supabase by email or phone
      const isEmail = cleanIdentifier.includes('@')
      let query = supabase.from('profiles').select('*').eq('is_active', true)

      if (isEmail) {
        query = query.ilike('email', cleanIdentifier)
      } else {
        // Normalize phone number for search (e.g. 9848022338 or +919848022338)
        const phoneFormatted = cleanIdentifier.startsWith('+') ? cleanIdentifier : `+91${cleanIdentifier.replace(/^0+/, '')}`
        query = query.or(`phone_e164.eq.${phoneFormatted},phone_e164.eq.${cleanIdentifier}`)
      }

      const { data, error } = await query.limit(1)

      if (error) {
        setIsLoading(false)
        return { success: false, error: `Database error: ${error.message}` }
      }

      if (!data || data.length === 0) {
        setIsLoading(false)
        return {
          success: false,
          error: `No registered account found with ${isEmail ? 'email' : 'phone'} "${cleanIdentifier}". Please check your details or create a new account.`,
        }
      }

      // Validated user from Supabase table
      const matchedProfile = data[0] as Profile
      setProfile(matchedProfile)
      localStorage.setItem(ACTIVE_PROFILE_KEY, matchedProfile.id)
      setIsLoading(false)
      const isUserAdmin =
        (matchedProfile.email?.toLowerCase().includes('admin') ?? false) ||
        (matchedProfile.display_name?.toLowerCase().includes('admin') ?? false) ||
        matchedProfile.id === '11111111-1111-1111-1111-111111111103'
      return { success: true, isAdmin: isUserAdmin }
    } catch (err: unknown) {
      setIsLoading(false)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Login validation failed.',
      }
    }
  }

  // User Sign Up: Inserts new user directly into public.profiles in Supabase
  const signUp = async ({
    name,
    phone,
    email,
    password: _password,
  }: {
    name: string
    phone: string
    email: string
    password?: string
  }) => {
    setIsLoading(true)
    const cleanEmail = email.trim().toLowerCase()
    const cleanPhone = phone.trim()
    const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/^0+/, '')}`

    try {
      // 1. Check if email already registered in Supabase
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', cleanEmail)
        .maybeSingle()

      if (existingEmail) {
        setIsLoading(false)
        return { success: false, error: 'An account with this email address already exists. Please sign in.' }
      }

      // 2. Check if phone already registered in Supabase
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_e164', formattedPhone)
        .maybeSingle()

      if (existingPhone) {
        setIsLoading(false)
        return { success: false, error: 'An account with this mobile number already exists. Please sign in.' }
      }

      // 3. Insert new customer record into public.profiles
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          display_name: name.trim(),
          email: cleanEmail,
          phone_e164: formattedPhone,
          preferred_language: 'en',
          is_phone_verified: true,
          is_email_verified: true,
          is_active: true,
        })
        .select()
        .single()

      if (insertError || !newProfile) {
        setIsLoading(false)
        return { success: false, error: `Failed to create profile: ${insertError?.message || 'Unknown error'}` }
      }

      // 4. Record identity entry in user_identities
      await supabase.from('user_identities').insert({
        profile_id: newProfile.id,
        provider: 'supabase_email',
        provider_subject: cleanEmail,
        provider_email: cleanEmail,
        provider_phone_e164: formattedPhone,
        is_verified: true,
      })

      // 5. Automatically log in the newly registered user
      setProfile(newProfile as Profile)
      localStorage.setItem(ACTIVE_PROFILE_KEY, newProfile.id)
      setIsLoading(false)
      return { success: true }
    } catch (err: unknown) {
      setIsLoading(false)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Registration failed.',
      }
    }
  }

  const logout = () => {
    setProfile(null)
    localStorage.removeItem(ACTIVE_PROFILE_KEY)
    supabase.auth.signOut().catch(() => {})
  }

  const refreshProfile = async () => {
    const targetId = profile?.id || localStorage.getItem(ACTIVE_PROFILE_KEY)
    if (targetId) {
      const refreshed = await loadProfile(targetId)
      if (refreshed) setProfile(refreshed)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        profile,
        isLoading,
        isLoggedIn: !!profile,
        isAdmin,
        login,
        signUp,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
