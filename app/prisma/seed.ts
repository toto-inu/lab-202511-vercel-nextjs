import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // 既存のデータを削除
  await prisma.todo.deleteMany()
  await prisma.assignee.deleteMany()
  console.log('Cleared existing data')

  // 担当者を作成（5名）
  const assignees = await Promise.all([
    prisma.assignee.create({
      data: {
        name: '山田太郎',
        email: 'yamada@example.com',
      },
    }),
    prisma.assignee.create({
      data: {
        name: '佐藤花子',
        email: 'sato@example.com',
      },
    }),
    prisma.assignee.create({
      data: {
        name: '鈴木一郎',
        email: 'suzuki@example.com',
      },
    }),
    prisma.assignee.create({
      data: {
        name: '田中美咲',
        email: 'tanaka@example.com',
      },
    }),
    prisma.assignee.create({
      data: {
        name: '高橋健太',
        email: 'takahashi@example.com',
      },
    }),
  ])
  console.log(`Created ${assignees.length} assignees`)

  // Todoのサンプルデータ
  const todoTitles = [
    '週次ミーティングの資料を作成',
    'データベースのバックアップを取る',
    '新機能の仕様書を確認',
    'バグ修正: ログイン画面のエラー',
    'テストケースを追加',
    'APIドキュメントを更新',
    'パフォーマンステストを実施',
    'セキュリティ監査の準備',
    'ユーザーフィードバックを分析',
    'デザインレビューに参加',
    'コードレビューを実施',
    'CI/CDパイプラインの改善',
    'ドキュメントの翻訳',
    'モバイルアプリのテスト',
    'サーバーメンテナンスの計画',
    'ライブラリのアップデート',
    '新人研修の資料作成',
    'プレゼンテーション準備',
    'データ分析レポート作成',
    'ユーザビリティテスト',
    'A/Bテストの実施',
    'パフォーマンス最適化',
    'エラーログの調査',
    'リファクタリング',
    '技術ブログの執筆',
    '競合分析',
    'ロードマップの更新',
    'KPIレビュー',
    'チームビルディング企画',
    '月次報告書の作成',
  ]

  const todoDescriptions = [
    '今週の進捗と来週の計画をまとめる',
    '毎週金曜日の定例作業',
    '開発チームとの打ち合わせ前に確認',
    '優先度高: 本番環境で発生中',
    'カバレッジ80%を目指す',
    '最新のエンドポイント情報を反映',
    '負荷テストツールを使用',
    '外部監査に向けた準備',
    '先月分のフィードバックを整理',
    'デザイナーとの定例会議',
    'プルリクエスト5件をレビュー',
    'デプロイ時間の短縮を検討',
    '英語版ドキュメントを日本語化',
    'iOS/Android両方で確認',
    '来週のメンテナンス窓口の調整',
    'セキュリティアップデートを適用',
    '来月の新入社員向け',
    '経営層向けの報告会',
    '過去3ヶ月のデータを可視化',
    'ユーザー10名で実施',
    '新デザインの効果測定',
    'ページ読み込み速度の改善',
    '本日発生したエラーを調査',
    'コードの可読性向上',
    '開発者向けTipsをまとめる',
    '主要競合3社の機能比較',
    'Q1の目標設定',
    '主要指標の振り返り',
    'オフサイトミーティングの企画',
    '経営層への進捗報告',
  ]

  // Todoを作成（30個）
  const todos = []
  for (let i = 0; i < 30; i++) {
    const randomAssignee = Math.random() > 0.2
      ? assignees[Math.floor(Math.random() * assignees.length)]
      : null

    const completed = Math.random() > 0.7

    const todo = await prisma.todo.create({
      data: {
        title: todoTitles[i],
        description: todoDescriptions[i],
        completed,
        assigneeId: randomAssignee?.id,
      },
    })
    todos.push(todo)
  }
  console.log(`Created ${todos.length} todos`)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
