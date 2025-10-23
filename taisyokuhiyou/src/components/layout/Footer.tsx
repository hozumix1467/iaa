import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <HelpCircle className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">退去費用相談</span>
            </div>
            <p className="text-gray-300 text-sm">
              退去費用の適正さを判断するための相談プラットフォーム。みんなの知恵で不当な請求から身を守りましょう。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">リンク</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors duration-200">ホーム</Link>
              </li>
              <li>
                <Link to="/consultation/new" className="hover:text-blue-400 transition-colors duration-200">相談する</Link>
              </li>
              <li>
                <Link to="/consultation/browse" className="hover:text-blue-400 transition-colors duration-200">相談一覧</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors duration-200">サービスについて</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">役立つ情報</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">退去費用の基礎知識</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">国土交通省ガイドライン</a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors duration-200">消費者センター相談窓口</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ルームクリア相談室. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;