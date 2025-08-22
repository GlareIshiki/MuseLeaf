import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { X, Check, XCircle, Eye, Music, Image as ImageIcon, Clock, AlertTriangle } from 'lucide-react'
import { characterService } from '../lib/supabase'

const PendingCharacterCard = ({ character, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const handleApprove = async () => {
    try {
      setLoading(true)
      await characterService.updateCharacterStatus(character.id, 'approved')
      onApprove()
    } catch (error) {
      console.error('Approval error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setLoading(true)
      await characterService.updateCharacterStatus(character.id, 'rejected')
      onApprove() // Refresh the list
    } catch (error) {
      console.error('Rejection error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>{character.name}</span>
              {character.has_music && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  <Music className="w-3 h-3 mr-1" />
                  音楽あり
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(character.created_at).toLocaleString('ja-JP')}</span>
            </div>
          </div>
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            承認待ち
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Character Info */}
        <div>
          <p className="text-sm text-gray-700 mb-2">{character.short_worldview}</p>
          {character.description && (
            <p className="text-xs text-gray-600">{character.description}</p>
          )}
        </div>

        {/* Creator Info */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">投稿者: </span>
            <span className="font-medium">{character.users?.name || 'Unknown'}</span>
          </div>
          {character.ai_tool_used && (
            <div>
              <span className="text-gray-600">AIツール: </span>
              <span className="font-medium">{character.ai_tool_used}</span>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {character.assets?.[0] && (
          <div>
            <img
              src={character.assets[0].original_url}
              alt={character.name}
              className="w-full h-48 object-cover rounded-lg border"
              onError={(e) => {
                e.target.src = '/placeholder-image.png'
              }}
            />
          </div>
        )}

        {/* Music Info */}
        {character.music?.[0] && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">音楽情報</span>
            </div>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-600">プラットフォーム: </span>
                <span>{character.music[0].platform}</span>
              </div>
              {character.music[0].title && (
                <div>
                  <span className="text-gray-600">タイトル: </span>
                  <span>{character.music[0].title}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">URL: </span>
                <a 
                  href={character.music[0].embed_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs break-all"
                >
                  {character.music[0].embed_url}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Info */}
        {character.prompt_summary && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-600 hover:text-gray-800"
            >
              <Eye className="w-4 h-4 mr-1" />
              プロンプト詳細
            </Button>
            {showDetails && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                {character.prompt_summary}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={loading}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-1" />
            却下
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-1" />
            承認
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const AdminStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">承認待ち</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pending || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">承認済み</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Music className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">音楽付き</p>
              <p className="text-2xl font-bold text-purple-600">{stats.withMusic || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">音楽なし</p>
              <p className="text-2xl font-bold text-blue-600">{stats.withoutMusic || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const AdminPanel = ({ onClose, onApprove }) => {
  const [pendingCharacters, setPendingCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => {
    loadPendingCharacters()
  }, [])

  const loadPendingCharacters = async () => {
    try {
      setLoading(true)
      const pending = await characterService.getPendingCharacters()
      setPendingCharacters(pending || [])
      
      // Calculate stats (in a real app, this would be a separate API call)
      const statsData = {
        pending: pending?.length || 0,
        approved: 0, // Would fetch from API
        withMusic: pending?.filter(c => c.has_music).length || 0,
        withoutMusic: pending?.filter(c => !c.has_music).length || 0
      }
      setStats(statsData)
    } catch (error) {
      console.error('Error loading pending characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCharacterAction = () => {
    loadPendingCharacters()
    onApprove() // Refresh main gallery
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-xl font-bold flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>管理者パネル</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Stats */}
          <AdminStats stats={stats} />

          {/* Pending Characters */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>承認待ちキャラクター ({pendingCharacters.length})</span>
            </h3>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingCharacters.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  承認待ちのキャラクターはありません
                </h4>
                <p className="text-gray-500">
                  すべてのキャラクターが処理済みです
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingCharacters.map((character) => (
                  <PendingCharacterCard
                    key={character.id}
                    character={character}
                    onApprove={handleCharacterAction}
                    onReject={handleCharacterAction}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPanel

