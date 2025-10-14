// Firebase認証コンポーネント
import { useState, useEffect } from 'react';
import { signIn, signUp, signInWithGoogle, getAuthErrorMessage } from '../lib/firebaseAuth';
import { onAuthStateChange } from '../lib/firebaseAuth';
import { User } from 'firebase/auth';
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';

interface FirebaseAuthProps {
  onAuth: (user: User) => void;
}

export default function FirebaseAuth({ onAuth }: FirebaseAuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 認証状態を監視
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        onAuth(user);
      }
    });

    return () => unsubscribe();
  }, [onAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // ログイン
        const { user, error } = await signIn(email, password);
        if (error) {
          setError(getAuthErrorMessage(error));
        } else if (user) {
          // 成功時は onAuth が呼ばれる
        }
      } else {
        // 新規登録
        const { user, error } = await signUp(email, password, displayName);
        if (error) {
          setError(getAuthErrorMessage(error));
        } else if (user) {
          // 成功時は onAuth が呼ばれる
        }
      }
    } catch (error: any) {
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        setError(getAuthErrorMessage(error));
      } else if (user) {
        // 成功時は onAuth が呼ばれる
      }
    } catch (error: any) {
      setError('Googleログインでエラーが発生しました');
    } finally {
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

        {/* Googleログインボタン */}
        <button
          onClick={handleGoogleSignIn}
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
          {loading ? '処理中...' : 'Googleでログイン'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="山田太郎"
                  required={!isLogin}
                />
                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="example@email.com"
                required
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="パスワードを入力"
                required
                minLength={6}
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                処理中...
              </span>
            ) : (
              isLogin ? 'ログイン' : '新規登録'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {isLogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>Firebase Authentication を使用</p>
            <p>安全にログイン情報を管理します</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs">メール/パスワード</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">Google</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
