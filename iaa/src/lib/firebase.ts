// Firebase設定と初期化
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase設定
// 環境変数から設定を取得（.envファイルで設定）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Firebase アプリを初期化
const app = initializeApp(firebaseConfig);

// Firebase Auth を初期化
export const auth = getAuth(app);

// Firestore を初期化
export const db = getFirestore(app);

// 開発環境でのエミュレーター接続（オプション）
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  // Auth エミュレーター
  connectAuthEmulator(auth, "http://localhost:9099");
  
  // Firestore エミュレーター
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
