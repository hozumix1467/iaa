# Firestore インデックス設定ガイド

## エラーの説明

以下のエラーが発生しています：

```
FirebaseError: [code=failed-precondition]: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/iaa-airoutine/firestore/indexes...
```

これは、Firestoreで複合クエリ（複数のフィールドで並び替えやフィルタリング）を実行する際に、適切なインデックスが作成されていないために発生します。

## 解決方法

### 1. 自動インデックス作成リンクを使用

1. エラーメッセージに含まれているURLをクリック：
   ```
   https://console.firebase.google.com/v1/r/project/iaa-airoutine/firestore/indexes/...
   ```

2. Firebase Consoleが開き、必要なインデックスの作成画面が表示されます

3. 「インデックスを作成」ボタンをクリック

4. インデックスの作成が完了するまで数分待機

### 2. 手動でインデックスを作成

Firebase Consoleで手動でインデックスを作成する場合：

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 「Firestore Database」をクリック
4. 「インデックス」タブを選択
5. 「インデックスを作成」をクリック

#### 必要なインデックス設定

**goalsコレクション用インデックス**:
- **コレクション**: `goals`
- **フィールド**:
  - `userId` (昇順)
  - `createdAt` (降順)
- **クエリスコープ**: コレクション

**dailyTodosコレクション用インデックス**:
- **コレクション**: `dailyTodos`
- **フィールド**:
  - `userId` (昇順)
  - `date` (昇順)
- **クエリスコープ**: コレクション

**reflectionsコレクション用インデックス**:
- **コレクション**: `reflections`
- **フィールド**:
  - `userId` (昇順)
  - `date` (昇順)
- **クエリスコープ**: コレクション

### 3. インデックス作成の確認

インデックスの作成が完了したら：

1. Firebase Consoleの「インデックス」タブで作成されたインデックスを確認
2. アプリケーションを再読み込み
3. エラーが解消されることを確認

## インデックスが不要な場合の対応

開発段階でインデックスの作成を避けたい場合は、クエリを簡素化できます：

### 代替案1: 単一フィールドでの並び替え

```typescript
// 複合インデックスが必要
const q = query(
  collection(db, goalsCollection),
  where('userId', '==', userId),
  orderBy('createdAt', 'desc')
);

// 単一フィールドのみ（インデックス不要）
const q = query(
  collection(db, goalsCollection),
  where('userId', '==', userId)
);
// クライアント側で並び替え
```

### 代替案2: リアルタイムリスナーを一時的に無効化

```typescript
// 開発中はリアルタイムリスナーを無効化
// const unsubscribe = subscribeToUserGoals((goals) => {
//   setGoals(goals);
// });

// 代わりに一度だけ読み込み
useEffect(() => {
  if (user) {
    loadGoalsOnce();
  }
}, [user]);
```

## 本番環境での注意点

### パフォーマンス考慮

1. **インデックスの数**: インデックスが多いと書き込みパフォーマンスが低下
2. **複合インデックス**: 必要な場合のみ作成
3. **クエリの最適化**: 可能な限りシンプルなクエリを使用

### コスト考慮

1. **読み取り回数**: インデックス作成後も読み取り回数は変わらない
2. **ストレージ**: インデックス用のストレージコストが発生
3. **書き込み**: 複合インデックスがあると書き込みコストが増加

## トラブルシューティング

### よくある問題

1. **インデックス作成に時間がかかる**
   - 大量のデータがある場合、数時間かかる場合がある
   - 作成完了まで待機

2. **まだエラーが発生する**
   - ブラウザを再読み込み
   - Firebase Consoleでインデックスが「構築中」でないか確認

3. **複数のインデックスが必要**
   - 異なるクエリパターンごとにインデックスが必要
   - エラーメッセージのリンクを順番にクリック

### デバッグ方法

1. **Firebase Console**
   - Firestore > インデックス でインデックス状況を確認
   - 構築中のインデックスがないか確認

2. **ブラウザの開発者ツール**
   - Consoleタブでエラーメッセージを確認
   - インデックス作成リンクが表示されているか確認

## 推奨設定

開発環境では以下の順序で対応することを推奨します：

1. **自動インデックス作成リンクを使用**（最も簡単）
2. **インデックス作成が完了するまで待機**
3. **アプリケーションを再読み込みしてテスト**

これで、Firestoreの複合クエリが正常に動作するようになります！
