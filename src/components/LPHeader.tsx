import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface LPHeaderProps {
  onPageChange?: (page: 'home' | 'goals' | 'mypage' | 'lp') => void;
}

export default function LPHeader({ onPageChange }: LPHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const menuItems = [
    { label: 'ホーム', page: 'home' },
    { label: '目標管理', page: 'goals' },
    { label: 'マイページ', page: 'mypage' },
  ];

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (page: 'home' | 'goals' | 'mypage') => {
    if (onPageChange) {
      onPageChange(page);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <div className="flex-shrink-0">
            {logoError ? (
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-blue-800 bg-clip-text text-transparent">
                Odop
              </span>
            ) : (
              <img 
                src="/icons/logo.png" 
                alt="Odop" 
                className="h-10"
                onError={() => setLogoError(true)}
              />
            )}
          </div>

          {/* ハンバーガーメニューボタン */}
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            aria-label="メニューを開く"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* ドロップダウンメニュー */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleMenuItemClick(item.page as 'home' | 'goals' | 'mypage')}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* オーバーレイ */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
}
