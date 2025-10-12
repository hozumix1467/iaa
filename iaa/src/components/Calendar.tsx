import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

interface CalendarProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
}

export default function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<TodoItem[]>([]);
  
  const today = new Date();

  // ローカルストレージからTODOリストを読み込み
  useEffect(() => {
    const loadTodos = () => {
      const savedTodos = localStorage.getItem('calendarTodos');
      if (savedTodos) {
        try {
          const parsedTodos = JSON.parse(savedTodos);
          console.log('Calendar: Loading todos from localStorage, count:', parsedTodos.length);
          setTodos(parsedTodos);
        } catch (error) {
          console.error('TODOリストの読み込みエラー:', error);
        }
      } else {
        console.log('Calendar: No todos found in localStorage');
      }
    };

    // 初回読み込み
    loadTodos();

    // ローカルストレージの変更を監視
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'calendarTodos') {
        console.log('Calendar: Storage change detected, reloading todos');
        loadTodos();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // カスタムイベントでローカルストレージの変更を検知（同じタブ内）
    const handleCustomStorageChange = () => {
      console.log('Calendar: Custom storage event detected, reloading todos');
      loadTodos();
    };

    window.addEventListener('calendarTodosUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('calendarTodosUpdated', handleCustomStorageChange);
    };
  }, []);

  // 特定の日付のTODOリストを取得
  const getTodosForDate = (date: string): TodoItem[] => {
    const filteredTodos = todos.filter(todo => todo.date === date);
    return filteredTodos;
  };

  // TODOの完了状態を切り替え
  const toggleTodo = (todoId: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    localStorage.setItem('calendarTodos', JSON.stringify(updatedTodos));
  };
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  
  const days = [];
  
  // 前月の日付を追加
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevMonth = new Date(year, month, -i);
    days.push({
      date: prevMonth,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false
    });
  }
  
  // 当月の日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    days.push({
      date,
      isCurrentMonth: true,
      isToday: dateString === todayString,
      isSelected: dateString === selectedDate
    });
  }
  
  // 次月の日付を追加（カレンダーを埋めるため）
  const remainingDays = 42 - days.length; // 6週間分
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = new Date(year, month + 1, day);
    days.push({
      date: nextMonth,
      isCurrentMonth: false,
      isToday: false,
      isSelected: false
    });
  }
  
  const handleDateClick = (date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (onDateSelect) {
      onDateSelect(dateString);
    }
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // goToToday関数は削除（今日ボタンを削除したため）
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {year}年 {monthNames[month]}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="前月"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="次月"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day.date)}
            className={`
              relative p-2 text-sm rounded-lg transition-colors min-h-[80px] flex flex-col
              ${!day.isCurrentMonth 
                ? 'text-gray-300 hover:bg-gray-50' 
                : day.isToday
                ? 'bg-green-600 text-white font-semibold hover:bg-green-700'
                : day.isSelected
                ? 'bg-green-100 text-green-900 font-semibold hover:bg-green-200'
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span className="text-left">{day.date.getDate()}</span>
            
            {/* TODOリストの表示 */}
            {day.isCurrentMonth && (
              <div className="flex-1 mt-1 space-y-1">
                {getTodosForDate(`${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`).slice(0, 2).map((todo, todoIndex) => (
                  <div key={todo.id} className="flex items-center gap-1">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTodo(todo.id);
                      }}
                      className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      {todo.completed ? (
                        <CheckCircle className={`w-3 h-3 ${day.isToday ? 'text-green-200' : 'text-green-600'}`} />
                      ) : (
                        <Circle className={`w-3 h-3 ${day.isToday ? 'text-white' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className={`text-xs truncate ${
                      day.isToday ? 'text-white' : 'text-gray-600'
                    } ${todo.completed ? 'line-through opacity-60' : ''}`}>
                      {todo.text}
                    </span>
                  </div>
                ))}
                {getTodosForDate(`${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`).length > 2 && (
                  <div className={`text-xs ${day.isToday ? 'text-white' : 'text-gray-500'}`}>
                    +{getTodosForDate(`${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`).length - 2}件
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>今日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 rounded-full"></div>
            <span>選択日</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 選択された日付のTODOを表示するコンポーネント
interface SelectedDateTodosProps {
  selectedDate?: string;
  todos: TodoItem[];
  onToggleTodo: (todoId: string) => void;
}

export function SelectedDateTodos({ selectedDate, todos, onToggleTodo }: SelectedDateTodosProps) {
  // 今日の日付を取得
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // 選択された日付がない場合は今日の日付を使用
  const displayDate = selectedDate || todayString;
  const todayTodos = todos.filter(todo => todo.date === todayString);
  
  // 選択された日付も今日の日付もTODOがない場合はメッセージを表示
  if (!selectedDate && todayTodos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ゴールを作成してAI搭載の日次タスクを開始しましょう！
          </h3>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            目標ページに移動
          </button>
        </div>
      </div>
    );
  }

  // 表示するTODOを決定（選択された日付のTODO、なければ今日のTODO）
  const displayTodos = selectedDate ? todos.filter(todo => todo.date === selectedDate) : todayTodos;
  const [year, month, day] = displayDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dateString = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {dateString}
        </h3>
        <p className="text-sm text-gray-600">
          {displayTodos.length}個のタスク
        </p>
      </div>

      {displayTodos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">この日にはタスクがありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTodos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                todo.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-300'
              }`}
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  todo.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {todo.completed && <CheckCircle className="w-3 h-3" />}
              </button>
              
              <span
                className={`flex-1 text-sm ${
                  todo.completed
                    ? 'text-gray-500 line-through'
                    : 'text-gray-900'
                }`}
              >
                {todo.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
