// Supabase client + service layer (real or mock fallback)
import { createClient } from '@supabase/supabase-js'
import {
  getPendingCharacters as mockGetPendingCharacters,
  approveCharacter as mockApproveCharacter,
  rejectCharacter as mockRejectCharacter,
  submitCharacter as mockSubmitCharacter,
} from '../utils/mockData'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'))

export const supabase = hasSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Engagement: no-op on mock, simple insert when real
export const engagementService = {
  async trackEngagement(characterId, action) {
    if (!hasSupabase || !supabase) return
    try {
      await supabase.from('engagement').insert({ character_id: characterId, action })
    } catch (e) {
      console.warn('engagement insert failed', e)
    }
  },
}

// Characters
export const characterService = {
  async getPendingCharacters() {
    if (!hasSupabase || !supabase) return mockGetPendingCharacters()
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        users(id,name,handle,avatar_url),
        assets(*),
        music(*),
        character_tags(tags(*))
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async updateCharacterStatus(characterId, status) {
    if (!hasSupabase || !supabase) {
      if (status === 'approved') return mockApproveCharacter(characterId)
      if (status === 'rejected') return mockRejectCharacter(characterId)
      return
    }
    const { error } = await supabase
      .from('characters')
      .update({ status })
      .eq('id', characterId)
    if (error) throw error
  },

  async createCharacter(payload) {
    if (!hasSupabase || !supabase) return mockSubmitCharacter(payload)
    const { data, error } = await supabase
      .from('characters')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return data
  },
}

// Assets (image upload + row create)
export const assetService = {
  async uploadImage(file, userId, characterId) {
    if (!hasSupabase || !supabase) throw new Error('Supabase not configured')
    const fileExt = file.name?.split('.').pop()?.toLowerCase() || 'png'
    const path = `${userId || 'anon'}/${characterId || 'temp'}/${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) throw error
    const { data: pub } = supabase.storage.from('images').getPublicUrl(data.path)
    return pub.publicUrl
  },

  async uploadPromptFile(file, userId, characterId) {
    if (!hasSupabase || !supabase) throw new Error('Supabase not configured')
    const fileExt = file.name?.split('.').pop()?.toLowerCase() || 'txt'
    const path = `${userId || 'anon'}/${characterId || 'temp'}/${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('prompts').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'text/plain',
    })
    if (error) throw error
    const { data: pub } = supabase.storage.from('prompts').getPublicUrl(data.path)
    return pub.publicUrl
  },

  async createAsset(payload) {
    if (!hasSupabase || !supabase) return { id: 'mock-asset', ...payload }
    const { data, error } = await supabase
      .from('assets')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return data
  },
}

// Music rows only (upload of audio is out of scope here)
export const musicService = {
  async createMusic(payload) {
    if (!hasSupabase || !supabase) return { id: 'mock-music', ...payload }
    const { data, error } = await supabase
      .from('music')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    return data
  },
}

// Tags (read-only minimal)
export const tagService = {
  async listTags() {
    if (!hasSupabase || !supabase) return []
    const { data, error } = await supabase.from('tags').select('*').order('name')
    if (error) throw error
    return data
  },
}

