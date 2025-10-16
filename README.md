# IAA - AI搭載ゴールトラッカー

AI搭載のゴールトラッカーアプリです。目標を設定し、AIが日次のタスクを自動生成してくれるアプリケーションです。

## 機能

- 🎯 **目標管理**: 長期的な目標の設定と管理
- 📅 **カレンダー表示**: 日別のタスク表示
- 🤖 **AIアドバイザー**: OpenAI APIを使用したタスク自動生成
- 📝 **振り返りシート**: 日次の振り返りとメモ機能
- ✅ **TODO管理**: タスクの完了状況管理
- 👤 **ユーザー管理**: ユーザーIDのカスタマイズ

## 技術スタック

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **AI**: OpenAI API

## セットアップ

### 1. リポジトリのクローン

\`\`\`bash
git clone https://github.com/your-username/iaa.git
cd iaa
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 3. 環境変数の設定

\`.env\`ファイルを作成し、以下の環境変数を設定してください：

\`\`\`env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
\`\`\`

### 4. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

## 使用方法

1. **目標の設定**: 「目標」ページで長期的な目標を設定
2. **振り返り**: カレンダーで日付を選択し、その日の振り返りを記録
3. **AIタスク生成**: 振り返り内容からAIが翌日のタスクを自動生成
4. **タスク管理**: 生成されたタスクを編集・完了管理

## プロジェクト構造

\`\`\`
src/
├── components/          # Reactコンポーネント
│   ├── AIAdvisorChat.tsx    # AIチャット機能
│   ├── Calendar.tsx          # カレンダー表示
│   ├── GoalsPage.tsx         # 目標管理ページ
│   ├── ReflectionSheet.tsx   # 振り返りシート
│   └── ...
├── lib/                # ライブラリとユーティリティ
│   ├── firebase.ts          # Firebase設定
│   ├── openai.ts            # OpenAI API設定
│   └── ...
└── App.tsx             # メインアプリケーション
\`\`\`

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。

## 作者

[あなたの名前]
