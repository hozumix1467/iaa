import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Target, Clock, X } from 'lucide-react';

interface GoalCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedDate: string) => void;
  goalTitle: string;
  suggestedDuration: string;
}

export default function GoalCalendarModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  goalTitle, 
  suggestedDuration 
}: GoalCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // 提案された期間に基づいて終了日を計算
  const getSuggestedEndDate = () => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    
    switch (suggestedDuration) {
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
      default:
        endDate.setMonth(endDate.getMonth() + 3); // デフォルトは3ヶ月
    }
    
    return endDate;
  };

  const suggestedEndDate = getSuggestedEndDate();
  const daysUntilGoal = Math.ceil((suggestedEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (isOpen) {
      const suggestedDateString = suggestedEndDate.toISOString().split('T')[0];
      console.log('初期化: 提案された日付を選択', suggestedDateString);
      setSelectedDate(suggestedDateString);
    }
  }, [isOpen]);

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
      isPast: prevMonth < new Date(new Date().setHours(0, 0, 0, 0)),
      isSuggested: prevMonth.toISOString().split('T')[0] === suggestedEndDate.toISOString().split('T')[0],
      isSelected: prevMonth.toISOString().split('T')[0] === selectedDate
    });
  }
  
  // 当月の日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = date.toISOString().split('T')[0];
    
    const suggestedDateString = suggestedEndDate.toISOString().split('T')[0];
    const isSelectedDate = dateString === selectedDate;
    const isSuggestedDate = dateString === suggestedDateString;
    
    // デバッグログ（最初の数日のみ）
    if (day <= 3) {
      console.log(`日付 ${day}: ${dateString}, 選択: ${isSelectedDate}, 提案: ${isSuggestedDate}, selectedDate: ${selectedDate}`);
    }
    
    days.push({
      date,
      isCurrentMonth: true,
      isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
      isSuggested: isSuggestedDate,
      isSelected: isSelectedDate
    });
  }
  
  // 次月の日付を追加（カレンダーを埋めるため）
  const remainingDays = 42 - days.length; // 6週間分
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = new Date(year, month + 1, day);
    days.push({
      date: nextMonth,
      isCurrentMonth: false,
      isPast: nextMonth < new Date(new Date().setHours(0, 0, 0, 0)),
      isSuggested: nextMonth.toISOString().split('T')[0] === suggestedEndDate.toISOString().split('T')[0],
      isSelected: nextMonth.toISOString().split('T')[0] === selectedDate
    });
  }
  
  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 過去の日付は選択できない
    if (date < today) {
      console.log('過去の日付のため選択できません:', dateString);
      return;
    }
    
    console.log('選択された日付:', dateString);
    console.log('現在の選択日:', selectedDate);
    setSelectedDate(dateString);
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getDurationLabel = (duration: string): string => {
    const labels: { [key: string]: string } = {
      '1month': '1ヶ月',
      '3months': '3ヶ月',
      '6months': '6ヶ月',
      '1year': '1年'
    };
    return labels[duration] || duration;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">目標の期日を設定</h2>
              <p className="text-sm text-gray-600">目標達成の期日をカレンダーで選択してください</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 目標情報 */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">目標</h3>
          </div>
          <p className="text-gray-800 mb-4">{goalTitle}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">
                AI提案期間: <span className="font-semibold text-blue-700">{getDurationLabel(suggestedDuration)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">
                残り日数: <span className="font-semibold text-green-700">{daysUntilGoal}日</span>
              </span>
            </div>
          </div>
        </div>

        {/* カレンダー */}
        <div className="p-6">
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
                disabled={day.isPast}
                className={`
                  relative p-2 text-sm rounded-lg transition-colors min-h-[40px] flex items-center justify-center
                  ${!day.isCurrentMonth 
                    ? 'text-gray-300' 
                    : day.isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : day.isSelected
                    ? 'bg-green-600 text-white font-semibold hover:bg-green-700'
                    : day.isSuggested
                    ? 'bg-blue-100 text-blue-900 font-semibold hover:bg-blue-200 border-2 border-blue-300'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span>{day.date.getDate()}</span>
                {day.isSuggested && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded-full"></div>
                <span>AI提案日</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>選択日</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>過去の日付</span>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={() => onConfirm(selectedDate)}
            disabled={!selectedDate}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Target className="w-5 h-5" />
            この期日で目標を作成
          </button>
        </div>
      </div>
    </div>
  );
}
