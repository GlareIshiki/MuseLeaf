import { createClient } from '@supabase/supabase-js'
import { 
  mockCharacterService, 
  mockAssetService, 
  mockMusicService, 
  mockTagService, 
  mockEngagementService 
} from './mockData'

// These would normally be environment variables
// For MVP demo purposes, we'll use placeholder values
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Use mock services for demo purposes
// In production, these would be real Supabase calls
export const characterService = mockCharacterService
export const assetService = mockAssetService
export const musicService = mockMusicService
export const tagService = mockTagService
export const engagementService = mockEngagementService

