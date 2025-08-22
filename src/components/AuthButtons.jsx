import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/contexts/AuthProvider.jsx'

export default function AuthButtons() {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)

  const signInMagicLink = async () => {
    const email = window.prompt('ログイン用メールアドレスを入力してください:')
    if (!email) return
    setBusy(true)
    try {
      await supabase?.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
      alert('ログイン用リンクを送信しました。メールをご確認ください。')
    } catch (e) {
      console.error(e)
      alert('ログインリンク送信に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  const signInWithProvider = async (provider) => {
    setBusy(true)
    try {
      await supabase?.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } })
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    setBusy(true)
    try {
      await supabase?.auth.signOut()
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  if (!supabase) {
    return (
      <Button variant="outline" size="sm" disabled title="Supabase未設定">
        ログイン
      </Button>
    )
  }

  return user ? (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{user.email}</span>
      <Button variant="outline" size="sm" onClick={signOut} disabled={busy}>
        ログアウト
      </Button>
    </div>
  ) : (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={signInMagicLink} disabled={busy}>
        メールでログイン
      </Button>
      <Button variant="outline" size="sm" onClick={() => signInWithProvider('github')} disabled={busy}>
        GitHub
      </Button>
      <Button variant="outline" size="sm" onClick={() => signInWithProvider('google')} disabled={busy}>
        Google
      </Button>
    </div>
  )
}

