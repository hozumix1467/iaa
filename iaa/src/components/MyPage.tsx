import { useState, useEffect } from 'react';
import { User, LogOut, Shield, Edit2, Save, X } from 'lucide-react';

interface MyPageProps {
  onSignOut: () => void;
}

export default function MyPage({ onSignOut }: MyPageProps) {
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [userId, setUserId] = useState('demo-user');
  const [isEditingUserId, setIsEditingUserId] = useState(false);
  const [editUserId, setEditUserId] = useState('');

  // ローカルストレージからユーザーIDを読み込み
  useEffect(() => {
    const savedUserId = localStorage.getItem('user_id');
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  // ユーザーID編集を開始
  const handleStartEditUserId = () => {
    setEditUserId(userId);
    setIsEditingUserId(true);
  };

  // ユーザーID編集を保存
  const handleSaveUserId = () => {
    if (editUserId.trim() && editUserId !== userId) {
      setUserId(editUserId.trim());
      localStorage.setItem('user_id', editUserId.trim());
    }
    setIsEditingUserId(false);
  };

  // ユーザーID編集をキャンセル
  const handleCancelEditUserId = () => {
    setEditUserId(userId);
    setIsEditingUserId(false);
  };

  const handleSignOutClick = () => {
    setShowSignOutConfirm(true);
  };

  const handleSignOutConfirm = () => {
    onSignOut();
    setShowSignOutConfirm(false);
  };

  const handleSignOutCancel = () => {
    setShowSignOutConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-green-600 p-3 rounded-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
          <p className="text-gray-600">アカウント情報とサインアウト</p>
        </div>
      </div>

      {/* アカウント情報 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">アカウント情報</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザーID
            </label>
            {isEditingUserId ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editUserId}
                  onChange={(e) => setEditUserId(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ユーザーIDを入力"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveUserId();
                    if (e.key === 'Escape') handleCancelEditUserId();
                  }}
                />
                <button
                  onClick={handleSaveUserId}
                  className="p-2 text-green-600 hover:text-green-700 transition-colors"
                  title="保存"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEditUserId}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="キャンセル"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-mono text-sm">
                  {userId}
                </div>
                <button
                  onClick={handleStartEditUserId}
                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  title="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>デモモードで実行中</span>
          </div>
        </div>
      </div>

      {/* サインアウト */}
      <div className="mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-600 p-2 rounded-lg">
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">サインアウト</h2>
          </div>
          
          {!showSignOutConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 mb-2">アプリケーションからサインアウトします</p>
                <p className="text-sm text-gray-600">※デモモードでは実際にはサインアウトされません</p>
              </div>
              <button
                onClick={handleSignOutClick}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                サインアウト
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-700 mb-6">本当にサインアウトしますか？</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSignOutCancel}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSignOutConfirm}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  サインアウトする
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
