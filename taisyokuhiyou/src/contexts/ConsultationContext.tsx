import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
type Response = {
  id: string;
  text: string;
  createdAt: string;
  userId: string;
  userName: string;
  isHelpful: boolean;
  helpfulCount: number;
};

type Consultation = {
  id: string;
  propertyType: string;
  stayDuration: number;
  totalCost: number;
  cleaningCost: number;
  repairCost: number;
  otherCosts: number;
  details: string;
  imageUrls: string[];
  createdAt: string;
  status: 'open' | 'closed';
  responses: Response[];
};

type ConsultationContextType = {
  consultations: Consultation[];
  addConsultation: (consultation: Consultation) => void;
  addResponseToConsultation: (consultationId: string, response: Response) => void;
  updateConsultationStatus: (consultationId: string, status: 'open' | 'closed') => void;
};

// Mock data
const mockConsultations: Consultation[] = [
  {
    id: '1',
    propertyType: 'アパート',
    stayDuration: 36,
    totalCost: 150000,
    cleaningCost: 55000,
    repairCost: 80000,
    otherCosts: 15000,
    details: '3年間住んでいたアパートを退去しました。壁に画鋲の穴が数カ所ありましたが、それ以外は普通に生活していただけです。クロス張替えで8万円、清掃費5.5万円など合計15万円を請求されました。経年劣化として認められないのでしょうか？',
    imageUrls: [],
    createdAt: '2025-04-01T09:00:00.000Z',
    status: 'open',
    responses: [
      {
        id: 'r1',
        text: '国土交通省のガイドラインでは、画鋲等の小さな穴は通常損耗の範囲内とされています。3年間の居住であれば、クロスの経年劣化も進んでいるはずです。清掃費も一般的な相場と比べて高いと思います。大家さんに国交省ガイドラインを示して交渉してみてはいかがでしょうか？',
        createdAt: '2025-04-01T15:30:00.000Z',
        userId: 'user1',
        userName: '不動産アドバイザー',
        isHelpful: true,
        helpfulCount: 5
      },
      {
        id: 'r2',
        text: '私も似たような経験があります。敷金から差し引かれる金額に納得がいかず、消費者センターに相談したところ、大家さんと再交渉することができました。結果的に請求額が半分近くになりました。一度消費者センターに相談されることをお勧めします。',
        createdAt: '2025-04-02T10:15:00.000Z',
        userId: 'user2',
        userName: '過去に経験あり',
        isHelpful: false,
        helpfulCount: 3
      }
    ]
  },
  {
    id: '2',
    propertyType: 'マンション',
    stayDuration: 24,
    totalCost: 220000,
    cleaningCost: 60000,
    repairCost: 120000,
    otherCosts: 40000,
    details: '2年住んだマンションを退去することになり、敷金10万円から差し引かれる形で、さらに12万円を請求されました。フローリングの傷と、キッチンの油汚れが理由だそうです。入居時の状態を写真で記録していなかったのですが、これは妥当な金額でしょうか？',
    imageUrls: [],
    createdAt: '2025-03-15T14:20:00.000Z',
    status: 'open',
    responses: []
  },
  {
    id: '3',
    propertyType: '一戸建て',
    stayDuration: 60,
    totalCost: 350000,
    cleaningCost: 100000,
    repairCost: 200000,
    otherCosts: 50000,
    details: '5年間住んだ一戸建てを退去する際、35万円もの原状回復費用を請求されました。庭の手入れや害虫駆除なども含まれているようです。契約書には「退去時には原状回復が必要」とだけ書かれていました。このような高額請求は妥当なのでしょうか？',
    imageUrls: [],
    createdAt: '2025-02-20T11:30:00.000Z',
    status: 'closed',
    responses: [
      {
        id: 'r3',
        text: '契約書の「原状回復」という記載だけでは具体的な負担範囲が不明確です。国交省ガイドラインでは、5年以上の居住であれば壁紙や床などの経年劣化部分は貸主負担が原則です。ただし、庭の手入れについては契約内容によって異なるケースもあります。請求の詳細な内訳を確認し、経年劣化部分については交渉の余地があるでしょう。',
        createdAt: '2025-02-21T09:45:00.000Z',
        userId: 'user3',
        userName: '宅建士',
        isHelpful: true,
        helpfulCount: 8
      }
    ]
  }
];

// Create Context
const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

// Provider Component
export const ConsultationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [consultations, setConsultations] = useState<Consultation[]>(mockConsultations);

  const addConsultation = (consultation: Consultation) => {
    setConsultations(prev => [consultation, ...prev]);
  };

  const addResponseToConsultation = (consultationId: string, response: Response) => {
    setConsultations(prev => 
      prev.map(consultation => 
        consultation.id === consultationId 
          ? { ...consultation, responses: [...consultation.responses, response] }
          : consultation
      )
    );
  };

  const updateConsultationStatus = (consultationId: string, status: 'open' | 'closed') => {
    setConsultations(prev => 
      prev.map(consultation => 
        consultation.id === consultationId 
          ? { ...consultation, status }
          : consultation
      )
    );
  };

  return (
    <ConsultationContext.Provider 
      value={{ 
        consultations, 
        addConsultation, 
        addResponseToConsultation,
        updateConsultationStatus
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

// Custom Hook
export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};