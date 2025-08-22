// Mock data for SD Character Gallery MVP
export const mockCharacters = [
  {
    id: '1',
    name: 'ミクちゃん',
    short_worldview: '魔法の森に住む元気な猫耳の魔法使い',
    description: '青い髪と猫の耳を持つ可愛い魔法使いの女の子。いつも明るく、森の動物たちと仲良し。',
    has_music: true,
    ai_tool_used: 'Stable Diffusion',
    status: 'approved',
    created_at: '2024-01-15T10:00:00Z',
    users: {
      name: 'クリエイターA',
      handle: 'creator_a',
      avatar_url: null
    },
    assets: [{
      id: 'asset1',
      type: 'image',
      original_url: 'https://picsum.photos/400/400?random=1',
      thumbnail_url: 'https://picsum.photos/400/400?random=1',
      prompt_summary: '1girl, cat ears, blue hair, magic staff, forest background'
    }],
    music: [{
      id: 'music1',
      platform: 'suno',
      embed_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      title: 'Forest Magic',
      verified_owner: true
    }],
    character_tags: [
      { tags: { name: '猫耳', type: 'feature', color: '#F59E0B' } },
      { tags: { name: 'ファンタジー', type: 'world', color: '#8B5CF6' } },
      { tags: { name: '笑顔', type: 'emotion', color: '#10B981' } }
    ]
  },
  {
    id: '2',
    name: 'ルナ',
    short_worldview: '夜空を守る月の戦士',
    description: '銀色の髪と青い瞳を持つ神秘的な戦士。月の力を使って悪と戦う。',
    has_music: true,
    ai_tool_used: 'Midjourney',
    status: 'approved',
    created_at: '2024-01-14T15:30:00Z',
    users: {
      name: 'クリエイターB',
      handle: 'creator_b',
      avatar_url: null
    },
    assets: [{
      id: 'asset2',
      type: 'image',
      original_url: 'https://picsum.photos/400/400?random=2',
      thumbnail_url: 'https://picsum.photos/400/400?random=2',
      prompt_summary: '1girl, silver hair, blue eyes, armor, moon, night sky'
    }],
    music: [{
      id: 'music2',
      platform: 'suno',
      embed_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      title: 'Moonlight Warrior',
      verified_owner: false
    }],
    character_tags: [
      { tags: { name: '翼', type: 'feature', color: '#06B6D4' } },
      { tags: { name: 'SF', type: 'world', color: '#06B6D4' } },
      { tags: { name: '無表情', type: 'emotion', color: '#6B7280' } }
    ]
  },
  {
    id: '3',
    name: 'さくら',
    short_worldview: '桜の精霊の少女',
    description: 'ピンクの髪と桜の花びらを纏った和風の少女。春の訪れと共に現れる。',
    has_music: false,
    ai_tool_used: 'NovelAI',
    status: 'approved',
    created_at: '2024-01-13T09:15:00Z',
    users: {
      name: 'クリエイターC',
      handle: 'creator_c',
      avatar_url: null
    },
    assets: [{
      id: 'asset3',
      type: 'image',
      original_url: 'https://picsum.photos/400/400?random=3',
      thumbnail_url: 'https://picsum.photos/400/400?random=3',
      prompt_summary: '1girl, pink hair, kimono, cherry blossoms, spring'
    }],
    music: [],
    character_tags: [
      { tags: { name: '和風', type: 'world', color: '#F59E0B' } },
      { tags: { name: '笑顔', type: 'emotion', color: '#10B981' } }
    ]
  },
  {
    id: '4',
    name: 'エリー',
    short_worldview: 'スチームパンクの発明家',
    description: '歯車とゴーグルが特徴的な機械好きの少女。いつも新しい発明に夢中。',
    has_music: false,
    ai_tool_used: 'DALL-E',
    status: 'approved',
    created_at: '2024-01-12T14:45:00Z',
    users: {
      name: 'クリエイターD',
      handle: 'creator_d',
      avatar_url: null
    },
    assets: [{
      id: 'asset4',
      type: 'image',
      original_url: 'https://picsum.photos/400/400?random=4',
      thumbnail_url: 'https://picsum.photos/400/400?random=4',
      prompt_summary: '1girl, goggles, steampunk, gears, workshop'
    }],
    music: [],
    character_tags: [
      { tags: { name: 'スチームパンク', type: 'world', color: '#92400E' } },
      { tags: { name: '笑顔', type: 'emotion', color: '#10B981' } }
    ]
  }
]

export const mockPendingCharacters = [
  {
    id: '5',
    name: 'テストキャラ',
    short_worldview: '承認待ちのテストキャラクター',
    description: 'これは承認待ちのテストキャラクターです。',
    has_music: true,
    ai_tool_used: 'Stable Diffusion',
    status: 'pending',
    created_at: '2024-01-16T12:00:00Z',
    users: {
      name: 'テストユーザー',
      handle: 'test_user',
      avatar_url: null
    },
    assets: [{
      id: 'asset5',
      type: 'image',
      original_url: 'https://picsum.photos/400/400?random=5',
      thumbnail_url: 'https://picsum.photos/400/400?random=5',
      prompt_summary: 'test character, anime style'
    }],
    music: [{
      id: 'music5',
      platform: 'suno',
      embed_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      title: 'Test Song',
      verified_owner: false
    }]
  }
]

// Mock service functions
export const getCharactersWithMusic = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCharacters.filter(c => c.has_music && c.status === 'approved'))
    }, 500)
  })
}

export const getCharactersWithoutMusic = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCharacters.filter(c => !c.has_music && c.status === 'approved'))
    }, 500)
  })
}

export const getPendingCharacters = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPendingCharacters)
    }, 500)
  })
}

export const approveCharacter = (characterId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const character = mockPendingCharacters.find(c => c.id === characterId)
      if (character) {
        character.status = 'approved'
        mockCharacters.push(character)
        const index = mockPendingCharacters.findIndex(c => c.id === characterId)
        mockPendingCharacters.splice(index, 1)
      }
      resolve(character)
    }, 500)
  })
}

export const rejectCharacter = (characterId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const character = mockPendingCharacters.find(c => c.id === characterId)
      if (character) {
        character.status = 'rejected'
        const index = mockPendingCharacters.findIndex(c => c.id === characterId)
        mockPendingCharacters.splice(index, 1)
      }
      resolve(character)
    }, 500)
  })
}

export const submitCharacter = (characterData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCharacter = {
        id: Date.now().toString(),
        ...characterData,
        status: 'pending',
        created_at: new Date().toISOString(),
        users: {
          name: 'デモユーザー',
          handle: 'demo_user',
          avatar_url: null
        }
      }
      mockPendingCharacters.push(newCharacter)
      resolve(newCharacter)
    }, 1000)
  })
}

