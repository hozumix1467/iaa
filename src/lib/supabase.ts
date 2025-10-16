// SupabaseはFirebaseに移行したため、このファイルは非推奨
// Firebase版の機能を使用してください

// 環境変数が設定されていない場合のエラーを防ぐため、ダミーのクライアントを返す
export const supabase = {
  auth: {
    signOut: () => Promise.resolve(),
    getSession: () => Promise.resolve({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve({ data: [], error: null })
      }),
      single: () => Promise.resolve({ data: null, error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
    upsert: () => Promise.resolve({ data: null, error: null })
  })
};

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  duration: '1month' | '3months' | '6months' | '1year';
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DailyTodo {
  id: string;
  goal_id: string;
  todo_date: string;
  content: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
