import { Goal } from '../lib/firestore'; // Firebase版のGoal型を使用
import { Target, Calendar, TrendingUp } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  isActive: boolean;
  onClick: () => void;
}

export default function GoalCard({ goal, isActive, onClick }: GoalCardProps) {
  const startDate = new Date(goal.start_date);
  const endDate = new Date(goal.end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(
    0,
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const progress = Math.min(100, (daysElapsed / totalDays) * 100);

  const durationLabels: Record<string, string> = {
    '1month': '1ヶ月',
    '3months': '3ヶ月',
    '6months': '6ヶ月',
    '1year': '1年',
  };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
        isActive
          ? 'border-green-600 bg-green-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`p-2 rounded-lg ${
            isActive ? 'bg-green-600' : 'bg-gray-200'
          }`}
        >
          <Target className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
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
            <TrendingUp className="w-4 h-4" />
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
          残り{daysRemaining}日
        </div>
      </div>
    </div>
  );
}
