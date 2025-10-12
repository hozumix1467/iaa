# アイコン画像の設置手順

## 📁 画像ファイルの配置

提供されたアイコン画像を以下の場所に配置してください：

### 1. ファイルの配置
```
d:\create\iaa\public\icons\logo.png
```

### 2. ファイル形式
- **推奨**: PNG形式（透明背景対応）
- **サイズ**: 48x48px または 64x64px
- **形式**: 正方形または縦長

## 🎨 ヘッダーでの表示

ヘッダーコンポーネントは既に更新済みです：

```tsx
<img 
  src="/icons/logo.png" 
  alt="IAA Logo" 
  className="w-12 h-12 object-contain"
/>
```

## 📋 更新内容

1. **ロゴ画像の表示**: 新しいIAAロゴを表示
2. **タイトルの変更**: "ゴールトラッカー" → "IAA"
3. **アイコンの調整**: TargetアイコンをCalendarアイコンに変更

## 🔧 カスタマイズオプション

### 画像サイズの調整
```tsx
className="w-12 h-12 object-contain"  // 現在のサイズ
className="w-10 h-10 object-contain"  // 小さく
className="w-16 h-16 object-contain"  // 大きく
```

### 背景の追加
```tsx
<div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
  <img src="/icons/logo.png" alt="IAA Logo" className="w-8 h-8" />
</div>
```

## ✅ 完了確認

画像を配置後、以下の点を確認してください：

1. 画像が正常に表示される
2. レスポンシブデザインで適切に表示される
3. 画像のアスペクト比が保たれている
