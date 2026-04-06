export type PillarKey = 'soul' | 'roots' | 'body' | 'bank' | 'brain'

export interface CheckIn {
  id?: string
  user_id?: string
  date: string
  soul: boolean
  roots: boolean
  body: boolean
  bank: boolean
  brain: boolean
  created_at?: string
  updated_at?: string
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  created_at?: string
}

export type ActiveScreen = 'home' | 'weekly' | 'profile'
