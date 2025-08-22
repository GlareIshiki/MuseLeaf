import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Play, Pause, Download, Volume2, VolumeX, Eye } from 'lucide-react'

const CharacterCard = ({ character, hasMusic, onPlay, isPlaying, currentAudio }) => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handlePlay = () => {
    if (hasMusic && character.music?.[0]) {
      onPlay(character.music[0], character.id)
    }
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
    }
  }

  const toggleMute = () => {
    if (currentAudio) {
      currentAudio.muted = !currentAudio.muted
      setIsMuted(currentAudio.muted)
    }
  }

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-purple-100 overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
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
              className="rounded-full bg-white/90 hover:bg-white w-8 h-8 p-0"
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
            className="rounded-full bg-white/90 hover:bg-white w-8 h-8 p-0"
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
          <h3 className="font-semibold text-gray-800 truncate flex-1">{character.name}</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowPrompt(!showPrompt)}
            className="text-gray-500 hover:text-gray-700 w-8 h-8 p-0 ml-2"
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
        {showPrompt && character.assets?.[0]?.prompt_summary && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <strong>プロンプト:</strong> {character.assets[0].prompt_summary}
          </div>
        )}
      </div>
    </div>
  )
}

export default CharacterCard

