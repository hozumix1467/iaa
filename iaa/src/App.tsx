import { useEffect, useState } from 'react';
import { generateDailyTodos } from './lib/openai';
import { onAuthStateChange, logOut, getCurrentUser } from './lib/firebaseAuth';
import { subscribeToUserGoals, Goal } from './lib/firestore';
import { User } from 'firebase/auth';
import FirebaseAuth from './components/FirebaseAuth';
import GoalCard from './components/GoalCard';
import DailyTodos from './components/DailyTodos';
import ApiKeyModal from './components/ApiKeyModal';
import Header from './components/Header';
import Calendar, { SelectedDateTodos } from './components/Calendar';
import FirebaseGoalsPage from './components/FirebaseGoalsPage';
import ReflectionSheet from './components/ReflectionSheet';
import MyPage from './components/MyPage';
import { LogOut, Settings } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [todayTodos, setTodayTodos] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');
  const [currentPage, setCurrentPage] = useState<'home' | 'goals' | 'mypage'>('home');
  const [calendarTodos, setCalendarTodos] = useState<any[]>([]);

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // 初期化時に今日の日付を選択
    setSelectedCalendarDate(todayDate);
  }, [todayDate]);

  useEffect(() => {
    // Firebase認証状態を監視
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // ユーザーがログインした場合、目標データを購読
        const unsubscribeGoals = subscribeToUserGoals((goals) => {
          setGoals(goals);
        });
        
        // クリーンアップ関数を返す
        return () => unsubscribeGoals();
      }
    });

    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setOpenaiApiKey(storedKey);
    }

    return unsubscribe;
  }, []);

  // Firebaseのリアルタイム購読で自動的に更新されるため、このuseEffectは不要
  // useEffect(() => {
  //   if (user) {
  //     loadGoals();
  //   }
  // }, [user]);

  useEffect(() => {
    if (selectedGoal) {
      loadTodayTodos();
    }
  }, [selectedGoal]);

  // カレンダーのTODOデータを読み込み
  useEffect(() => {
    const savedTodos = localStorage.getItem('calendarTodos');
    if (savedTodos) {
      try {
        setCalendarTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('カレンダーTODOの読み込みエラー:', error);
      }
    }
  }, []);

  const loadGoals = () => {
    // Firebaseのリアルタイム購読で自動的に更新されるため、手動での読み込みは不要
    // 必要に応じて個別の目標を読み込む処理を追加
  };

  const loadTodayTodos = async () => {
    if (!selectedGoal) return;

    const { data, error } = await supabase
      .from('daily_todos')
      .select('*')
      .eq('goal_id', selectedGoal.id)
      .eq('todo_date', todayDate)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setTodayTodos(data);
    }
  };

  const handleCreateGoal = async (
    title: string,
    duration: '1month' | '3months' | '6months' | '1year'
  ) => {
    const startDate = new Date();
    const endDate = new Date(startDate);

    switch (duration) {
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

    const { data, error } = await supabase
      .from('goals')
      .insert({
        title,
        duration,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
      })
      .select()
      .single();

    if (!error && data) {
      await loadGoals();
      setSelectedGoal(data);
    }
  };

  const handleGenerateTodos = async () => {
    if (!selectedGoal || !openaiApiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const startDate = new Date(selectedGoal.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(selectedGoal.end_date);

      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysElapsed = Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const todos = await generateDailyTodos(
        selectedGoal.title,
        selectedGoal.duration,
        daysElapsed,
        totalDays,
        openaiApiKey
      );

      for (const todoContent of todos) {
        await supabase.from('daily_todos').insert({
          goal_id: selectedGoal.id,
          todo_date: todayDate,
          content: todoContent,
          completed: false,
        });
      }

      await loadTodayTodos();
    } catch (error: any) {
      alert(`Failed to generate TODOs: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTodo = async (todoId: string, completed: boolean) => {
    await supabase
      .from('daily_todos')
      .update({ completed })
      .eq('id', todoId);

    await loadTodayTodos();
  };

  const handleSignOut = async () => {
    // デモ用：サインアウト機能を無効化
    alert('デモモードではサインアウトできません');
    
    // 元のサインアウト処理はコメントアウト
    // await supabase.auth.signOut();
    // setGoals([]);
    // setSelectedGoal(null);
    // setTodayTodos([]);
  };

  const handleSaveApiKey = (apiKey: string) => {
    setOpenaiApiKey(apiKey);
    localStorage.setItem('openai_api_key', apiKey);
  };

  const handleCalendarDateSelect = (date: string) => {
    setSelectedCalendarDate(date);
  };

  const handleToggleCalendarTodo = (todoId: string) => {
    const updatedTodos = calendarTodos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setCalendarTodos(updatedTodos);
    localStorage.setItem('calendarTodos', JSON.stringify(updatedTodos));
  };

  const handleReflectionTodoToggle = (date: string, todoText: string, completed: boolean) => {
    console.log('=== APP: handleReflectionTodoToggle START ===');
    console.log('Received parameters:', { date, todoText, completed });
    console.log('Received date string:', date);
    console.log('Received date type:', typeof date);
    console.log('selectedCalendarDate:', selectedCalendarDate);
    console.log('Current calendarTodos count:', calendarTodos.length);
    console.log('Current calendarTodos:', calendarTodos);
    
    // 今日の日付を取得
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    console.log('todayString:', todayString);
    
    // もし渡された日付が選択された日付（selectedCalendarDate）と同じ場合は、
    // 選択された日付の翌日に変換する
    let finalDate = date;
    console.log('Checking date conversion conditions:');
    console.log('- date:', date);
    console.log('- selectedCalendarDate:', selectedCalendarDate);
    console.log('- date === selectedCalendarDate:', date === selectedCalendarDate);
    
    if (date === selectedCalendarDate) {
      console.log('Date matches selectedCalendarDate, converting to next day');
      
      // より安全な方法で翌日を計算（ローカル時間を使用）
      const selectedDateObj = new Date(date + 'T00:00:00');
      console.log('selectedDateObj:', selectedDateObj);
      
      const nextDateObj = new Date(selectedDateObj);
      nextDateObj.setDate(nextDateObj.getDate() + 1);
      console.log('nextDateObj:', nextDateObj);
      
      // ローカル時間で日付を取得（UTC時間の問題を回避）
      const nextYear = nextDateObj.getFullYear();
      const nextMonth = String(nextDateObj.getMonth() + 1).padStart(2, '0');
      const nextDay = String(nextDateObj.getDate()).padStart(2, '0');
      finalDate = `${nextYear}-${nextMonth}-${nextDay}`;
      console.log('Converted date to next day:', finalDate);
    } else {
      console.log('Using date as-is:', finalDate);
    }
    
    // カレンダーのTODOリストで一致するものを探して更新
    const updatedTodos = [...calendarTodos]; // 新しい配列を作成
    
    // 一致するTODOが見つからなかった場合は、新しく追加
    const existingTodo = updatedTodos.find(todo => todo.date === finalDate && todo.text === todoText);
    console.log('Existing todo found:', existingTodo);
    
    if (!existingTodo) {
      const newTodo = {
        id: `reflection-${Date.now()}-${Math.random()}`,
        text: todoText,
        completed,
        date: finalDate,
      };
      console.log('CREATING NEW TODO:', newTodo);
      updatedTodos.push(newTodo);
      console.log('Updated todos after adding:', updatedTodos);
    } else {
      console.log('UPDATING EXISTING TODO');
      // 既存のTODOの完了状態を更新
      const todoIndex = updatedTodos.findIndex(todo => todo.date === finalDate && todo.text === todoText);
      if (todoIndex !== -1) {
        updatedTodos[todoIndex] = { ...updatedTodos[todoIndex], completed };
        console.log('Updated existing todo at index:', todoIndex, updatedTodos[todoIndex]);
      }
    }
    
    console.log('Final updated todos count:', updatedTodos.length);
    console.log('Final updated todos:', updatedTodos);
    
    setCalendarTodos(updatedTodos);
    localStorage.setItem('calendarTodos', JSON.stringify(updatedTodos));
    
    // 保存後に確認
    const savedData = localStorage.getItem('calendarTodos');
    console.log('Data saved to localStorage:', savedData);
    
    // カレンダーの更新を強制的にトリガー
    setTimeout(() => {
      console.log('Triggering custom calendar update event');
      window.dispatchEvent(new Event('calendarTodosUpdated'));
    }, 100);
    
    console.log('=== APP: handleReflectionTodoToggle END ===');
  };

  const handlePageChange = (page: 'home' | 'goals' | 'mypage') => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <FirebaseAuth onAuth={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      
      {currentPage === 'home' ? (
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
          {/* メインコンテンツエリア */}
          <div className="space-y-8">
            {/* 上部: カレンダーとTODOリスト（横並び） */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* 左側: カレンダー */}
              <div>
                <Calendar 
                  onDateSelect={handleCalendarDateSelect}
                  selectedDate={selectedCalendarDate}
                />
              </div>

              {/* 右側: 選択された日付のTODOリスト */}
              <div>
                <SelectedDateTodos
                  selectedDate={selectedCalendarDate}
                  todos={calendarTodos}
                  onToggleTodo={handleToggleCalendarTodo}
                />
              </div>
            </div>

            {/* 下部: 振り返りシート（全画面） */}
            <ReflectionSheet 
              selectedDate={selectedCalendarDate || todayDate}
              onDateSelect={handleCalendarDateSelect}
              onTodoToggle={handleReflectionTodoToggle}
            />
          </div>
        </div>
             ) : currentPage === 'goals' ? (
               <div className="pt-24">
                 <FirebaseGoalsPage goals={goals} onGoalsChange={loadGoals} />
               </div>
             ) : (
        <div className="pt-24">
          <MyPage 
            onSignOut={handleSignOut}
          />
        </div>
      )}

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleSaveApiKey}
        currentApiKey={openaiApiKey}
      />
    </div>
  );
}

export default App;
