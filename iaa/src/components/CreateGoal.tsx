import { useState } from 'react';
import { Target, Loader2 } from 'lucide-react';

interface CreateGoalProps {
  onCreateGoal: (title: string, duration: '1month' | '3months' | '6months' | '1year') => Promise<void>;
}

export default function CreateGoal({ onCreateGoal }: CreateGoalProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<'1month' | '3months' | '6months' | '1year'>('1month');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onCreateGoal(title, duration);
      setTitle('');
      setDuration('1month');
    } finally {
      setLoading(false);
    }
  };

  const durationLabels = {
    '1month': '1ヶ月',
    '3months': '3ヶ月',
    '6months': '6ヶ月',
    '1year': '1年',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Target className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">新しいゴールを作成</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            あなたのゴールは何ですか？
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="例：日本語を習得する、健康になる、副業プロジェクトを立ち上げる..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            期間
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(durationLabels) as Array<keyof typeof durationLabels>).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`py-3 px-4 rounded-lg font-medium transition-all ${
                  duration === d
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {durationLabels[d]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              作成中...
            </>
          ) : (
            'ゴールを作成'
          )}
        </button>
      </form>
    </div>
  );
}
