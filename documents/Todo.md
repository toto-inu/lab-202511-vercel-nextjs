# SaaS化 実装進捗

## 完了済み

### Phase 1: データモデル構築 ✅
- [x] Prismaスキーマ拡張（Plan, Tenant, TenantMember, Project, ProjectMember追加）
- [x] マイグレーション作成・実行
- [x] Seedデータ作成（7ユーザー: 1グローバル管理者 + TenantA/B各3ユーザー）
- [x] 既存データの保持確認

### Phase 2: 認証・認可の拡張（開発用擬似認証） ✅
- [x] 開発用擬似ログイン機能の実装
  - Cookie based session management
  - パスワード不要のユーザー選択式ログイン
  - 7テストユーザー（Global Admin + TenantA/B × 3役割）
- [x] ユーザー情報表示機能
  - ナビゲーションバーに現在のユーザー名表示
  - テナント名と役割の表示
  - グローバル管理者バッジ表示（👑）
- [x] ログアウト機能
- [x] ユーザー切り替え機能
- [x] Middleware実装（認証チェック）
- [x] Server Actionsの実装（devLogin, devLogout, getCurrentDevUserId）

## 次のステップ

### Phase 2続き: Better Auth認証への移行（未着手）
- [ ] Better Authのセットアップ
- [ ] Auth Utilsの作成
- [ ] Permission Utilsの作成
- [ ] Plan Utilsの作成

### Phase 3: コア機能実装（未着手）
- [ ] Todo画面をマルチテナント対応に更新
- [ ] 担当者画面をマルチテナント対応に更新
- [ ] Server Actions拡張（権限チェック追加）
- [ ] Project管理機能の実装
- [ ] Tenant切り替え機能の実装

### Phase 4: 管理画面（未着手）
- [ ] Next Adminの設定拡張
- [ ] 管理画面アクセス制御

### Phase 5: 既存機能の完全移行（未着手）
- [ ] ルーティング変更
- [ ] Todo UI更新
- [ ] Assignee機能の統合

## メモ

### Vercel関連
- vercelのpostinstallが推奨か調査
- デプロイ時のキャッシュ問題: データ作成時に一覧取得側がキャッシュを参照して更新されない

### 実装済みファイル
- `lib/dev-auth.ts` - 開発用認証ヘルパー
- `actions/dev-auth.ts` - 開発用認証Server Actions
- `app/dev-login/page.tsx` - 開発用ログイン画面
- `components/Navigation.tsx` - ナビゲーションバー（ユーザー情報表示）
- `components/LogoutButton.tsx` - ログアウトボタン
- `middleware.ts` - 認証チェックミドルウェア
- `prisma/seed.ts` - マルチテナント用シードデータ