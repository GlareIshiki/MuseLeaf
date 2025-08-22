## Supabase セットアップ（認証・ストレージ・RLS）完全ガイド

このドキュメントは、Vercel で公開する本アプリに Supabase を接続し、ログイン/認証・画像/プロンプトのアップロード・承認（RLS で安全化）を行う手順を、最初から最後まで日本語でまとめたものです。

前提
- フロント: Vite + React（静的デプロイ）
- バックエンド: Supabase（Auth / Postgres / Storage / RLS）
- データモデル: `database/database-schema.sql`
- ストレージ: `images`（画像）と `prompts`（テキスト）

---

### 0. 目標と完了条件
- メールリンク or GitHub/Google でログインできる
- 画像/プロンプトファイルをアップロードして投稿できる
- 管理者が承認/却下できる（RLS による安全な制御）

---

### 1. Supabase プロジェクト作成とキー取得
1) https://supabase.com/ にログイン → New project を作成（Organization/Region/DB パスワードを設定）
2) プロジェクトダッシュボード → Project Settings → API で以下を控える
   - Project URL（例: `https://xxxx.supabase.co`）
   - anon public key（クライアントから使用）

注意: URL の末尾にスラッシュは付けません。

---

### 2. Vercel 環境変数を設定（Preview/Production）
Vercel Project Settings → Environment Variables に以下を追加し、Scope（Preview/Production）を選んで保存 → 再デプロイします。

- `VITE_SUPABASE_URL` = `https://xxxx.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = 取得した anon key

補足:
- Vite の `import.meta.env.*` はビルド時に埋め込まれるため、値の変更後は再ビルド/再デプロイが必要です。

---

### 3. DB スキーマを適用
Supabase ダッシュボード → SQL Editor で `database/database-schema.sql` をそのまま実行します。

ポイント:
- スキーマは RLS を有効化済みです（安全側）。
- 以降の章で INSERT 時の `WITH CHECK` を強化します。

---

### 4. RLS 強化（INSERT の WITH CHECK 等）
運用に必要な RLS を以下で上書き/追加します。SQL Editor に順に貼り付けて実行。

4-1) characters（作成者のみ作成/更新可）
```sql
DROP POLICY IF EXISTS "Users can manage own characters" ON characters;
CREATE POLICY "Users can manage own characters" ON characters
  FOR SELECT USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

4-2) assets（親 characters の user_id が自分の場合のみ）
```sql
DROP POLICY IF EXISTS "Users can manage own character assets" ON assets;
CREATE POLICY "Users can manage own character assets" ON assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM characters 
      WHERE characters.id = assets.character_id 
        AND characters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters 
      WHERE characters.id = assets.character_id 
        AND characters.user_id = auth.uid()
    )
  );
```

4-3) music（親 characters の user_id が自分の場合のみ）
```sql
DROP POLICY IF EXISTS "Users can manage own character music" ON music;
CREATE POLICY "Users can manage own character music" ON music
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM characters 
      WHERE characters.id = music.character_id 
        AND characters.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters 
      WHERE characters.id = music.character_id 
        AND characters.user_id = auth.uid()
    )
  );
```

4-4) engagement（認証ユーザーのみ作成可）
```sql
DROP POLICY IF EXISTS "Users can create engagement records" ON engagement;
CREATE POLICY "Users can create engagement records" ON engagement
  FOR INSERT TO authenticated
  WITH CHECK (true);
```

---

### 5. ストレージ（バケット + ポリシー）
Storage → Buckets → New bucket で以下を作成:
- `images`（公開読み取り）
- `prompts`（公開読み取り）

Storage → Policies に以下を追加:
```sql
-- images: 認証済ユーザーはアップロード可
CREATE POLICY "images authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images');

-- images: 公開読み取り
CREATE POLICY "images public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'images');

-- prompts: 認証済ユーザーはアップロード可
CREATE POLICY "prompts authenticated upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'prompts');

-- prompts: 公開読み取り
CREATE POLICY "prompts public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'prompts');
```

実務メモ:
- ファイルサイズや MIME の制限は、必要に応じてクライアント側バリデーション/運用ルールで補完。

---

### 6. 認証（メール OTP / OAuth）
Auth → Providers:
- Email: 有効化（Magic Link）。必要なら独自ドメインの SMTP を設定。
- GitHub / Google: 有効化。各 Provider のコンソールで OAuth App を作成し、Client ID/Secret を Supabase 側に登録。

Auth → URL 設定（Callback/Redirect）に以下を登録:
- 本番: `https://<your-vercel-domain>/`
- プレビュー: `https://*.vercel.app/`
- ローカル: `http://localhost:3000/`

本アプリは `window.location.origin` を使ってリダイレクトします（`src/components/AuthButtons.jsx`）。

---

### 7. 管理者権限（承認操作）
メールホワイトリストで簡易に管理者を判定します。
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT auth.email() = ANY(ARRAY['you@example.com','other@example.com']);
$$ LANGUAGE sql STABLE;

CREATE POLICY "Admins can update any character" ON characters
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

UI 側の制御はログインの有無のみです。厳密に管理者のみ表示/実行にする場合は、`is_admin()` を返す RPC を用意し、フロントから照会して表示制御を行ってください（必要なら実装します）。

---

### 8. 本リポでの連携ポイント（参考）
- `src/lib/supabase.js`: Supabase クライアント/サービス層。環境変数が無い場合はモックにフォールバック。
- `src/contexts/AuthProvider.jsx`: セッション取得と認証状態の配信。
- `src/components/AuthButtons.jsx`: メール OTP / GitHub / Google ログイン。
- `src/components/SubmissionForm.jsx`: 画像 URL or ファイル、プロンプト（テキスト/ファイル）で投稿。ファイルアップロードはログイン必須。
- `src/App.jsx`: ヘッダにログインUI、投稿/管理モーダルを表示。

---

### 9. 動作確認チェックリスト
1) ローカル: `.env.example` を `.env.local` にコピーし値を設定 → `npm run dev`
2) ログイン: 右上ボタンからメール/GitHub/Google でサインイン
3) 投稿: 画像 URL or ファイル、プロンプト（任意）を入力して投稿 → Storage/DB に反映
4) 管理: 「管理」を開き、承認/却下が行える（RLS で許可されていること）
5) 本番: Vercel で環境変数が設定され、Auth の Redirect URL が一致している

---

### 10. トラブルシューティング
- 401/403（Storage アップロード）
  - 未ログイン、または Storage の INSERT ポリシーが不足（`bucket_id` 条件を確認）
- RLS で INSERT/UPDATE が拒否
  - `WITH CHECK` の不足、`characters.user_id` が `auth.uid()` と一致していない
- OAuth コールバック失敗
  - Provider 側/ Supabase 側の Callback/Redirect URL が一致していない
- Vercel で環境変数が効かない
  - Scope（Preview/Production）の誤り、再デプロイ未実施、URL の末尾スラッシュ不一致
- メールが届かない
  - 迷惑メールに入っていないか確認。必要に応じて独自ドメイン送信を設定

---

### 11. セキュリティと運用のヒント
- 画像サイズ/形式のバリデーション、投稿レート制限、XSS 対策（`prompt_summary` サニタイズ）
- 管理者メールは環境変数/テーブル管理にして、`is_admin()` を更新容易に
- 監視/ログ: Supabase Logs、Vercel Analytics、Sentry 等の導入

---

### 12. 付録: まとめて実行する SQL（抜粋）
上記ポリシーを 1 つのスクリプトにまとめ、SQL Editor で一括実行しても構いません。運用に応じて調整してください。
