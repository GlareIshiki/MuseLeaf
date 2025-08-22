import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { X, Upload, Music, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { characterService, assetService, musicService, tagService, supabase } from '../lib/supabase'
import { useAuth } from '@/contexts/AuthProvider.jsx'

const SubmissionForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    short_worldview: '',
    description: '',
    has_music: false,
    ai_tool_used: '',
    prompt_summary: '',
    music_url: '',
    music_title: '',
    music_platform: 'suno',
    image_url: '',
    agreed_to_terms: false
  })
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [promptFile, setPromptFile] = useState(null)
  const { user } = useAuth()
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.name.trim()) {
      setError('キャラクター名は必須です')
      return
    }
    if (!formData.short_worldview.trim()) {
      setError('短い世界観説明は必須です')
      return
    }
    if (!formData.image_url.trim() && !imageFile) {
      setError('画像URLまたは画像ファイルのどちらかが必要です')
      return
    }
    if (!formData.agreed_to_terms) {
      setError('利用規約への同意が必要です')
      return
    }
    if (formData.has_music && !formData.music_url.trim()) {
      setError('音楽ありの場合、音楽URLは必須です')
      return
    }

    try {
      setLoading(true)

      // Create character (will be pending by default)
      const characterData = {
        name: formData.name.trim(),
        short_worldview: formData.short_worldview.trim(),
        description: formData.description.trim() || null,
        has_music: formData.has_music,
        ai_tool_used: formData.ai_tool_used.trim() || null,
        status: 'pending'
      }

      // user_id は Supabase 認証ユーザーを優先（RLSで必要）。未ログイン時のみモック値。
      characterData.user_id = user?.id || '00000000-0000-0000-0000-000000000000'

      const character = await characterService.createCharacter(characterData)

      // Prepare image URL (upload if file provided)
      let imageUrl = formData.image_url.trim()
      if (!imageUrl && imageFile && supabase) {
        imageUrl = await assetService.uploadImage(imageFile, character.user_id, character.id)
      }

      // Optionally upload prompt file
      let promptNote = ''
      if (promptFile && supabase) {
        const promptUrl = await assetService.uploadPromptFile(promptFile, character.user_id, character.id)
        promptNote = `\n[Prompt file]: ${promptUrl}`
      }

      // Create asset
      const assetData = {
        character_id: character.id,
        type: 'image',
        original_url: imageUrl,
        thumbnail_url: imageUrl, // In real app, would generate thumbnail
        prompt_summary: (formData.prompt_summary.trim() || '') + promptNote || null,
        downloadable: true
      }

      await assetService.createAsset(assetData)

      // Create music if provided
      if (formData.has_music && formData.music_url.trim()) {
        const musicData = {
          character_id: character.id,
          platform: formData.music_platform,
          embed_url: formData.music_url.trim(),
          title: formData.music_title.trim() || null,
          verified_owner: false // Would be verified later
        }

        await musicService.createMusic(musicData)
      }

      // Success
      onSubmit()
      onClose()
    } catch (error) {
      console.error('Submission error:', error)
      setError('投稿に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">新しいキャラクターを投稿</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">基本情報</h3>
              
              <div>
                <Label htmlFor="name">キャラクター名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="例: ミクちゃん"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="short_worldview">短い世界観説明 (20-40字) *</Label>
                <Textarea
                  id="short_worldview"
                  value={formData.short_worldview}
                  onChange={(e) => handleInputChange('short_worldview', e.target.value)}
                  placeholder="例: 魔法の森に住む元気な猫耳の魔法使い"
                  maxLength={40}
                  rows={2}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.short_worldview.length}/40文字
                </div>
              </div>

              <div>
                <Label htmlFor="description">詳細説明 (任意)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="キャラクターの詳しい設定や背景..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="ai_tool_used">使用AIツール</Label>
                <Select value={formData.ai_tool_used} onValueChange={(value) => handleInputChange('ai_tool_used', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="AIツールを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stable Diffusion">Stable Diffusion</SelectItem>
                    <SelectItem value="Midjourney">Midjourney</SelectItem>
                    <SelectItem value="DALL-E">DALL-E</SelectItem>
                    <SelectItem value="NovelAI">NovelAI</SelectItem>
                    <SelectItem value="その他">その他</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prompt_summary">プロンプト要約 (任意)</Label>
                <Textarea
                  id="prompt_summary"
                  value={formData.prompt_summary}
                  onChange={(e) => handleInputChange('prompt_summary', e.target.value)}
                  placeholder="使用したプロンプトの要約..."
                  rows={2}
                />
              </div>
            </div>

            {/* Image */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
          <ImageIcon className="w-4 h-4" />
          <span>画像</span>
        </h3>
        
        <div>
          <Label htmlFor="image_url">画像URL *</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => handleInputChange('image_url', e.target.value)}
            placeholder="https://example.com/image.png"
          />
          <div className="text-xs text-gray-500 mt-1">
            PNG, JPG, WebP形式をサポート。URLまたはファイルを選択できます。
          </div>
        </div>

        <div>
          <Label htmlFor="image_file">画像ファイル（任意）</Label>
          <Input
            id="image_file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <div className="text-xs text-gray-500 mt-1">アップロードにはログインが必要です（Supabase Storage）。</div>
        </div>

              {/* Image Preview */}
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="プレビュー"
                    className="w-32 h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Music */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_music"
                  checked={formData.has_music}
                  onCheckedChange={(checked) => handleInputChange('has_music', checked)}
                />
                <Label htmlFor="has_music" className="flex items-center space-x-2">
                  <Music className="w-4 h-4" />
                  <span>音楽を追加</span>
                </Label>
              </div>

              {formData.has_music && (
                <div className="space-y-4 pl-6 border-l-2 border-purple-200">
                  <div>
                    <Label htmlFor="music_platform">音楽プラットフォーム</Label>
                    <Select value={formData.music_platform} onValueChange={(value) => handleInputChange('music_platform', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="suno">Suno (推奨)</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="soundcloud">SoundCloud</SelectItem>
                        <SelectItem value="custom">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="music_url">音楽URL *</Label>
                    <Input
                      id="music_url"
                      type="url"
                      value={formData.music_url}
                      onChange={(e) => handleInputChange('music_url', e.target.value)}
                      placeholder="https://suno.com/song/..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="music_title">楽曲タイトル (任意)</Label>
                    <Input
                      id="music_title"
                      value={formData.music_title}
                      onChange={(e) => handleInputChange('music_title', e.target.value)}
                      placeholder="楽曲のタイトル"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreed_to_terms"
                  checked={formData.agreed_to_terms}
                  onCheckedChange={(checked) => handleInputChange('agreed_to_terms', checked)}
                />
                <Label htmlFor="agreed_to_terms" className="text-sm leading-relaxed">
                  利用規約に同意します。投稿されたコンテンツは手動承認後に公開されます。
                  AI生成画像のみ受け付けており、著作権物の使用は禁止されています。
                </Label>
              </div>
            </div>

            {/* Prompt file upload */}
            <div className="space-y-2">
              <Label htmlFor="prompt_file">プロンプトファイル（任意・.txt推奨）</Label>
              <Input
                id="prompt_file"
                type="file"
                accept=".txt,text/plain"
                onChange={(e) => setPromptFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '投稿中...' : '投稿する'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubmissionForm
