import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import CharacterCard from './components/CharacterCard'
import { getCharactersWithMusic, getCharactersWithoutMusic } from './utils/mockData'
import './styles/App.css'
import AuthButtons from '@/components/AuthButtons.jsx'
import SubmissionForm from '@/components/SubmissionForm.jsx'
import AdminPanel from '@/components/AdminPanel.jsx'
import { useAuth } from '@/contexts/AuthProvider.jsx'

function App() {
  const [activeTab, setActiveTab] = useState('music')
  const [charactersWithMusic, setCharactersWithMusic] = useState([])
  const [charactersWithoutMusic, setCharactersWithoutMusic] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [playingCharacterId, setPlayingCharacterId] = useState(null)
  const audioRef = useRef(null)
  const { user } = useAuth()
  const [showSubmit, setShowSubmit] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  // Load characters data
  useEffect(() => {
    loadCharacters()
  }, [])

  const loadCharacters = async () => {
    try {
      setLoading(true)
      const [withMusic, withoutMusic] = await Promise.all([
        getCharactersWithMusic(),
        getCharactersWithoutMusic()
      ])
      setCharactersWithMusic(withMusic || [])
      setCharactersWithoutMusic(withoutMusic || [])
    } catch (error) {
      console.error('Error loading characters:', error)
    } finally {
      setLoading(false)
    }
  }

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
    audio.src = music.embed_url

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

  const renderCharacterGrid = (characters, hasMusic) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3"></div>
                <div className="flex space-x-1">
                  <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (!characters || characters.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">
              {hasMusic ? '🎵' : '🖼'}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {hasMusic 
              ? '音楽付きキャラクターがありません' 
              : '音楽なしキャラクターがありません'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            新しいキャラクターの投稿をお待ちしています
          </p>
          <Button>
            キャラクターを投稿する
          </Button>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🎵</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SD Character Gallery
                </h1>
                <p className="text-sm text-gray-600">音楽付きキャラギャラリー</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowSubmit(true)}>
                投稿
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!user) {
                    alert('管理パネルを開くにはログインが必要です')
                    return
                  }
                  setShowAdmin(true)
                }}
              >
                管理
              </Button>
              <AuthButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('music')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'music'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              🎵 音楽あり ({charactersWithMusic.length})
            </button>
            <button
              onClick={() => setActiveTab('no-music')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'no-music'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              🖼 音楽なし ({charactersWithoutMusic.length})
            </button>
          </div>
        </div>

        {/* Character Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {activeTab === 'music' ? '音楽付きキャラクター' : '音楽なしキャラクター'}
          </h2>
          <p className="text-gray-600 mb-6">
            {activeTab === 'music' 
              ? '音楽と一緒に楽しめるSDキャラクターたち' 
              : '静かに鑑賞できるSDキャラクターたち'
            }
          </p>
        </div>

        {activeTab === 'music' 
          ? renderCharacterGrid(charactersWithMusic, true)
          : renderCharacterGrid(charactersWithoutMusic, false)
        }
      </main>
      {/* Modals */}
      <SubmissionForm
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmit={loadCharacters}
      />
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} onApprove={loadCharacters} />
      )}
    </div>
  )
}

export default App
