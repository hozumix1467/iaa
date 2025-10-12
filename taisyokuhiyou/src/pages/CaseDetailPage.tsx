import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, MessageSquare, ThumbsUp, Flag, 
  Send, AlertCircle, ArrowLeft, CheckCircle 
} from 'lucide-react';
import { useConsultation } from '../contexts/ConsultationContext';
import { formatDate } from '../utils/formatters';

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { consultations, addResponseToConsultation, updateConsultationStatus } = useConsultation();
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const consultation = consultations.find(c => c.id === id);
  
  if (!consultation) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">相談が見つかりませんでした</h1>
        <p className="text-gray-600 mb-8">
          お探しの相談は存在しないか、削除された可能性があります。
        </p>
        <Link 
          to="/consultation/browse" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 相談一覧に戻る
        </Link>
      </div>
    );
  }
  
  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseText.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newResponse = {
        id: Date.now().toString(),
        text: responseText,
        createdAt: new Date().toISOString(),
        userId: 'current-user', // In a real app, this would be the actual user ID
        userName: '匿名ユーザー', // In a real app, this would be the actual username or "Anonymous"
        isHelpful: false,
        helpfulCount: 0
      };
      
      addResponseToConsultation(consultation.id, newResponse);
      setResponseText('');
      setIsSubmitting(false);
    }, 1000);
  };
  
  const toggleConsultationStatus = () => {
    updateConsultationStatus(
      consultation.id, 
      consultation.status === 'open' ? 'closed' : 'open'
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link 
          to="/consultation/browse" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> 相談一覧に戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Consultation Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">退去費用の相談</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            consultation.status === 'open' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {consultation.status === 'open' ? '未解決' : '解決済み'}
          </span>
        </div>
        
        {/* Consultation Details */}
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-center mb-4 text-sm text-gray-500">
            <div className="flex items-center mr-4 mb-2">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatDate(consultation.createdAt)}</span>
            </div>
            
            <div className="mb-2">
              <span className="bg-gray-100 px-2 py-1 rounded-md">
                {consultation.propertyType}・{consultation.stayDuration}ヶ月入居
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {consultation.totalCost.toLocaleString()}円の退去費用について
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">請求内訳:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">清掃費</p>
                  <p className="font-medium">{consultation.cleaningCost.toLocaleString()}円</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">修繕費</p>
                  <p className="font-medium">{consultation.repairCost.toLocaleString()}円</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">その他費用</p>
                  <p className="font-medium">{consultation.otherCosts.toLocaleString()}円</p>
                </div>
              </div>
            </div>
            
            <div className="whitespace-pre-wrap">
              {consultation.details}
            </div>
            
            {consultation.imageUrls && consultation.imageUrls.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">添付画像:</h3>
                <div className="flex flex-wrap gap-2">
                  {consultation.imageUrls.map((url, index) => (
                    <img 
                      key={index}
                      src={url}
                      alt={`添付画像 ${index + 1}`}
                      className="h-24 w-auto rounded-md border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex space-x-4">
              <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                <Flag className="h-4 w-4 mr-1" /> 問題を報告
              </button>
            </div>
            
            {consultation.status === 'open' ? (
              <button 
                onClick={toggleConsultationStatus}
                className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200"
              >
                <CheckCircle className="mr-1 h-4 w-4" /> 解決済みにする
              </button>
            ) : (
              <button 
                onClick={toggleConsultationStatus}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                <AlertCircle className="mr-1 h-4 w-4" /> 未解決に戻す
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Responses Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          回答 ({consultation.responses.length})
        </h2>
        
        {consultation.responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">まだ回答がありません。最初の回答を投稿しましょう！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consultation.responses.map(response => (
              <div key={response.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium">{response.userName}</span>
                  <span className="text-sm text-gray-500">{formatDate(response.createdAt)}</span>
                </div>
                
                <div className="whitespace-pre-wrap mb-4">
                  {response.text}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button 
                    className={`flex items-center text-sm ${
                      response.isHelpful 
                        ? 'text-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" /> 
                    役に立った ({response.helpfulCount})
                  </button>
                  
                  <button className="text-gray-500 hover:text-gray-700 flex items-center text-sm">
                    <Flag className="h-4 w-4 mr-1" /> 報告
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Response Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-bold mb-4">回答を投稿</h2>
        
        <form onSubmit={handleSubmitResponse}>
          <div className="mb-4">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="あなたの意見や経験、アドバイスを共有しましょう..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  法的なアドバイスは参考程度にお考えください。重要な判断は専門家に相談することをお勧めします。
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !responseText.trim()}
              className={`inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium transition-all ${
                isSubmitting || !responseText.trim()
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              {isSubmitting ? (
                '送信中...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> 回答を投稿
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseDetailPage;