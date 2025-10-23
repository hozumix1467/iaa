import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, HelpCircle, AlertTriangle, BookOpen } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">退去費用相談サービスについて</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">サービスの目的</h2>
          <p className="text-gray-700 mb-4">
            「退去費用相談」は、賃貸物件を退去する際に請求される費用が適正かどうかを判断するための相談プラットフォームです。
            不動産会社や大家からの請求に疑問を感じた方が相談し、経験者や知識のある方々からアドバイスを受けられる場を提供しています。
          </p>
          <p className="text-gray-700 mb-4">
            退去費用のトラブルは珍しくありません。「経年劣化なのに修繕費を請求された」「高額な原状回復費用を請求された」など、
            多くの方が疑問や不安を抱えています。このサービスは、そんな不安を解消し、適切な判断をサポートします。
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">国土交通省のガイドライン</h2>
          <p className="text-gray-700 mb-4">
            退去時の原状回復費用については、国土交通省が「原状回復をめぐるトラブルとガイドライン」を公表しています。
            このガイドラインでは、「通常の使用による損耗等」と「故意・過失による損傷」を区別し、前者は貸主負担、
            後者は借主負担とすることが適正であるとしています。
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
              ガイドラインの基本的な考え方
            </h3>
            <ul className="list-disc ml-5 space-y-1 text-gray-700">
              <li>通常の使用による壁紙の色あせや家具の設置による跡は、「経年劣化」として貸主負担</li>
              <li>タバコのヤニや落書きなど、通常の使用を超える損傷は借主負担</li>
              <li>設備機器の故障が経年劣化によるものなら貸主負担、使用方法の誤りによるものなら借主負担</li>
              <li>経過年数を考慮した負担割合の計算方法も示されている</li>
            </ul>
          </div>
          
          <p className="text-gray-700">
            ガイドラインの詳細は
            <a 
              href="https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_tk3_000020.html" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              国土交通省のウェブサイト
            </a>
            で確認できます。
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">知っておくべき基本知識</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                経年劣化と故意・過失の区別
              </h3>
              <p className="text-gray-700">
                退去費用の大きな判断ポイントは「経年劣化」と「故意・過失による損傷」の区別です。
                通常の生活で起こる壁紙の色あせやフローリングの擦れなどは経年劣化として貸主負担となるべきものです。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                クリーニング費用
              </h3>
              <p className="text-gray-700">
                退去時の通常の清掃費用は、多くの場合敷金から差し引かれます。ただし、特別なクリーニングが必要な
                状況（ペットを飼っていた、タバコのヤニがひどいなど）でない限り、高額な請求は疑問を持つべきでしょう。
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
                敷金返還
              </h3>
              <p className="text-gray-700">
                敷金は原則として返還されるべきものです。借主に負担義務のある原状回復費用や未払い家賃などがある場合に、
                それらを差し引いた金額が返還されます。全額返還されない場合は、その理由と内訳を確認する権利があります。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">相談のポイント</h2>
          <p className="text-gray-700 mb-4">
            退去費用について相談する際は、以下の情報を詳しく共有すると、より適切なアドバイスを受けられます：
          </p>
          
          <ul className="list-disc ml-5 space-y-2 text-gray-700 mb-4">
            <li>物件タイプと入居期間</li>
            <li>請求された費用の総額と内訳</li>
            <li>気になる請求項目の詳細</li>
            <li>契約書に記載されていた原状回復に関する条件</li>
            <li>退去時の立会いの有無と指摘された箇所</li>
            <li>敷金の有無と金額</li>
          </ul>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  本サービスでの相談内容や回答はあくまで参考情報です。重要な判断や法的手続きを行う場合は、
                  専門家（弁護士や消費生活センターなど）への相談をお勧めします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">あなたの経験が誰かの役に立ちます</h2>
        <p className="text-lg text-gray-700 mb-6">
          退去費用のトラブルを経験した方も、これから退去を控えている方も、
          みんなで情報を共有して適正な退去費用の判断をサポートしましょう。
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/consultation/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-transform hover:scale-105 shadow-md"
          >
            相談する
          </Link>
          <Link
            to="/consultation/browse"
            className="bg-white text-blue-700 px-6 py-3 rounded-md font-medium transition-transform hover:scale-105 shadow-md"
          >
            相談一覧を見る <ArrowRight className="inline h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;