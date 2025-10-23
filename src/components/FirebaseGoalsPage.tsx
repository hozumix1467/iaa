// Firebase版の目標管理ページ
import { useState, useEffect } from 'react';
import { Target, Plus, Edit3, Trash2, Save, X, Calendar, MessageCircle } from 'lucide-react';
import { 
  createGoal, 
  updateGoal, 
  deleteGoal, 
  Goal 
} from '../lib/firestore';
import AIGoalChat from './AIGoalChat';

interface FirebaseGoalsPageProps {
  goals: Goal[];
  onGoalsChange: () => void;
}

export default function FirebaseGoalsPage({ goals, onGoalsChange }: FirebaseGoalsPageProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ title: '', duration: '1month' as const });
  const [editGoal, setEditGoal] = useState({ title: '', duration: '1month' as const });

  const durationLabels = {
    '1month': '1ヶ月',
    '3months': '3ヶ月',
    '6months': '6ヶ月',
    '1year': '1年',
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return;

    const startDate = new Date();
    const endDate = new Date(startDate);

    switch (newGoal.duration) {
      case '1month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case '3months':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case '6months':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '1year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    const { error } = await createGoal({
      title: newGoal.title,
      duration: newGoal.duration,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
    });

    if (error) {
      console.error('目標作成エラー:', error);
      alert('目標の作成に失敗しました');
    } else {
      setNewGoal({ title: '', duration: '1month' });
      setIsCreating(false);
      onGoalsChange();
    }
  };

  const handleUpdateGoal = async (goalId: string, title: string, duration: string) => {
    const { error } = await updateGoal(goalId, {
      title,
      duration: duration as any,
    });

    if (error) {
      console.error('目標更新エラー:', error);
      alert('目標の更新に失敗しました');
    } else {
      setEditingId(null);
      onGoalsChange();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('この目標を削除しますか？')) return;

    const { error } = await deleteGoal(goalId);

    if (error) {
      console.error('目標削除エラー:', error);
      alert('目標の削除に失敗しました');
    } else {
      onGoalsChange();
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingId(goal.id!);
    setEditGoal({
      title: goal.title,
      duration: goal.duration,
    });
  };

  const getGoalProgress = (goal: Goal) => {
    const start = new Date(goal.startDate);
    const end = new Date(goal.endDate);
    const now = new Date();

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

    return {
      progress,
      daysRemaining,
      daysElapsed,
      totalDays,
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">目標管理</h1>
          <p className="text-gray-600">あなたの目標を管理・編集できます</p>
        </div>
      </div>

      {/* AI目標設定チャット */}
      {isAIChatOpen && (
        <div className="mb-6">
          <AIGoalChat onGoalCreated={() => {
            onGoalsChange();
            setIsAIChatOpen(false);
          }} />
        </div>
      )}

      {/* 新しい目標作成フォーム */}
      {isCreating && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">新しい目標を作成</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                あなたのゴールは何ですか？
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
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
                    onClick={() => setNewGoal({ ...newGoal, duration: d })}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      newGoal.duration === d
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {durationLabels[d]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5 inline-block mr-2" />
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim()}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5 inline-block mr-2" />
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 目標一覧 */}
      {goals.length === 0 ? (
        // チャットや手動入力がアクティブでない場合のみ「目標がありません」を表示
        !isAIChatOpen && !isCreating ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">目標がありません</h3>
            <p className="text-gray-600 mb-6">新しい目標を作成して、あなたの成長を始めましょう！</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="bg-gradient-to-r from-slate-700 to-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:from-slate-800 hover:to-blue-900 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                AIと目標を決める
              </button>

              <button
                onClick={() => setIsCreating(true)}
                className="bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                手動で作成
              </button>
            </div>
          </div>
        ) : null
      ) : (
        <>
          {/* 目標追加ボタン（目標が存在する場合） */}
          {!isAIChatOpen && !isCreating && (
            <div className="mb-6 flex justify-center">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAIChatOpen(true)}
                  className="bg-gradient-to-r from-slate-700 to-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:from-slate-800 hover:to-blue-900 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  AIと目標を決める
                </button>

                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  新しい目標を作成
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const { progress, daysRemaining, daysElapsed, totalDays } = getGoalProgress(goal);

            return (
              <div
                key={goal.id}
                className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-200"
              >
                {editingId === goal.id ? (
                  // 編集モード
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        目標タイトル
                      </label>
                      <input
                        type="text"
                        value={editGoal.title}
                        onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        期間
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(durationLabels) as Array<keyof typeof durationLabels>).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setEditGoal({ ...editGoal, duration: d })}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              editGoal.duration === d
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {durationLabels[d]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4 inline-block mr-1" />
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleUpdateGoal(goal.id!, editGoal.title, editGoal.duration)}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Save className="w-4 h-4 inline-block mr-1" />
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-600">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{goal.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{durationLabels[goal.duration]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">進捗</span>
                        <div className="flex items-center gap-1 text-gray-900 font-medium">
                          <Target className="w-4 h-4" />
                          {Math.round(progress)}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 text-right">
                        残り{daysRemaining}日 ({daysElapsed}/{totalDays}日経過)
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEditClick(goal)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id!)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}
