import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader2, Sparkles, AlertCircle, Edit3, Trash2, Save, X, Target, Calendar } from 'lucide-react';
import { createGoal } from '../lib/firestore';
import { sendGoalChatMessage, generateTodoList, checkOpenAISetup, GoalChatMessage, GoalChatResponse } from '../lib/openaiGoal';
import GoalCalendarModal from './GoalCalendarModal';

// 期間ラベルの取得
const getDurationLabel = (duration: string): string => {
  const labels: { [key: string]: string } = {
    '1month': '1ヶ月',
    '3months': '3ヶ月',
    '6months': '6ヶ月',
    '1year': '1年'
  };
  return labels[duration] || duration;
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIGoalChatProps {
  onGoalCreated: () => void;
}

export default function AIGoalChat({ onGoalCreated }: AIGoalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！あなたの目標を一緒に考えましょう。\n\nどのような目標を達成したいですか？例えば：\n• 新しいスキルを身につけたい\n• 健康やフィットネスを改善したい\n• キャリアの目標がある\n• 趣味や娯楽の目標がある\n\n気軽に教えてください！',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingGoalData, setPendingGoalData] = useState<any>(null);
  const [generatedTodos, setGeneratedTodos] = useState<string[]>([]);
  const [isGeneratingTodos, setIsGeneratingTodos] = useState(false);
  const [editingTodoIndex, setEditingTodoIndex] = useState<number | null>(null);
  const [editingTodoText, setEditingTodoText] = useState<string>('');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerateTodos = async (chatMessages: GoalChatMessage[]) => {
    console.log('handleGenerateTodos開始');
    setIsGeneratingTodos(true);
    setError(null);
    
    try {
      // チャット履歴から目標と期間を抽出
      const goalInfo = extractGoalInfoFromMessages(chatMessages);
      console.log('抽出された目標情報:', goalInfo);
      if (!goalInfo.title || !goalInfo.duration) {
        console.log('目標情報が不足:', { title: goalInfo.title, duration: goalInfo.duration });
        throw new Error('目標と期間の情報が見つかりません。');
      }
      
      console.log('TODOリスト生成開始:', goalInfo);
      const todos = await generateTodoList(goalInfo.title, goalInfo.duration, chatMessages);
      console.log('生成されたTODOリスト:', todos);
      // 最大5個までに制限
      const limitedTodos = todos.slice(0, 5);
      console.log('制限後のTODOリスト:', limitedTodos);
      setGeneratedTodos(limitedTodos);
      console.log('TODOリスト状態更新完了');
      
      // まず目標作成の提案を表示
      const goalProposalMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `素晴らしい目標ですね！「${goalInfo.title}」を${getDurationLabel(goalInfo.duration)}で達成するための計画を立てました。\n\nこの目標を目標ページに保存しますか？`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, goalProposalMessage]);
      
      // 目標作成の提案データを設定
      setPendingGoalData({
        title: goalInfo.title,
        duration: goalInfo.duration,
        reasoning: `${goalInfo.duration}で${goalInfo.title}を達成するための計画`,
        todos: limitedTodos
      });
      
      // TODOリストを表示するメッセージを追加
      const todoMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: `また、目標達成のためのTODOリストも生成しました！\n\n下記のカード形式でTODOリストを確認・編集できます。`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, todoMessage]);
      
    } catch (error: any) {
      console.error('TODOリスト生成エラー:', error);
      setError(error.message || 'TODOリストの生成に失敗しました。');
      
      // エラー時もデバッグ情報を表示
      if (process.env.NODE_ENV === 'development') {
        console.log('エラー時の状態:', {
          generatedTodos: generatedTodos,
          goalInfo: extractGoalInfoFromMessages(chatMessages)
        });
      }
    } finally {
      setIsGeneratingTodos(false);
    }
  };
  
  const extractGoalInfoFromMessages = (messages: GoalChatMessage[]): { title: string; duration: string } => {
    // メッセージから目標と期間を抽出するロジック
    const userMessages = messages.filter(msg => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
    
    // 期間を検出（より詳細なパターンマッチング）
    const durationPatterns = {
      '1month': [
        '1ヶ月', '1か月', '1月', '1month', '1 month', '一ヶ月', '一月',
        '1ヶ月で', '1か月で', '1月で', '1ヶ月以内', '1か月以内',
        '1ヶ月後', '1か月後', '1月後', '一ヶ月後', '一月後'
      ],
      '3months': [
        '3ヶ月', '3か月', '3月', '3months', '3 month', '三ヶ月', '三月',
        '3ヶ月で', '3か月で', '3月で', '3ヶ月以内', '3か月以内',
        '3ヶ月後', '3か月後', '3月後', '三ヶ月後', '三月後'
      ],
      '6months': [
        '6ヶ月', '6か月', '6月', '6months', '6 month', '六ヶ月', '六月',
        '6ヶ月で', '6か月で', '6月で', '6ヶ月以内', '6か月以内',
        '6ヶ月後', '6か月後', '6月後', '六ヶ月後', '六月後'
      ],
      '1year': [
        '1年', '1year', '1 year', '一年', '12ヶ月', '12か月', '12月',
        '1年で', '1年以内', '12ヶ月で', '12か月で',
        '1年後', '一年後', '12ヶ月後', '12か月後'
      ]
    };
    
    let detectedDuration = '3months'; // デフォルト
    for (const [duration, patterns] of Object.entries(durationPatterns)) {
      if (patterns.some(pattern => lastUserMessage.includes(pattern))) {
        detectedDuration = duration;
        break;
      }
    }
    
    // 目標タイトルを抽出（期間の部分を除く）
    let cleanTitle = lastUserMessage;
    
    // 期間の表現を除去
    const periodPatterns = [
      /1[ヶか]月で/g, /3[ヶか]月で/g, /6[ヶか]月で/g, /1年で/g,
      /1[ヶか]月以内/g, /3[ヶか]月以内/g, /6[ヶか]月以内/g, /1年以内/g,
      /1[ヶか]月/g, /3[ヶか]月/g, /6[ヶか]月/g, /1年/g
    ];
    
    periodPatterns.forEach(pattern => {
      cleanTitle = cleanTitle.replace(pattern, '').trim();
    });
    
    return {
      title: cleanTitle || '目標',
      duration: detectedDuration
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // APIキーの設定をチェック
    const setupCheck = checkOpenAISetup();
    if (!setupCheck.configured) {
      setError(setupCheck.message);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // OpenAI APIとの実際の連携
      const chatMessages: GoalChatMessage[] = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      chatMessages.push({ role: 'user', content: inputMessage });
      
      const response: GoalChatResponse = await sendGoalChatMessage(chatMessages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 期間の明確化が必要な場合
      if (response.needsDurationClarification) {
        // 特別な処理は不要、AIが質問を続ける
      }
      
      // TODOリスト生成が必要な場合
      if (response.needsTodoList) {
        console.log('needsTodoList=true: TODOリスト生成を実行');
        await handleGenerateTodos(chatMessages);
      }
      
      // ユーザーの入力に期間が含まれている場合は、直接TODOリスト生成を試行
      if (!response.needsDurationClarification && !response.needsTodoList && !response.shouldCreateGoal) {
        const goalInfo = extractGoalInfoFromMessages(chatMessages);
        console.log('フォールバック処理: 目標情報をチェック', goalInfo);
        if (goalInfo.title && goalInfo.duration && goalInfo.title !== '目標') {
          // 期間が含まれている場合は、直接TODOリスト生成
          console.log('期間が含まれているため、直接TODOリスト生成を実行:', goalInfo);
          await handleGenerateTodos(chatMessages);
        } else {
          console.log('フォールバック条件を満たさない:', goalInfo);
        }
      } else {
        console.log('フォールバック処理をスキップ:', {
          needsDurationClarification: response.needsDurationClarification,
          needsTodoList: response.needsTodoList,
          shouldCreateGoal: response.shouldCreateGoal
        });
      }
      
      // 目標作成の提案がある場合
      if (response.shouldCreateGoal && response.goalData) {
        setPendingGoalData(response.goalData);
      }

    } catch (error: any) {
      console.error('AI応答エラー:', error);
      setError(error.message || 'AIとの通信でエラーが発生しました。');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '申し訳ありません、エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (customEndDate?: string) => {
    if (!pendingGoalData) return;
    
    try {
      setIsLoading(true);
      
      const startDate = new Date();
      let endDate: Date;
      
      if (customEndDate) {
        endDate = new Date(customEndDate);
      } else {
        endDate = new Date(startDate);
        switch (pendingGoalData.duration) {
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
      }

      const { error } = await createGoal({
        title: pendingGoalData.title,
        duration: pendingGoalData.duration,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: 'active',
      });

      if (error) {
        throw new Error(error);
      }

      // 成功メッセージを追加
      const daysUntilGoal = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const successMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `✅ 目標を作成しました！\n\n目標: ${pendingGoalData.title}\n期日: ${endDate.toLocaleDateString('ja-JP')}\n残り日数: ${daysUntilGoal}日\n\n素晴らしい目標ですね！他にも目標があれば、お気軽にお話しください。\n\n例えば：\n• 新しいスキルを身につけたい\n• 健康やフィットネスを改善したい\n• キャリアの目標がある\n• 趣味や娯楽の目標がある\n\nどんな目標でも一緒に考えましょう！`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, successMessage]);
      setPendingGoalData(null);
      setGeneratedTodos([]);
      setIsCalendarModalOpen(false);
      onGoalCreated();
      
    } catch (error: any) {
      console.error('目標作成エラー:', error);
      setError(error.message || '目標の作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalendarConfirm = (selectedDate: string) => {
    handleCreateGoal(selectedDate);
  };

  const handleRejectGoal = () => {
    setPendingGoalData(null);
    const rejectMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: 'assistant',
      content: '了解しました。目標を調整しましょう。\n\nどの部分を変更したいですか？',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, rejectMessage]);
  };

  const handleEditTodo = (index: number) => {
    setEditingTodoIndex(index);
    setEditingTodoText(generatedTodos[index]);
  };

  const handleSaveTodo = (index: number) => {
    if (editingTodoText.trim()) {
      const updatedTodos = [...generatedTodos];
      updatedTodos[index] = editingTodoText.trim();
      setGeneratedTodos(updatedTodos);
    }
    setEditingTodoIndex(null);
    setEditingTodoText('');
  };

  const handleCancelEdit = () => {
    setEditingTodoIndex(null);
    setEditingTodoText('');
  };

  const handleDeleteTodo = (index: number) => {
    const updatedTodos = generatedTodos.filter((_, i) => i !== index);
    setGeneratedTodos(updatedTodos);
  };

  const handleAddTodosToCalendar = async () => {
    if (generatedTodos.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // TODOリストをカレンダーに追加する処理
      // ここでは、ローカルストレージにTODOリストを保存し、カレンダーコンポーネントが読み込めるようにします
      const today = new Date();
      const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const todoItems = generatedTodos.map((todo, index) => ({
        id: `todo-${Date.now()}-${index}`,
        text: todo,
        completed: false,
        date: todayString // 今日の日付
      }));
      
      // ローカルストレージに保存
      const existingTodos = JSON.parse(localStorage.getItem('calendarTodos') || '[]');
      const updatedTodos = [...existingTodos, ...todoItems];
      localStorage.setItem('calendarTodos', JSON.stringify(updatedTodos));
      
      // 成功メッセージを追加
      const successMessage: Message = {
        id: (Date.now() + 3).toString(),
        role: 'assistant',
        content: `✅ TODOリストをカレンダーに追加しました！\n\n${generatedTodos.length}個のタスクが今日の日付でカレンダーに追加されました。カレンダーページで確認できます。\n\n他にも目標があれば、お気軽にお話しください！`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, successMessage]);
      setGeneratedTodos([]);
      
    } catch (error: any) {
      console.error('カレンダー追加エラー:', error);
      setError(error.message || 'カレンダーへの追加に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
      {/* AI情報 */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span>GPT-3.5搭載</span>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* チャット履歴 */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">AIが考え中...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* TODOリスト生成中 */}
      {isGeneratingTodos && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800">TODOリストを生成中...</span>
          </div>
        </div>
      )}

      {/* デバッグ情報 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p>デバッグ: generatedTodos.length = {generatedTodos.length}</p>
          <p>generatedTodos = {JSON.stringify(generatedTodos)}</p>
        </div>
      )}

      {/* 生成されたTODOリスト */}
      {generatedTodos.length > 0 ? (
        <div className="mb-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-blue-900">TODOリスト（最大5個）</h4>
              <p className="text-sm text-blue-700">各TODOをクリックして編集できます</p>
            </div>
          </div>
          
          <div className="grid gap-3 mb-6">
            {generatedTodos.map((todo, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                {editingTodoIndex === index ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={editingTodoText}
                      onChange={(e) => setEditingTodoText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveTodo(index)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="保存"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="キャンセル"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-gray-800 text-sm font-medium flex-1">{todo}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditTodo(index)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(index)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAddTodosToCalendar}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              カレンダーに追加
            </button>
            <button
              onClick={() => setGeneratedTodos([])}
              disabled={isLoading}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        // TODOリストが空で、生成中でない場合のフォールバック表示
        generatedTodos.length === 0 && !isGeneratingTodos && (
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-sm text-center">
              TODOリストの生成を待っています...
            </p>
          </div>
        )
      )}

      {/* 目標作成確認 */}
      {pendingGoalData && (
        <div className="mb-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-green-900">目標作成の提案</h4>
              <p className="text-sm text-green-700">この目標を目標ページに保存しますか？</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
            <div className="text-sm text-gray-800 space-y-2">
              <div>
                <span className="font-semibold text-green-800">タイトル:</span>
                <span className="ml-2">{pendingGoalData.title}</span>
              </div>
              <div>
                <span className="font-semibold text-green-800">期間:</span>
                <span className="ml-2">{getDurationLabel(pendingGoalData.duration)}</span>
              </div>
              <div>
                <span className="font-semibold text-green-800">理由:</span>
                <span className="ml-2">{pendingGoalData.reasoning}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg transition-all"
            >
              <Calendar className="w-5 h-5" />
              期日を確認して作成
            </button>
            <button
              onClick={handleCreateGoal}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg transition-all"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
              そのまま作成
            </button>
            <button
              onClick={handleRejectGoal}
              disabled={isLoading}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium transition-colors"
            >
              修正する
            </button>
          </div>
        </div>
      )}

      {/* 入力エリア */}
      <div className="flex gap-3">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="目標について教えてください..."
          className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* カレンダーモーダル */}
      {pendingGoalData && (
        <GoalCalendarModal
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
          onConfirm={handleCalendarConfirm}
          goalTitle={pendingGoalData.title}
          suggestedDuration={pendingGoalData.duration}
        />
      )}
    </div>
  );
}