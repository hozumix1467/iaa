# Firebase セットアップガイド

## 概要

このアプリケーションはFirebase AuthenticationとFirestoreを使用して、ユーザー認証と目標データの管理を行います。

## 必要な設定

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名を入力（例：goal-tracker-app）
4. Google Analyticsの設定（任意）
5. プロジェクトを作成

### 2. Authenticationの設定

1. Firebase Consoleで「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を有効化
5. 「有効にする」をクリック

### 3. Firestoreの設定

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「テストモードで開始」を選択（開発用）
4. ロケーションを選択（asia-northeast1推奨）

### 4. セキュリティルールの設定

Firestoreの「ルール」タブで以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Goalsコレクション
    match /goals/{goalId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // DailyTodosコレクション
    match /dailyTodos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Reflectionsコレクション
    match /reflections/{reflectionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Webアプリの設定

1. Firebase Consoleで「プロジェクトの設定」をクリック
2. 「アプリを追加」→「Web」を選択
3. アプリ名を入力（例：goal-tracker-web）
4. 「アプリを登録」をクリック
5. 設定オブジェクトをコピー

### 6. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、以下の内容を追加：

```env
# Firebase設定
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenAI設定（既存）
VITE_OPENAI_API_KEY=your_openai_api_key_here

# 開発用エミュレーター（オプション）
VITE_USE_FIREBASE_EMULATOR=false
```

### 7. Firebase CLIのインストール（オプション）

ローカル開発用にFirebaseエミュレーターを使用する場合：

```bash
npm install -g firebase-tools
firebase login
firebase init
```

## データ構造

### Goalsコレクション

```typescript
interface Goal {
  id: string;
  title: string;
  duration: '1month' | '3months' | '6months' | '1year';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}
```

### DailyTodosコレクション

```typescript
interface DailyTodo {
  id: string;
  goalId: string;
  date: string;
  todos: string[];
  completed: boolean[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}
```

### Reflectionsコレクション

```typescript
interface Reflection {
  id: string;
  date: string;
  memo: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}
```

## 機能

### 認証機能

- **新規登録**: メールアドレスとパスワードでアカウント作成
- **ログイン**: 既存アカウントでのログイン
- **ログアウト**: セッション終了
- **認証状態監視**: リアルタイムでのログイン状態管理

### 目標管理

- **目標作成**: 手動またはAIチャットで目標を作成
- **目標編集**: 既存目標のタイトルや期間を変更
- **目標削除**: 不要な目標の削除
- **リアルタイム更新**: Firestoreのリアルタイムリスナーで自動更新

### データ同期

- **自動同期**: ユーザーのログイン状態に基づく自動データ読み込み
- **オフライン対応**: Firestoreのオフライン機能を活用
- **セキュリティ**: ユーザーごとのデータ分離

## トラブルシューティング

### よくある問題

1. **認証エラー**
   - Firebase ConsoleでAuthenticationが有効になっているか確認
   - メール/パスワード認証が有効になっているか確認

2. **Firestoreエラー**
   - セキュリティルールが正しく設定されているか確認
   - Firestoreデータベースが作成されているか確認

3. **環境変数エラー**
   - `.env`ファイルが正しく設定されているか確認
   - `VITE_`プレフィックスが付いているか確認

4. **ネットワークエラー**
   - インターネット接続を確認
   - Firebase Consoleでプロジェクトがアクティブか確認

### デバッグ方法

1. **ブラウザの開発者ツール**
   - Consoleタブでエラーメッセージを確認
   - NetworkタブでFirebase APIの呼び出しを確認

2. **Firebase Console**
   - Authentication > Users でユーザー情報を確認
   - Firestore > Data でデータが正しく保存されているか確認

3. **ログ出力**
   - アプリケーション内でFirebaseのエラーをキャッチしてログ出力

## 本番環境での注意点

1. **セキュリティルールの見直し**
   - 本番環境では適切なセキュリティルールを設定

2. **パフォーマンス最適化**
   - 不要なリアルタイムリスナーを削除
   - データのページネーション実装

3. **エラーハンドリング**
   - ユーザーフレンドリーなエラーメッセージの実装
   - ネットワークエラー時の適切な処理

## サポート

問題が解決しない場合は、以下を確認してください：

1. Firebase Consoleの設定
2. 環境変数の設定
3. セキュリティルールの設定
4. ネットワーク接続
5. ブラウザの開発者ツールでのエラーメッセージ
