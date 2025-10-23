// Firebase Authentication ユーティリティ関数
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';

// ユーザー登録
export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 表示名を設定
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// ログイン
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

// Googleでログイン
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // 追加のスコープを設定（オプション）
    provider.addScope('email');
    provider.addScope('profile');
    
    // Cross-Origin-Opener-Policyエラーを回避するための設定
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error: any) {
    // より詳細なエラー情報を提供
    console.error('Google Sign-In Error:', error);
    return { user: null, error: error.code || error.message };
  }
};

// ログアウト
export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 認証状態の監視
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 現在のユーザーを取得
export const getCurrentUser = () => {
  return auth.currentUser;
};

// エラーメッセージを日本語に変換
export const getAuthErrorMessage = (errorCode: string) => {
  const errorMessages: { [key: string]: string } = {
    'auth/user-not-found': 'このメールアドレスのユーザーが見つかりません。',
    'auth/wrong-password': 'パスワードが正しくありません。',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています。',
    'auth/weak-password': 'パスワードは6文字以上で入力してください。',
    'auth/invalid-email': '有効なメールアドレスを入力してください。',
    'auth/user-disabled': 'このアカウントは無効化されています。',
    'auth/too-many-requests': 'リクエストが多すぎます。しばらくしてから再試行してください。',
    'auth/network-request-failed': 'ネットワークエラーが発生しました。',
    'auth/invalid-credential': '認証情報が無効です。',
    'auth/popup-closed-by-user': 'ログインがキャンセルされました。',
    'auth/popup-blocked': 'ポップアップがブロックされています。ポップアップを許可してください。',
    'auth/cancelled-popup-request': '別のポップアップが既に開いています。',
    'auth/account-exists-with-different-credential': 'このメールアドレスは他の方法で既に登録されています。',
  };
  
  return errorMessages[errorCode] || '認証エラーが発生しました。';
};
