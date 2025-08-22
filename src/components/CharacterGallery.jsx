import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Play, Pause, Download, Volume2, VolumeX, Eye } from 'lucide-react'
import { engagementService } from '../lib/supabase'

const CharacterCard = ({ character, hasMusic, onPlay, isPlaying, currentAudio }) => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handlePlay = () => {
    if (hasMusic && character.music?.[0]) {
      onPlay(character.music[0], character.id)
      // Track engagement
      engagementService.trackEngagement(character.id, 'play')
    }
  }

  const handleView = () => {
    // Track view engagement
    engagementService.trackEngagement(character.id, 'view')
  }

  const handleDownload = () => {
    if (character.assets?.[0]?.original_url) {
      // Create download link
      const link = document.createElement('a')
      link.href = character.assets[0].original_url
      link.download = `${character.name}_${character.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Track download engagement
      engagementService.trackEngagement(character.id, 'download')
    }
  }

  const toggleMute = () => {
    if (currentAudio) {
      currentAudio.muted = !currentAudio.muted
      setIsMuted(currentAudio.muted)
    }
  }

  useEffect(() => {
    handleView()
  }, [])

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-purple-100">
      <CardContent className="p-0">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          {character.assets?.[0] && (
            <img
              src={character.assets[0].thumbnail_url || character.assets[0].original_url}
              alt={character.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          
          {/* Play Button Overlay */}
          {hasMusic && character.music?.[0] && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Button
                size="lg"
                onClick={handlePlay}
                className="rounded-full bg-white/90 hover:bg-white text-purple-600 hover:text-purple-700 shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
            </div>
          )}

          {/* Top Right Controls */}
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {hasMusic && isPlaying && (
              <Button
                size="sm"
                variant="secondary"
                onClick={toggleMute}
                className="rounded-full bg-white/90 hover:bg-white"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownload}
              className="rounded-full bg-white/90 hover:bg-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {/* Music Badge */}
          {hasMusic && character.music?.[0]?.verified_owner && (
            <div className="absolute top-2 left-2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                🎼 本人曲
              </span>
            </div>
          )}
        </div>

        {/* Character Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-800 truncate">{character.name}</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowPrompt(!showPrompt)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {character.short_worldview}
          </p>

          {/* Tags */}
          {character.character_tags && character.character_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {character.character_tags.slice(0, 3).map((ct, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: ct.tags.color }}
                >
                  {ct.tags.name}
                </span>
              ))}
              {character.character_tags.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                  +{character.character_tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Creator Info */}
          <div className="flex items-center text-xs text-gray-500">
            <span>by {character.users?.name || 'Unknown'}</span>
            {character.ai_tool_used && (
              <span className="ml-2">• {character.ai_tool_used}</span>
            )}
          </div>

          {/* Music Info */}
          {hasMusic && character.music?.[0] && (
            <div className="mt-2 text-xs text-purple-600">
              🎵 {character.music[0].title || 'Untitled'}
              {character.music[0].platform && (
                <span className="ml-1">({character.music[0].platform})</span>
              )}
            </div>
          )}

          {/* Prompt Display */}
          {showPrompt && character.prompt_summary && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
              <strong>プロンプト:</strong> {character.prompt_summary}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const CharacterGallery = ({ characters, loading, hasMusic }) => {
  const [currentAudio, setCurrentAudio] = useState(null)
  const [playingCharacterId, setPlayingCharacterId] = useState(null)
  const audioRef = useRef(null)

  const handlePlay = (music, characterId) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    if (playingCharacterId === characterId) {
      // If clicking the same character, stop playing
      setCurrentAudio(null)
      setPlayingCharacterId(null)
      return
    }

    // Create new audio element
    const audio = new Audio()
    
    // Handle different music platforms
    if (music.platform === 'suno' && music.suno_track_id) {
      // For Suno, we would need to construct the proper URL
      // For demo purposes, using embed_url
      audio.src = music.embed_url
    } else {
      audio.src = music.embed_url
    }

    audio.addEventListener('loadstart', () => {
      console.log('Audio loading started')
    })

    audio.addEventListener('canplay', () => {
      audio.play().catch(error => {
        console.error('Audio play failed:', error)
      })
    })

    audio.addEventListener('ended', () => {
      setCurrentAudio(null)
      setPlayingCharacterId(null)
    })

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e)
      setCurrentAudio(null)
      setPlayingCharacterId(null)
    })

    setCurrentAudio(audio)
    setPlayingCharacterId(characterId)
    audioRef.current = audio
  }

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
      }
    }
  }, [currentAudio])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="flex space-x-1">
                  <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          {hasMusic ? (
            <Volume2 className="w-12 h-12 text-gray-400" />
          ) : (
            <Eye className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          {hasMusic ? '音楽付きキャラクターがありません' : '音楽なしキャラクターがありません'}
        </h3>
        <p className="text-gray-500">
          新しいキャラクターの投稿をお待ちしています
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          hasMusic={hasMusic}
          onPlay={handlePlay}
          isPlaying={playingCharacterId === character.id}
          currentAudio={currentAudio}
        />
      ))}
    </div>
  )
}

export default CharacterGallery

