// Firebase認証リダイレクトコンポーネント（代替案）
import { useState, useEffect } from 'react';
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { onAuthStateChange, getAuthErrorMessage } from '../lib/firebaseAuth';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface FirebaseAuthRedirectProps {
  onAuth: (user: User) => void;
}

export default function FirebaseAuthRedirect({ onAuth }: FirebaseAuthRedirectProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // リダイレクト結果を処理
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // リダイレクトログインが成功
          onAuth(result.user);
        }
      } catch (error: any) {
        console.error('リダイレクト結果の処理エラー:', error);
        setError(getAuthErrorMessage(error.code || error.message));
      }
    };

    handleRedirectResult();

    // 認証状態を監視
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        onAuth(user);
      }
    });

    return () => unsubscribe();
  }, [onAuth]);

  const handleGoogleSignInRedirect = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error('Google Sign-In Redirect Error:', error);
      setError(getAuthErrorMessage(error.code || error.message));
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'ログイン' : '新規登録'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'アカウントにログインしてください' : '新しいアカウントを作成してください'}
          </p>
        </div>

        {/* Googleリダイレクトログインボタン */}
        <button
          onClick={handleGoogleSignInRedirect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <ExternalLink className="w-4 h-4" />
          {loading ? '処理中...' : 'Googleでログイン（リダイレクト）'}
        </button>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Firebase Authentication を使用</p>
            <p>安全にログイン情報を管理します</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Google（リダイレクト）</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-orange-600">
              ポップアップがブロックされる場合は、この方法をお試しください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
