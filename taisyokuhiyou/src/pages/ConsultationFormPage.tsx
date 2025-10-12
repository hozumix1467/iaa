import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, AlertCircle, Info } from 'lucide-react';
import { useConsultation } from '../contexts/ConsultationContext';

type FormData = {
  propertyType: string;
  stayDuration: number;
  totalCost: number;
  cleaningCost: number;
  repairCost: number;
  otherCosts: number;
  details: string;
  images: File[];
};

const ConsultationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { addConsultation } = useConsultation();
  
  const [formData, setFormData] = useState<FormData>({
    propertyType: '',
    stayDuration: 0,
    totalCost: 0,
    cleaningCost: 0,
    repairCost: 0,
    otherCosts: 0,
    details: '',
    images: [],
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'details' ? value : 
              ['stayDuration', 'totalCost', 'cleaningCost', 'repairCost', 'otherCosts'].includes(name) ? 
              Number(value) || 0 : value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files || [])
      }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.propertyType) {
      newErrors.propertyType = '物件タイプを選択してください';
    }
    
    if (formData.stayDuration <= 0) {
      newErrors.stayDuration = '入居期間を入力してください';
    }
    
    if (formData.totalCost <= 0) {
      newErrors.totalCost = '合計金額を入力してください';
    }
    
    if (!formData.details || formData.details.length < 10) {
      newErrors.details = '詳細情報を10文字以上入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newConsultation = {
        id: Date.now().toString(),
        ...formData,
        imageUrls: [], // In a real app, we'd upload the images and store their URLs
        createdAt: new Date().toISOString(),
        status: 'open',
        responses: []
      };
      
      addConsultation(newConsultation);
      setIsSubmitting(false);
      navigate(`/consultation/${newConsultation.id}`);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-white text-xl font-bold">退去費用の相談フォーム</h1>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  できるだけ詳しい情報を入力すると、より適切なアドバイスを受けられます。個人を特定できる情報は入力しないでください。
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">
                  物件タイプ <span className="text-red-500">*</span>
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.propertyType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">選択してください</option>
                  <option value="アパート">アパート</option>
                  <option value="マンション">マンション</option>
                  <option value="一戸建て">一戸建て</option>
                  <option value="その他">その他</option>
                </select>
                {errors.propertyType && (
                  <p className="mt-1 text-sm text-red-600">{errors.propertyType}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="stayDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  入居期間（月） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="stayDuration"
                  name="stayDuration"
                  value={formData.stayDuration || ''}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.stayDuration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.stayDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.stayDuration}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 mb-1">
                請求された合計金額（円） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="totalCost"
                name="totalCost"
                value={formData.totalCost || ''}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.totalCost ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.totalCost && (
                <p className="mt-1 text-sm text-red-600">{errors.totalCost}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="cleaningCost" className="block text-sm font-medium text-gray-700 mb-1">
                  清掃費（円）
                </label>
                <input
                  type="number"
                  id="cleaningCost"
                  name="cleaningCost"
                  value={formData.cleaningCost || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="repairCost" className="block text-sm font-medium text-gray-700 mb-1">
                  修繕費（円）
                </label>
                <input
                  type="number"
                  id="repairCost"
                  name="repairCost"
                  value={formData.repairCost || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="otherCosts" className="block text-sm font-medium text-gray-700 mb-1">
                  その他費用（円）
                </label>
                <input
                  type="number"
                  id="otherCosts"
                  name="otherCosts"
                  value={formData.otherCosts || ''}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                詳細情報 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="details"
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={5}
                placeholder="退去時の状況、請求内容、気になる点などを詳しく記入してください。"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.details ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.details && (
                <p className="mt-1 text-sm text-red-600">{errors.details}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                画像を添付（請求書、部屋の写真など）
              </label>
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                ※個人情報が写っている場合は、必ず加工してからアップロードしてください。
              </p>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    投稿された内容は他のユーザーに公開されます。個人情報（氏名、住所、電話番号など）は記載しないでください。
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-blue-600 text-white rounded-md font-medium transition-all ${
                  isSubmitting 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:bg-blue-700 hover:shadow-md'
                }`}
              >
                {isSubmitting ? '送信中...' : '相談を投稿する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsultationFormPage;