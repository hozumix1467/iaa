import { useState, useEffect } from 'react';
import { Save, Loader2, CheckSquare, Plus } from 'lucide-react';
// import { supabase } from '../lib/supabase'; // Firebaseに移行済み
import { saveReflection as saveReflectionToFirestore, getReflectionByDate, getUserGoals, getDailyTodosByDate, Goal, DailyTodo } from '../lib/firestore';
import { generateTodoList, checkOpenAISetup } from '../lib/openaiGoal';
import AIAdvisorChat from './AIAdvisorChat';
import CustomModal from './CustomModal';

interface ReflectionData {
  id?: string;
  date: string;
  memo: string;
  todos?: string[];
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface ReflectionSheetProps {
  selectedDate: string;
  onDateSelect?: (date: string) => void;
  onTodoToggle?: (date: string, todoText: string, completed: boolean) => void;
}

export default function ReflectionSheet({ selectedDate, onTodoToggle }: ReflectionSheetProps) {
  console.log('ReflectionSheet initialized with:', { selectedDate, onTodoToggle: !!onTodoToggle });
  const [reflection, setReflection] = useState<ReflectionData>({
    date: selectedDate,
    memo: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submittingToAI, setSubmittingToAI] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [showTodos, setShowTodos] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatInitialMessage, setAiChatInitialMessage] = useState('');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    isOpen: false,
    message: '',
    type: 'info'
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayTodos, setTodayTodos] = useState<DailyTodo[]>([]);

  useEffect(() => {
    console.log('ReflectionSheet: selectedDate changed to:', selectedDate);
    setTodos([]); // 日付変更時にTODOリストをリセット
    setShowTodos(false);
    loadReflection();
    loadGoalsAndTodayTodos();
  }, [selectedDate]);

  const showModal = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string) => {
    setModal({
      isOpen: true,
      message,
      type,
      title
    });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const loadGoalsAndTodayTodos = async () => {
    try {
      // 目標データを取得
      const { goals, error: goalsError } = await getUserGoals();
      if (goalsError) {
        console.error('目標データの読み込みエラー:', goalsError);
      } else {
        setGoals(goals);
      }

      // 今日のTODO実績を取得
      const { todos, error: todosError } = await getDailyTodosByDate(selectedDate);
      if (todosError) {
        console.error('今日のTODO実績の読み込みエラー:', todosError);
      } else {
        setTodayTodos(todos);
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  };

  const loadReflection = async () => {
    setLoading(true);
    try {
      const { reflection, error } = await getReflectionByDate(selectedDate);
      
      if (error) {
        console.error('振り返りデータの読み込みエラー:', error);
        // エラーが発生した場合でも初期値を設定
        setReflection({
          date: selectedDate,
          memo: '',
        });
      } else if (reflection) {
        setReflection({
          id: reflection.id,
          date: selectedDate, // 選択された日付を使用
          memo: reflection.memo,
        });
        
        // 保存されたTODOリストがあれば復元
        if (reflection.todos && reflection.todos.length > 0) {
          const restoredTodos: TodoItem[] = reflection.todos.map((todoText: string, index: number) => ({
            id: `restored-${reflection.id}-${index}`,
            text: todoText,
            completed: false, // 保存時は完了状態をリセット
            createdAt: new Date().toISOString(),
          }));
          setTodos(restoredTodos);
          setShowTodos(true);
        }
      } else {
        // 新しい日付の場合、初期値を設定
        setReflection({
          date: selectedDate,
          memo: '',
        });
      }
    } catch (error) {
      console.error('振り返りデータの読み込みエラー:', error);
      // エラーが発生した場合でも初期値を設定
      setReflection({
        date: selectedDate,
        memo: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReflection = async () => {
    setSaving(true);
    try {
      const { id, error } = await saveReflectionToFirestore({
        date: selectedDate, // 選択された日付を使用
        memo: reflection.memo,
        todos: todos.map(todo => todo.text), // TODOリストのテキストのみ保存
      });

      if (error) {
        console.error('振り返りデータの保存エラー:', error);
        showModal('振り返りの保存に失敗しました', 'error', 'エラー');
      } else {
        if (id) {
          setReflection(prev => ({ ...prev, id }));
        }
        showModal('振り返りとTODOリストを保存しました！', 'success', '保存完了');
        
        // 翌日のTODOリストを自動生成
        await generateNextDayTodos();
      }
    } catch (error) {
      console.error('保存エラー:', error);
      showModal('振り返りの保存に失敗しました', 'error', 'エラー');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ReflectionData, value: string) => {
    setReflection(prev => ({ ...prev, [field]: value }));
  };

  const generateNextDayTodos = async () => {
    // OpenAI APIの設定状況をチェック
    const { configured } = checkOpenAISetup();
    if (!configured) {
      console.log('OpenAI APIが設定されていないため、翌日のTODO生成をスキップします');
      return;
    }

    try {
      // 翌日の日付を計算
      const [year, month, day] = selectedDate.split('-').map(Number);
      const currentDate = new Date(year, month - 1, day);
      currentDate.setDate(currentDate.getDate() + 1);
      const nextDateString = currentDate.toISOString().split('T')[0];
      
      // 選択された日付の翌日TODO生成を許可（制限を削除）
      console.log('選択された日付の翌日TODO生成を実行します:', selectedDate);

      // 今日のメモから翌日のTODOリストを生成
      const generatedTodos = await generateTodoList(
        '翌日のタスク計画',
        '1day',
        [{ 
          role: 'user', 
          content: `今日のメモ: ${reflection.memo}\n\nこのメモを基に、明日（${nextDateString}）のTODOリストを3-5個生成してください。` 
        }]
      );

      if (generatedTodos && generatedTodos.length > 0) {
        // 生成されたTODOを翌日のカレンダーに追加
        if (onTodoToggle) {
          generatedTodos.forEach(todo => {
            onTodoToggle(nextDateString, todo, false);
          });
        }
        
        showModal(`翌日（${currentDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}）のTODOリストを${generatedTodos.length}個生成しました！`, 'success', 'TODO生成完了');
      }
    } catch (error) {
      console.error('翌日TODO生成エラー:', error);
      // エラーが発生しても保存処理は成功とする（エラーメッセージは表示しない）
    }
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: `manual-${Date.now()}`,
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos(prev => [...prev, todo]);
      setNewTodo('');
      
      // カレンダーにも追加（選択された日付に対して）
      if (onTodoToggle) {
        onTodoToggle(selectedDate, todo.text, false);
      }
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo => {
        if (todo.id === id) {
          const newCompleted = !todo.completed;
          // カレンダーのTODOも更新
          if (onTodoToggle) {
            onTodoToggle(selectedDate, todo.text, newCompleted);
          }
          return { ...todo, completed: newCompleted };
        }
        return todo;
      });
      return updatedTodos;
    });
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const handleSubmitToAI = async () => {
    if (!reflection.memo.trim()) {
      showModal('メモが空です。AIに提出する前にメモを書いてください。', 'warning', '入力が必要です');
      return;
    }

    // 目標が設定されているかチェック
    if (goals.length === 0) {
      showModal('目標が設定されていません。まず目標を作成してください。', 'warning', '目標が必要です');
      return;
    }

    // OpenAI APIの設定状況をチェック
    const { configured } = checkOpenAISetup();
    if (!configured) {
      showModal('OpenAI APIが設定されていません。設定からAPIキーを入力してください。', 'warning', '設定が必要です');
      return;
    }

    setSubmittingToAI(true);
    try {
      console.log('=== STARTING SAVE PROCESS ===');
      // まずメモを保存
      const { id, error: saveError } = await saveReflectionToFirestore({
        date: selectedDate,
        memo: reflection.memo,
        todos: todos.map(todo => todo.text),
      });

      if (saveError) {
        console.error('振り返りデータの保存エラー:', saveError);
        showModal('メモの保存に失敗しました', 'error', 'エラー');
        return;
      }

      console.log('=== SAVE PROCESS COMPLETED ===');
      console.log('Save result:', { id, error: saveError });

      if (id) {
        setReflection(prev => ({ ...prev, id }));
      }
      
      console.log('=== SAVING COMPLETED, STARTING DATE CALCULATION ===');
      // 翌日の日付を計算
      console.log('=== DATE CALCULATION DEBUG START ===');
      const [year, month, day] = selectedDate.split('-').map(Number);
      console.log('selectedDate:', selectedDate);
      console.log('parsed date parts:', { year, month, day });
      
      // 選択された日付の翌日TODO生成を許可（制限を削除）
      console.log('選択された日付の翌日TODO生成を実行します:', selectedDate);
      
      // より安全な方法で翌日を計算（ローカル時間を使用）
      const selectedDateObj = new Date(selectedDate + 'T00:00:00');
      console.log('selectedDateObj:', selectedDateObj);
      
      const tomorrowDateObj = new Date(selectedDateObj);
      tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1);
      console.log('tomorrowDateObj:', tomorrowDateObj);
      
      // ローカル時間で日付を取得（UTC時間の問題を回避）
      const tomorrowYear = tomorrowDateObj.getFullYear();
      const tomorrowMonth = String(tomorrowDateObj.getMonth() + 1).padStart(2, '0');
      const tomorrowDay = String(tomorrowDateObj.getDate()).padStart(2, '0');
      const tomorrowString = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
      console.log('tomorrowString calculated:', tomorrowString);
      console.log('tomorrowString type:', typeof tomorrowString);
      console.log('=== DATE CALCULATION DEBUG END ===');

      // 今日のTODO実績を分析
      const completedTodos = todayTodos.flatMap(todo => 
        todo.todos.map((text, index) => ({
          text,
          completed: todo.completed[index]
        }))
      );

      const completedCount = completedTodos.filter(t => t.completed).length;
      const totalCount = completedTodos.length;
      const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

      // 目標情報を整理
      const activeGoals = goals.filter(goal => goal.status === 'active');
      const goalsText = activeGoals.map(goal => 
        `・${goal.title} (${goal.duration === '1month' ? '1ヶ月' : goal.duration === '3months' ? '3ヶ月' : goal.duration === '6months' ? '6ヶ月' : '1年'}目標)`
      ).join('\n');

      // 今日の実績サマリー
      const todaySummary = completedTodos.length > 0 ? 
        `今日のタスク実績:\n完了: ${completedCount}/${totalCount} (${completionRate.toFixed(0)}%)\n完了したタスク: ${completedTodos.filter(t => t.completed).map(t => `・${t.text}`).join('\n')}\n未完了のタスク: ${completedTodos.filter(t => !t.completed).map(t => `・${t.text}`).join('\n')}` :
        '今日はタスクが設定されていませんでした。';

      // メモの内容から明日のTODOリストを生成
      console.log('=== STARTING TODO GENERATION ===');
      const generatedTodos = await generateTodoList(
        '目標達成のための明日のタスク計画',
        '1day',
        [{ 
          role: 'user', 
          content: `【目標情報】\n${goalsText}\n\n【${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}の実績】\n${todaySummary}\n\n【${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}のメモ】\n${reflection.memo}\n\n上記の情報を基に、${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}の振り返りから目標達成に向けた翌日（${tomorrowDateObj.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}）のTODOリストを必ず5個生成してください。\n\n以下の点を考慮してください：\n1. ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}の実績を踏まえて、継続すべきタスクや改善すべきタスクを提案\n2. 未完了のタスクがあれば、それを優先的に含める\n3. 目標達成に直結する具体的なアクション\n4. ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}のメモの内容から学んだことを反映\n5. 実行可能で測定可能なタスクにしてください\n\n各タスクは「30分ウォーキングする」「英語の単語を20個覚える」のように、具体的で時間や数値が明確なものにしてください。` 
        }]
      );

      console.log('=== TODO GENERATION COMPLETED ===');
      console.log('Generated todos result:', generatedTodos);
      
      if (generatedTodos && generatedTodos.length > 0) {
        console.log('Generated todos:', generatedTodos);
        console.log('Tomorrow date string:', tomorrowString);
        console.log('onTodoToggle function exists:', !!onTodoToggle);
        
        // 生成されたTODOを明日のカレンダーに追加
        if (onTodoToggle) {
          console.log('=== TODO ADDITION DEBUG START ===');
          console.log('Generated todos count:', generatedTodos.length);
          console.log('Generated todos:', generatedTodos);
          console.log('Tomorrow date string:', tomorrowString);
          console.log('Selected date:', selectedDate);
          console.log('onTodoToggle function exists:', !!onTodoToggle);
          
          generatedTodos.forEach((todo, index) => {
            console.log(`--- Adding todo ${index + 1}/${generatedTodos.length} ---`);
            console.log('Todo text:', todo);
            console.log('Target date (tomorrowString):', tomorrowString);
            console.log('Completed status:', false);
            console.log('Calling onTodoToggle with:', { date: tomorrowString, text: todo, completed: false });
            onTodoToggle(tomorrowString, todo, false);
          });
          console.log('=== TODO ADDITION DEBUG END ===');
        } else {
          console.error('CRITICAL ERROR: onTodoToggle function is not provided!');
        }
        
        // カレンダーの更新を強制的にトリガー
        setTimeout(() => {
          console.log('ReflectionSheet: Triggering custom calendar update event');
          window.dispatchEvent(new Event('calendarTodosUpdated'));
        }, 100);
        
        // AIアドバイザーチャットも同時に開始（ポップアップの内容も含める）
        const popupMessage = `✅ AIが${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}のメモを基に、翌日（${tomorrowDateObj.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}）の目標達成TODOリストを${generatedTodos.length}個生成しました！\n\n${new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}の実績（完了率: ${completionRate.toFixed(0)}%）を考慮して、目標達成に最適化されたタスクを提案しました。\n\n生成されたTODOは翌日（${tomorrowDateObj.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}）のカレンダーに追加されました。\n\n【生成されたTODOリスト】\n${generatedTodos.map((todo, index) => `${index + 1}. ${todo}`).join('\n')}\n\n生成されたTODOについて、何か質問や相談はありますか？`;
        console.log('Setting AI chat initial message:', popupMessage);
        setAiChatInitialMessage(popupMessage);
        console.log('Setting showAIChat to true');
        setShowAIChat(true);
      } else {
        showModal('TODOリストの生成に失敗しました。メモの内容をより具体的に書いてみてください。', 'error', '生成失敗');
      }
    } catch (error) {
      console.error('AI提出エラー:', error);
      showModal(`AIへの提出に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`, 'error', 'エラー');
    } finally {
      setSubmittingToAI(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="text-gray-600">振り返りデータを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">メモ</h2>
          <p className="text-lg text-gray-600">
            {(() => {
              // selectedDateは "YYYY-MM-DD" 形式
              const [year, month, day] = selectedDate.split('-').map(Number);
              const dateObj = new Date(year, month - 1, day); // monthは0ベース
              console.log('Date display: selectedDate =', selectedDate, 'parsed date =', dateObj);
              return dateObj.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              });
            })()}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* メモ入力エリア */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}のメモを書いてください
          </label>
          <textarea
            value={reflection.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            placeholder="その日にあったこと、感じたこと、覚えておきたいことなどを自由に書いてください..."
            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-lg min-h-[300px]"
          />
        </div>

        {/* TODOリストセクション */}
        {todos.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-purple-600" />
                TODOリスト
              </h3>
              <button
                onClick={() => setShowTodos(!showTodos)}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showTodos ? '非表示' : '表示'}
              </button>
            </div>
            
            {showTodos && (
              <div className="space-y-4">
                {/* 新しいTODO追加 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    placeholder="新しいTODOを追加..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTodo}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </button>
                </div>

                {/* TODOリスト */}
                <div className="space-y-2">
                  {todos.map((todo) => {
                    const isGenerated = todo.id.startsWith('generated-');
                    return (
                      <div
                        key={todo.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          todo.completed
                            ? 'bg-gray-50 border-gray-200'
                            : isGenerated
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            todo.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {todo.completed && <CheckSquare className="w-3 h-3" />}
                        </button>
                        
                        <span
                          className={`flex-1 text-sm ${
                            todo.completed
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {todo.text}
                          {isGenerated && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              AI生成
                            </span>
                          )}
                        </span>
                        
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 進捗表示 */}
                <div className="text-sm text-gray-600">
                  完了: {todos.filter(t => t.completed).length} / {todos.length} タスク
                </div>
              </div>
            )}
          </div>
        )}

        {/* ボタンエリア */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={saveReflection}
              disabled={saving}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : 'メモを保存'}
            </button>
            
            <button
              onClick={handleSubmitToAI}
              disabled={submittingToAI || !reflection.memo.trim()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submittingToAI ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  明日のTODO生成中...
                </>
              ) : (
                <>
                  <CheckSquare className="w-5 h-5" />
                  明日の目標達成TODO生成
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* AIアドバイザーチャット（インライン表示） */}
      {showAIChat && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <AIAdvisorChat
            memo={reflection.memo}
            selectedDate={selectedDate}
            initialMessage={aiChatInitialMessage}
            onClose={() => {
              setShowAIChat(false);
              setAiChatInitialMessage('');
            }}
            isInline={true}
            onAddTodo={onTodoToggle}
          />
        </div>
      )}
      
      {/* カスタムモーダル */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        autoClose={modal.type === 'success'}
        autoCloseDelay={3000}
      />
    </div>
  );
}
