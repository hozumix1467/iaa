import { useState } from 'react';
import { CheckCircle2, Circle, Loader2, Calendar, Sparkles } from 'lucide-react';
// import { DailyTodo } from '../lib/supabase'; // Firebaseに移行済み

interface DailyTodosProps {
  todos: DailyTodo[];
  onToggleTodo: (todoId: string, completed: boolean) => Promise<void>;
  onGenerateTodos: () => Promise<void>;
  isGenerating: boolean;
  todayDate: string;
}

export default function DailyTodos({
  todos,
  onToggleTodo,
  onGenerateTodos,
  isGenerating,
  todayDate,
}: DailyTodosProps) {
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const handleToggle = async (todoId: string, completed: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(todoId));
    try {
      await onToggleTodo(todoId, completed);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(todoId);
        return next;
      });
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">今日のタスク</h2>
            <p className="text-sm text-gray-600">{new Date(todayDate).toLocaleDateString('ja-JP')}</p>
          </div>
        </div>

        <button
          onClick={onGenerateTodos}
          disabled={isGenerating}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              タスクを生成
            </>
          )}
        </button>
      </div>

      {todos.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">進捗</span>
            <span className="text-sm font-medium text-gray-900">
              {completedCount} / {todos.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-cyan-600 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {todos.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">今日のタスクはまだありません。</p>
            <p className="text-sm text-gray-500 mt-2">
              「タスクを生成」をクリックしてAI搭載の提案を取得しましょう！
            </p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <button
                onClick={() => handleToggle(todo.id, !todo.completed)}
                disabled={togglingIds.has(todo.id)}
                className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110 disabled:opacity-50"
              >
                {togglingIds.has(todo.id) ? (
                  <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                ) : todo.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                )}
              </button>
              <p
                className={`flex-1 text-gray-900 leading-relaxed ${
                  todo.completed ? 'line-through text-gray-500' : ''
                }`}
              >
                {todo.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
