import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { X, Music, Image as ImageIcon } from 'lucide-react'
import { submitCharacter } from '../lib/mockData'

const SubmissionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    short_worldview: '',
    description: '',
    has_music: false,
    ai_tool_used: '',
    music_url: '',
    music_title: '',
    image_url: '',
    prompt_summary: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submissionData = {
        name: formData.name,
        short_worldview: formData.short_worldview,
        description: formData.description,
        has_music: formData.has_music,
        ai_tool_used: formData.ai_tool_used,
        assets: [{
          type: 'image',
          original_url: formData.image_url || 'https://picsum.photos/400/400?random=' + Date.now(),
          thumbnail_url: formData.image_url || 'https://picsum.photos/400/400?random=' + Date.now(),
          prompt_summary: formData.prompt_summary
        }],
        music: formData.has_music ? [{
          platform: 'suno',
          embed_url: formData.music_url || 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          title: formData.music_title || 'Untitled',
          verified_owner: false
        }] : [],
        character_tags: []
      }

      await submitCharacter(submissionData)
      
      setFormData({
        name: '',
        short_worldview: '',
        description: '',
        has_music: false,
        ai_tool_used: '',
        music_url: '',
        music_title: '',
        image_url: '',
        prompt_summary: ''
      })

      onSubmit?.()
      onClose()
      
      alert('キャラクターが投稿されました！承認をお待ちください。')
    } catch (error) {
      console.error('Submission error:', error)
      alert('投稿に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">キャラクター投稿</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800 flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              基本情報
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                キャラクター名 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例: ミクちゃん"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                世界観（短文） *
              </label>
              <input
                type="text"
                name="short_worldview"
                value={formData.short_worldview}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例: 魔法の森に住む元気な猫耳の魔法使い"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                詳細説明
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="キャラクターの詳細な説明を入力してください"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                使用AI生成ツール
              </label>
              <select
                name="ai_tool_used"
                value={formData.ai_tool_used}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="Stable Diffusion">Stable Diffusion</option>
                <option value="Midjourney">Midjourney</option>
                <option value="DALL-E">DALL-E</option>
                <option value="NovelAI">NovelAI</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-800">画像情報</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                画像URL（デモ用）
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/image.png（空欄の場合はランダム画像）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                プロンプト要約
              </label>
              <input
                type="text"
                name="prompt_summary"
                value={formData.prompt_summary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="例: 1girl, cat ears, blue hair, magic staff, forest background"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="has_music"
                name="has_music"
                checked={formData.has_music}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="has_music" className="font-medium text-gray-800 flex items-center">
                <Music className="w-4 h-4 mr-2" />
                音楽を追加する
              </label>
            </div>

            {formData.has_music && (
              <div className="space-y-4 pl-6 border-l-2 border-purple-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    音楽タイトル
                  </label>
                  <input
                    type="text"
                    name="music_title"
                    value={formData.music_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="例: Forest Magic"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    音楽URL（デモ用）
                  </label>
                  <input
                    type="url"
                    name="music_url"
                    value={formData.music_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/music.mp3（空欄の場合はデモ音源）"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.short_worldview}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? '投稿中...' : '投稿する'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmissionModal

