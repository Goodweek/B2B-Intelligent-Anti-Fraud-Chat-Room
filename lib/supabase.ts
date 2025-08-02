import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database Types
export interface ChatRoom {
  id: string
  name: string
  keywords: string[]
  description: string
  type: 'general' | 'product' | 'industry'
  created_at: string
  created_by?: string
  member_count?: number
}

export interface Message {
  id: string
  chatroom_id: string
  user_id: string
  content: string
  user_type: 'buyer' | 'supplier'
  user_name?: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  company?: string
  user_type: 'buyer' | 'supplier'
  created_at: string
}
