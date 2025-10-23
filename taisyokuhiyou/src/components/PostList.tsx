import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PostList = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">相談一覧</h1>
        <Link
          to="/create"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新規相談を作成
        </Link>
      </div>
      
      {/* ここに投稿一覧を表示するコードを追加 */}
      <div className="space-y-4">
        {/* 投稿データの取得と表示のロジックは別途実装が必要です */}
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-500 text-sm">実装例：</p>
          <h2 className="text-xl font-semibold mb-2">相談タイトル</h2>
          <p className="text-gray-600 mb-4">相談内容の一部が表示されます...</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>投稿者: {user?.displayName}</span>
            <span>投稿日時: 2024/03/21</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 