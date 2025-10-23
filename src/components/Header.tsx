import { Home, User, Calendar, Info } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'goals' | 'mypage' | 'lp';
  onPageChange: (page: 'home' | 'goals' | 'mypage' | 'lp') => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange('home')}
                className="relative hover:opacity-80 transition-opacity cursor-pointer"
                title="ホームに戻る"
              >
                <img 
                  src="/icons/logo.png" 
                  alt="IAA Logo" 
                  className="w-24 h-24 object-contain"
                  onError={(e) => {
                    console.log('画像の読み込みに失敗しました:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                    // フォールバック表示を表示
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  onLoad={() => {
                    console.log('画像の読み込みに成功しました');
                  }}
                />
                {/* フォールバック表示 */}
                <div 
                  className="w-24 h-24 bg-gradient-to-r from-slate-700 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-2xl hidden"
                  style={{display: 'none'}}
                >
                  Odop
                </div>
              </button>

            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange('home')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                currentPage === 'home'
                  ? 'bg-slate-700 text-white font-medium shadow-sm border border-slate-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'
              }`}
              title="ホーム"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">ホーム</span>
            </button>
            
            <button
              onClick={() => onPageChange('goals')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                currentPage === 'goals'
                  ? 'bg-slate-700 text-white font-medium shadow-sm border border-slate-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'
              }`}
              title="目標管理"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">目標</span>
            </button>
            
            <button
              onClick={() => onPageChange('lp')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                currentPage === 'lp'
                  ? 'bg-slate-700 text-white font-medium shadow-sm border border-slate-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'
              }`}
              title="サービス紹介"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">サービス</span>
            </button>
            
            <button
              onClick={() => onPageChange('mypage')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                currentPage === 'mypage'
                  ? 'bg-slate-700 text-white font-medium shadow-sm border border-slate-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'
              }`}
              title="マイページ"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">マイページ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
