import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Target, Calendar, MessageSquare, BarChart3, Star, Users, Zap } from 'lucide-react';
import LPHeader from './LPHeader';

interface LandingPageProps {
  onPageChange?: (page: 'home' | 'goals' | 'mypage' | 'lp') => void;
}

export default function LandingPage({ onPageChange }: LandingPageProps) {
  const [email, setEmail] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0); // アニメーション用の数値
  const [isGraphVisible, setIsGraphVisible] = useState(false); // グラフの表示状態

  // アニメーション用のuseEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsGraphVisible(true);
    }, 500);

    const animationTimer = setTimeout(() => {
      let currentValue = 0;
      const targetValue = 37;
      const increment = targetValue / 100;
      const animationInterval = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(animationInterval);
        }
        setAnimatedValue(Math.round(currentValue));
      }, 30);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, []);

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AIジャーナリング",
      description: "毎日の振り返りをAIがサポート。深い自己分析と気づきを提供します。"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "目標管理",
      description: "1日1％の改善を積み重ねて、確実に目標達成へと導きます。"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "習慣化支援",
      description: "継続的な成長をサポートする習慣トラッキング機能。"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "進捗可視化",
      description: "成長の軌跡をグラフで確認し、モチベーションを維持。"
    }
  ];

  const benefits = [
    "思考の整理と自己理解の深化",
    "AIによる個別化されたフィードバック",
    "シンプルで使いやすいインターフェース",
    "継続しやすい習慣化システム",
    "内省を通じた真の成長の実現"
  ];

  const testimonials = [
    {
      name: "田中さん",
      role: "フリーランスデザイナー",
      content: "毎日の振り返りが習慣になり、3ヶ月で仕事の効率が格段に向上しました。",
      rating: 5
    },
    {
      name: "佐藤さん",
      role: "会社員",
      content: "AIの提案が的確で、自分では気づかない改善点を発見できています。",
      rating: 5
    },
    {
      name: "山田さん",
      role: "学生",
      content: "目標設定から達成まで、一貫したサポートで確実に成長を実感。",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* LP専用ヘッダー */}
      <LPHeader onPageChange={onPageChange} />
      
              {/* ヒーローセクション */}
              <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 py-20 pt-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              1日1％の改善で<br />
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                全てが変わる
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              AIジャーナリングで、<br />
              <span className="font-semibold text-white">自分を超えた自分</span>になろう
            </p>
                    <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center">
                      <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 flex items-center gap-1 sm:gap-2 shadow-lg">
                        無料で始める
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        className="border-2 border-white/30 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-lg hover:border-white/50 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                      >
                        デモを見る
                      </button>
                    </div>
          </div>
        </div>
      </section>

              {/* Odop is... セクション */}
              <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                      Odop is...
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
                      あなたの成長を加速させるAIジャーナリングプラットフォーム
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <img 
                        src="/icons/image.png" 
                        alt="Odop AIジャーナリングサービス" 
                        className="rounded-xl shadow-lg w-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        AIがあなたの思考を整理し、目標達成をサポート
                      </h3>
                      <ul className="space-y-4 text-lg text-gray-700">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <span>
                            <strong className="text-gray-900">スマートなジャーナリング:</strong> 
                            AIがあなたの日記を分析し、成長のヒントを提供します。
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <span>
                            <strong className="text-gray-900">目標設定支援:</strong> 
                            SMARTな目標設定から進捗管理まで、一貫したサポートを提供します。
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <span>
                            <strong className="text-gray-900">習慣化の仕組み:</strong> 
                            小さな改善を積み重ねることで、自然と習慣化できる環境を構築します。
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <span>
                            <strong className="text-gray-900">継続的な成長:</strong> 
                            1日1%の改善を365日続けることで、驚くべき変化を実現します。
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* 改善効果グラフセクション */}
              <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      1日1%の改善の力
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                      小さな改善を積み重ねることで、1年後に驚くべき差が生まれます
                    </p>
                  </div>
          
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  1年後の成長比較
                </h3>
                
                {/* 折れ線グラフ */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <span>成長率</span>
                      <span>倍</span>
                    </div>
                    
                    {/* Y軸ラベル */}
                    <div className="relative h-48">
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                        <span>40</span>
                        <span>30</span>
                        <span>20</span>
                        <span>10</span>
                        <span>0</span>
                      </div>
                      
                      {/* グリッド線 */}
                      <div className="absolute left-8 right-0 h-full">
                        <div className="h-full flex flex-col justify-between">
                          <div className="border-t border-gray-200"></div>
                          <div className="border-t border-gray-200"></div>
                          <div className="border-t border-gray-200"></div>
                          <div className="border-t border-gray-200"></div>
                          <div className="border-t border-gray-300"></div>
                        </div>
                      </div>
                      
                              {/* 折れ線グラフ */}
                              <div className="absolute left-8 right-0 h-full">
                                <svg className="w-full h-full" viewBox="0 0 200 192">
                                  {/* 改善なしの線（水平線） */}
                                  <line 
                                    x1="0" y1="190" x2="200" y2="190" 
                                    stroke="#9CA3AF" 
                                    strokeWidth="3" 
                                    strokeDasharray="5,5"
                                    opacity={isGraphVisible ? 1 : 0}
                                    style={{
                                      transition: 'opacity 1s ease-in-out'
                                    }}
                                  />
                                  
                                  {/* 1日1%改善の線（指数曲線） */}
                                  <path 
                                    d="M 0 190 Q 50 160 100 130 Q 150 90 200 30" 
                                    stroke="#475569" 
                                    strokeWidth="3" 
                                    fill="none"
                                    strokeDasharray="300"
                                    strokeDashoffset={isGraphVisible ? 0 : 300}
                                    style={{
                                      transition: 'stroke-dashoffset 2s ease-in-out'
                                    }}
                                  />
                                  
                                  {/* データポイント */}
                                  <circle 
                                    cx="200" 
                                    cy="30" 
                                    r="4" 
                                    fill="#475569" 
                                    opacity={isGraphVisible ? 1 : 0}
                                    style={{
                                      transition: 'opacity 1s ease-in-out 2s'
                                    }}
                                  />
                                  <circle 
                                    cx="0" 
                                    cy="190" 
                                    r="4" 
                                    fill="#9CA3AF" 
                                    opacity={isGraphVisible ? 1 : 0}
                                    style={{
                                      transition: 'opacity 1s ease-in-out'
                                    }}
                                  />
                                </svg>
                              </div>
                      
                      {/* X軸ラベル */}
                      <div className="absolute -bottom-6 left-8 right-0 flex justify-between text-xs text-gray-500">
                        <span>0日</span>
                        <span>365日</span>
                      </div>
                    </div>
                    
                    {/* 凡例 */}
                    <div className="flex flex-row justify-center space-x-6 mt-24">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t-2 border-gray-400"></div>
                        <span className="text-sm text-gray-600">改善なし</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-0.5 bg-slate-600"></div>
                        <span className="text-sm text-slate-700 font-semibold">1日1%改善</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
              
                      <div className="text-center">
                        <div className="text-6xl font-bold text-slate-700 mb-2">
                          <span className="inline-block transition-all duration-500 ease-out transform scale-110">
                            {animatedValue}
                          </span>
                          <span className="text-2xl text-gray-600 ml-2">倍の成長</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          1日1%の改善を<br />365日続けた場合
                        </div>
                      </div>
            </div>
          </div>
        </div>
      </section>


      {/* なぜジャーナリングをするべきなのかセクション */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                なぜジャーナリングをするべきなのか？
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                思考を整理し、自己理解を深めることで、真の成長を実現します。
                ジャーナリングは、あなたの内面と向き合い、より良い自分になるための最強のツールです。
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img 
                src="/icons/image.png" 
                alt="ジャーナリングの効果" 
                className="rounded-xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Odopの主な特徴セクション */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Odopの主な特徴
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              あなたの目標達成を強力にサポートする4つの機能
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="text-slate-700 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 bg-gradient-to-r from-slate-700 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            今すぐ始めて、人生を変えよう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            無料で始められる、AIジャーナリングサービス
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="メールアドレスを入力"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <button className="bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
              無料で始める
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-blue-100 text-sm mt-4">
            今すぐ登録して、1日1％の改善を始めましょう
          </p>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                {logoError ? (
                  <span className="text-2xl font-bold text-white">Odop</span>
                ) : (
                  <img 
                    src="/icons/logo.png" 
                    alt="Odop" 
                    className="h-8 filter brightness-0 invert"
                    onError={() => setLogoError(true)}
                  />
                )}
              </div>
              <p className="text-gray-400">
                AIジャーナリングサービスで、継続的な成長を実現
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AIジャーナリング</li>
                <li>目標管理</li>
                <li>習慣化支援</li>
                <li>進捗可視化</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li>ヘルプセンター</li>
                <li>お問い合わせ</li>
                <li>よくある質問</li>
                <li>利用ガイド</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">会社情報</h4>
              <ul className="space-y-2 text-gray-400">
                <li>プライバシーポリシー</li>
                <li>利用規約</li>
                <li>特定商取引法</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Odop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
