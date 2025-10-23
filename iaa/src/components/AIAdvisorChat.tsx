import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Edit2, X } from 'lucide-react';
import { checkOpenAISetup } from '../lib/openaiGoal';
import OpenAI from 'openai';
import CustomModal from './CustomModal';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AIAdvisorChatProps {
  memo: string;
  selectedDate: string;
  initialMessage?: string;
  onClose: () => void;
  isInline?: boolean;
  onAddTodo?: (date: string, todoText: string, completed: boolean) => void;
}

// TODO編集アイテムコンポーネント
interface TodoEditItemProps {
  todo: string;
  onAdd: () => void;
  onEdit: (newTodo: string) => void;
}

function TodoEditItem({ todo, onAdd, onEdit }: TodoEditItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo);

  const handleEdit = () => {
    if (editText.trim() && editText !== todo) {
      onEdit(editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleEdit();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <button
          onClick={handleEdit}
          className="p-1 text-green-600 hover:text-green-700 transition-colors"
          title="保存"
        >
          <Send className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="キャンセル"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
      <button
        onClick={onAdd}
        className="flex-1 text-left px-2 py-1 text-green-800 text-sm hover:bg-green-100 rounded transition-colors"
      >
        + {todo}
      </button>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
        title="編集"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AIAdvisorChat({ memo, selectedDate, initialMessage, onClose, isInline = false, onAddTodo }: AIAdvisorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動スクロール関数
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // メッセージが更新されたときに自動スクロール
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // initialMessageが提供された場合は自動的にチャットを開始
  useEffect(() => {
    if (initialMessage && memo.trim() && !isInitialized) {
      console.log('AIAdvisorChat: Auto-initializing with initialMessage:', initialMessage);
      const defaultMessage = `こんにちは！${(() => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
      })()}のメモを読ませていただきました。\n\n何かお困りのことや相談したいことはありますか？`;

      const initialChatMessage: ChatMessage = {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: initialMessage || defaultMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages([initialChatMessage]);
      setIsInitialized(true);
    }
  }, [initialMessage, memo, selectedDate]);
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

  const initializeChat = () => {
    if (memo.trim() && !isInitialized) {
      const defaultMessage = `こんにちは！${(() => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return dateObj.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
      })()}のメモを読ませていただきました。\n\n何かお困りのことや相談したいことはありますか？`;

      const initialChatMessage: ChatMessage = {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: initialMessage || defaultMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages([initialChatMessage]);
      setIsInitialized(true);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // OpenAI APIの設定状況をチェック
    const { configured } = checkOpenAISetup();
    if (!configured) {
      setModal({
        isOpen: true,
        message: 'OpenAI APIが設定されていません。設定からAPIキーを入力してください。',
        type: 'warning',
        title: '設定が必要です'
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // OpenAI APIキーを取得
      const apiKey = localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        throw new Error('OpenAI APIキーが設定されていません');
      }

      const openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });

      // チャット履歴を構築
      const chatHistory = [
        {
          role: 'system' as const,
          content: `あなたは親切で専門的なライフコーチです。ユーザーの日々の振り返りメモを基に、具体的で実用的なアドバイスを提供してください。\n\n今日のメモ: ${memo}\n\nユーザーの質問に対して、以下の点を考慮して回答してください：\n1. メモの内容を踏まえた具体的なアドバイス\n2. 実行可能で実用的な提案\n3. 励ましやポジティブな言葉\n4. 必要に応じて質問や提案\n\n回答は日本語で、親しみやすく丁寧な口調でお願いします。\n\n重要：回答は簡潔に、1つのトピックに絞って回答してください。長い説明は避け、チャット形式で会話を続けられるように心がけてください。`
        },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: inputMessage
        }
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: chatHistory,
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '申し訳ございません。AIからの返答を生成できませんでした。';
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AIチャットエラー:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '申し訳ございません。AIとの通信でエラーが発生しました。しばらく時間をおいてから再度お試しください。',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // TODOを追加する関数
  const addTodoToCalendar = (todoText: string, targetDate?: string) => {
    console.log('=== AI CHAT: addTodoToCalendar START ===');
    console.log('Input parameters:', { todoText, targetDate, selectedDate });
    
    // AIアドバイザーからのTODO追加は常に選択された日付の翌日を使用
    const [year, month, day] = selectedDate.split('-').map(Number);
    console.log('Parsed selectedDate:', { year, month, day });
    
    // より安全な方法で翌日を計算（ローカル時間を使用）
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    console.log('selectedDateObj:', selectedDateObj);
    
    const nextDateObj = new Date(selectedDateObj);
    nextDateObj.setDate(nextDateObj.getDate() + 1);
    console.log('nextDateObj:', nextDateObj);
    
    // ローカル時間で日付を取得（UTC時間の問題を回避）
    const nextYear = nextDateObj.getFullYear();
    const nextMonth = String(nextDateObj.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextDateObj.getDate()).padStart(2, '0');
    const dateToUse = `${nextYear}-${nextMonth}-${nextDay}`;
    console.log('dateToUse (next day string):', dateToUse);
    console.log('Final dateToUse for AI chat:', dateToUse);
    
    if (onAddTodo) {
      console.log('AI CHAT: Calling onAddTodo with:', { date: dateToUse, text: todoText, completed: false });
      onAddTodo(dateToUse, todoText, false);
      console.log('=== AI CHAT: addTodoToCalendar END ===');
    } else {
      console.error('onAddTodo is not defined!');
    }
  };

  // メッセージからTODOリストを抽出する関数
  const extractTodosFromMessage = (message: string): string[] => {
    const todoMatches = message.match(/\d+\.\s*([^\n]+)/g);
    if (todoMatches) {
      return todoMatches.map(match => match.replace(/^\d+\.\s*/, '').trim());
    }
    return [];
  };

  if (!isInitialized) {
    if (isInline) {
      return (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">AIアドバイザー</h3>
          </div>
          
          <p className="text-gray-600 mb-6">
            メモの内容を基に、AIが短い返答でアドバイスを提供します。
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={initializeChat}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              チャットを開始
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">AIアドバイザー</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              メモの内容を基に、AIが短い返答でアドバイスを提供します。
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={initializeChat}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                チャットを開始
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (isInline) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col h-[700px]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">AIアドバイザー</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap text-lg leading-relaxed">{message.content}</div>
                
                {/* TODOリストのボタン表示 */}
                {message.role === 'assistant' && onAddTodo && (
                  (() => {
                    const todos = extractTodosFromMessage(message.content);
                    return todos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">これらのタスクをカレンダーに追加:</div>
                        <div className="space-y-2">
                          {todos.map((todo, index) => (
                            <TodoEditItem
                              key={index}
                              todo={todo}
                              onAdd={() => addTodoToCalendar(todo)}
                              onEdit={(newTodo) => addTodoToCalendar(newTodo)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}
                
                <div className={`text-sm mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-600">AIが回答を生成中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              rows={3}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ポップアップ表示（従来通り）
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[800px] mx-4 flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">AIアドバイザー</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-lg leading-relaxed">{message.content}</div>
                
                {/* TODOリストのボタン表示 */}
                {message.role === 'assistant' && onAddTodo && (
                  (() => {
                    const todos = extractTodosFromMessage(message.content);
                    return todos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm text-gray-600 mb-2">これらのタスクをカレンダーに追加:</div>
                        <div className="space-y-2">
                          {todos.map((todo, index) => (
                            <TodoEditItem
                              key={index}
                              todo={todo}
                              onAdd={() => addTodoToCalendar(todo)}
                              onEdit={(newTodo) => addTodoToCalendar(newTodo)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })()
                )}
                
                <div className={`text-sm mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-gray-600">AIが回答を生成中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              rows={3}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* カスタムモーダル */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
