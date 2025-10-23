import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, FileText, CheckCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                退去費用、適正ですか？
              </h1>
              <p className="text-xl mb-8">
                不当な請求から身を守るため、みんなの知恵を集めて退去費用の適正さを判断しましょう。
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/consultation/new"
                  className="bg-white text-blue-700 px-6 py-3 rounded-md font-medium text-center transition-transform hover:scale-105 shadow-md"
                >
                  相談する
                </Link>
                <Link
                  to="/consultation/browse"
                  className="bg-blue-600 text-white border border-white px-6 py-3 rounded-md font-medium text-center transition-transform hover:scale-105 shadow-md"
                >
                  相談一覧を見る
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/images/25835301_m.jpg" 
                alt="アパートの鍵と契約書" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">ご利用の流れ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. 相談を投稿</h3>
              <p className="text-gray-600">
                退去費用の明細や物件情報、入居期間などの詳細を入力して相談を投稿します。
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. みんなの回答</h3>
              <p className="text-gray-600">
                不動産や法律の知識を持つユーザーや同じ経験をした方々から回答が寄せられます。
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. 判断材料に</h3>
              <p className="text-gray-600">
                寄せられた回答を参考に、あなたの退去費用が適正かどうか判断する材料にしましょう。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">サービスの特徴</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex">
              <div className="mr-4">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">みんなの知恵で身を守る</h3>
                <p className="text-gray-600">
                  不動産会社や大家さんからの不当な請求に対して、集合知で対抗できます。経験者の声や専門家のアドバイスを参考にできます。
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">匿名で相談可能</h3>
                <p className="text-gray-600">
                  個人情報を公開せずに相談できるので、安心して利用できます。具体的な物件名や会社名を出さなくても相談可能です。
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">過去事例の閲覧</h3>
                <p className="text-gray-600">
                  他の方の相談事例や解決方法を閲覧できるので、似たケースがないか探すこともできます。予防的な知識として役立ちます。
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4">
                <CheckCircle className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">退去費用の基礎知識</h3>
                <p className="text-gray-600">
                  経年劣化と故意・過失の違い、国土交通省のガイドラインなど、退去費用に関する基礎知識も提供しています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">今すぐ相談してみませんか？</h2>
          <p className="text-xl text-gray-600 mb-8">
            退去費用の請求書を受け取ったら、支払う前に一度相談してみましょう。
            みんなの経験があなたのお金を守るかもしれません。
          </p>
          <Link
            to="/consultation/new"
            className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-md font-medium text-lg transition-transform hover:scale-105 shadow-md"
          >
            相談を始める <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;