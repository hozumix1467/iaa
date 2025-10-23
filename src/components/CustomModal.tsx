import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export default function CustomModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000
}: CustomModalProps) {
  
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  useEffect(() => {
    if (isOpen) {
      // モーダルが開いている間は背景のスクロールを無効にする
      document.body.style.overflow = 'hidden';
    } else {
      // モーダルが閉じられたら背景のスクロールを有効にする
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-slate-600" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      default:
        return <Info className="w-8 h-8 text-blue-600" />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-slate-900';
      case 'error':
        return 'text-red-900';
      case 'warning':
        return 'text-yellow-900';
      default:
        return 'text-blue-900';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-slate-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      default:
        return 'text-blue-700';
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-slate-700 hover:bg-slate-800 text-white';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            
            <div className="flex-1">
              {title && (
                <h3 className={`text-lg font-semibold ${getTitleColor()} mb-2`}>
                  {title}
                </h3>
              )}
              <p className={`text-sm leading-relaxed ${getMessageColor()}`}>
                {message}
              </p>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* ボタン */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${getButtonStyle()}`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

