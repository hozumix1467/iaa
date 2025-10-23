import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageSquare, Search, Filter } from 'lucide-react';
import { useConsultation } from '../contexts/ConsultationContext';
import { formatDate } from '../utils/formatters';

const CaseBrowserPage: React.FC = () => {
  const { consultations } = useConsultation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredConsultations, setFilteredConsultations] = useState(consultations);
  
  useEffect(() => {
    let filtered = consultations;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(consultation => 
        consultation.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.propertyType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(consultation => consultation.status === selectedFilter);
    }
    
    // Sort by created date (newest first)
    filtered = [...filtered].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setFilteredConsultations(filtered);
  }, [consultations, searchTerm, selectedFilter]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">相談一覧</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="キーワードで検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Filter className="text-gray-500 h-5 w-5" />
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedFilter('open')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'open' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                未解決
              </button>
              <button
                onClick={() => setSelectedFilter('closed')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedFilter === 'closed' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                解決済み
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {filteredConsultations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-lg text-gray-600">該当する相談が見つかりませんでした。</p>
          <p className="mt-2 text-gray-500">検索条件を変更するか、新しい相談を投稿してみましょう。</p>
          <Link 
            to="/consultation/new" 
            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            相談を投稿する
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConsultations.map(consultation => (
            <Link 
              key={consultation.id} 
              to={`/consultation/${consultation.id}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    consultation.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {consultation.status === 'open' ? '未解決' : '解決済み'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {consultation.propertyType}・{consultation.stayDuration}ヶ月入居
                  </span>
                </div>
                
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                  {consultation.totalCost.toLocaleString()}円の退去費用について
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {consultation.details}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(consultation.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>{consultation.responses.length}件の回答</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CaseBrowserPage;