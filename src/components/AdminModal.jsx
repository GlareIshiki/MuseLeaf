import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Check, Eye, Music } from 'lucide-react'
import { getPendingCharacters, approveCharacter, rejectCharacter } from '../lib/mockData'

const AdminModal = ({ isOpen, onClose, onUpdate }) => {
  const [pendingCharacters, setPendingCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadPendingCharacters()
    }
  }, [isOpen])

  const loadPendingCharacters = async () => {
    try {
      setLoading(true)
      const pending = await getPendingCharacters()
      setPendingCharacters(pending || [])
    } catch (error) {
      console.error('Error loading pending characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (characterId) => {
    setProcessing(prev => ({ ...prev, [characterId]: 'approving' }))
    try {
      await approveCharacter(characterId)
      setPendingCharacters(prev => prev.filter(c => c.id !== characterId))
      onUpdate?.()
      alert('キャラクターが承認されました！')
    } catch (error) {
      console.error('Error approving character:', error)
      alert('承認に失敗しました。')
    } finally {
      setProcessing(prev => ({ ...prev, [characterId]: null }))
    }
  }

  const handleReject = async (characterId) => {
    if (!confirm('このキャラクターを拒否しますか？')) return
    
    setProcessing(prev => ({ ...prev, [characterId]: 'rejecting' }))
    try {
      await rejectCharacter(characterId)
      setPendingCharacters(prev => prev.filter(c => c.id !== characterId))
      alert('キャラクターが拒否されました。')
    } catch (error) {
      console.error('Error rejecting character:', error)
      alert('拒否に失敗しました。')
    } finally {
      setProcessing(prev => ({ ...prev, [characterId]: null }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">管理パネル</h2>
            <p className="text-sm text-gray-600">承認待ちキャラクター ({pendingCharacters.length}件)</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : pendingCharacters.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                承認待ちのキャラクターはありません
              </h3>
              <p className="text-gray-500">
                新しい投稿があると、ここに表示されます
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCharacters.map((character) => (
                <div key={character.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                  <div className="flex space-x-4">
                    {/* Character Image */}
                    <div className="flex-shrink-0">
                      {character.assets?.[0] && (
                        <img
                          src={character.assets[0].thumbnail_url || character.assets[0].original_url}
                          alt={character.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                    </div>

                    {/* Character Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 flex items-center">
                            {character.name}
                            {character.has_music && (
                              <Music className="w-4 h-4 ml-2 text-purple-600" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {character.short_worldview}
                          </p>
                          {character.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {character.description}
                            </p>
                          )}
                          
                          {/* Metadata */}
                          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                            <span>by {character.users?.name || 'Unknown'}</span>
                            {character.ai_tool_used && (
                              <span>• {character.ai_tool_used}</span>
                            )}
                            <span>• {new Date(character.created_at).toLocaleDateString('ja-JP')}</span>
                          </div>

                          {/* Music Info */}
                          {character.has_music && character.music?.[0] && (
                            <div className="mt-2 text-xs text-purple-600">
                              🎵 {character.music[0].title || 'Untitled'}
                            </div>
                          )}

                          {/* Prompt */}
                          {character.assets?.[0]?.prompt_summary && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              <strong>プロンプト:</strong> {character.assets[0].prompt_summary}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(character.id)}
                        disabled={processing[character.id]}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processing[character.id] === 'approving' ? (
                          '承認中...'
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            承認
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(character.id)}
                        disabled={processing[character.id]}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        {processing[character.id] === 'rejecting' ? (
                          '拒否中...'
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            拒否
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              承認されたキャラクターはギャラリーに表示されます
            </p>
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminModal

