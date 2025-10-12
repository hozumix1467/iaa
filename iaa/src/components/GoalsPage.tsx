import { useState, useEffect } from 'react';
import { Target, Plus, Edit3, Trash2, Save, X, Calendar, MessageCircle } from 'lucide-react';
// import { supabase, Goal } from '../lib/supabase'; // Firebaseに移行済み
// このコンポーネントは非推奨です。FirebaseGoalsPageを使用してください
import AIGoalChat from './AIGoalChat';

interface GoalsPageProps {
  goals: Goal[];
  onGoalsChange: () => void;
}

export default function GoalsPage({ goals, onGoalsChange }: GoalsPageProps) {
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

    const { error } = await supabase
      .from('goals')
      .insert({
        title: newGoal.title,
        duration: newGoal.duration,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
      });

    if (!error) {
      setNewGoal({ title: '', duration: '1month' });
      setIsCreating(false);
      onGoalsChange();
    }
  };

  const handleUpdateGoal = async (goalId: string) => {
    if (!editGoal.title.trim()) return;

    const { error } = await supabase
      .from('goals')
      .update({
        title: editGoal.title,
        duration: editGoal.duration,
      })
      .eq('id', goalId);

    if (!error) {
      setEditingId(null);
      setEditGoal({ title: '', duration: '1month' });
      onGoalsChange();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('この目標を削除しますか？')) {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (!error) {
        onGoalsChange();
      }
    }
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setEditGoal({ title: goal.title, duration: goal.duration });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditGoal({ title: '', duration: '1month' });
  };

  const getGoalProgress = (goal: Goal) => {
    const startDate = new Date(goal.start_date);
    const endDate = new Date(goal.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    const progress = Math.min(100, (daysElapsed / totalDays) * 100);

    return { progress, daysRemaining, daysElapsed, totalDays };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">目標管理</h1>
            <p className="text-gray-600">あなたの目標を管理・編集できます</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAIChatOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            AIと目標を決める
          </button>
          
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            手動で作成
          </button>
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
                目標のタイトル
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="例：日本語を習得する、健康になる..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="flex gap-3">
              <button
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 目標一覧 */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">目標がありません</h3>
            <p className="text-gray-600 mb-6">新しい目標を作成して、あなたの成長を始めましょう！</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                AIと目標を決める
              </button>
              
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                手動で作成
              </button>
            </div>
          </div>
        ) : (
          goals.map((goal) => {
            const { progress, daysRemaining, daysElapsed, totalDays } = getGoalProgress(goal);
            
            return (
              <div key={goal.id} className="bg-white rounded-2xl shadow-lg p-6">
                {editingId === goal.id ? (
                  /* 編集モード */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        目標のタイトル
                      </label>
                      <input
                        type="text"
                        value={editGoal.title}
                        onChange={(e) => setEditGoal({ ...editGoal, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        期間
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(Object.keys(durationLabels) as Array<keyof typeof durationLabels>).map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setEditGoal({ ...editGoal, duration: d })}
                            className={`py-3 px-4 rounded-lg font-medium transition-all ${
                              editGoal.duration === d
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {durationLabels[d]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdateGoal(goal.id)}
                        disabled={!editGoal.title.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 表示モード */
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{goal.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{durationLabels[goal.duration]}</span>
                            <span>•</span>
                            <span>{goal.start_date} 〜 {goal.end_date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(goal)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="編集"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="削除"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">進捗</span>
                        <span className="text-gray-900 font-medium">
                          {daysElapsed}日経過 / {totalDays}日 ({Math.round(progress)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-cyan-600 to-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        残り{daysRemaining}日
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
