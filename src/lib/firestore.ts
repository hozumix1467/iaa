// Firestore データベース操作
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase';

// 型定義
export interface Goal {
  id?: string;
  title: string;
  duration: '1month' | '3months' | '6months' | '1year';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export interface DailyTodo {
  id?: string;
  goalId: string;
  date: string;
  todos: string[];
  completed: boolean[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export interface Reflection {
  id?: string;
  date: string;
  memo: string;
  todos?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

// 現在のユーザーIDを取得
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('ユーザーがログインしていません');
  }
  return user.uid;
};

// Goals コレクション操作
export const goalsCollection = 'goals';

// 目標を作成
export const createGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
  try {
    const userId = getCurrentUserId();
    const now = Timestamp.now();
    
    const docRef = await addDoc(collection(db, goalsCollection), {
      ...goalData,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// 目標を更新
export const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
  try {
    const goalRef = doc(db, goalsCollection, goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 目標を削除
export const deleteGoal = async (goalId: string) => {
  try {
    const goalRef = doc(db, goalsCollection, goalId);
    await deleteDoc(goalRef);
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// ユーザーの目標一覧を取得
export const getUserGoals = async (): Promise<{ goals: Goal[], error: string | null }> => {
  try {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, goalsCollection),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const goals: Goal[] = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({
        id: doc.id,
        ...doc.data(),
      } as Goal);
    });
    
    return { goals, error: null };
  } catch (error: any) {
    return { goals: [], error: error.message };
  }
};

// 目標をリアルタイムで監視
export const subscribeToUserGoals = (callback: (goals: Goal[]) => void): Unsubscribe => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    callback([]);
    return () => {};
  }
  
  // 一時的にインデックスが必要なクエリを無効化
  // インデックス作成後に以下のコメントアウトを解除してください
  /*
  const q = query(
    collection(db, goalsCollection),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const goals: Goal[] = [];
    querySnapshot.forEach((doc) => {
      goals.push({
        id: doc.id,
        ...doc.data(),
      } as Goal);
    });
    callback(goals);
  });
  */
  
  // 一時的な回避策：インデックス不要なクエリを使用
  const q = query(
    collection(db, goalsCollection),
    where('userId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const goals: Goal[] = [];
    querySnapshot.forEach((doc) => {
      goals.push({
        id: doc.id,
        ...doc.data(),
      } as Goal);
    });
    // クライアント側で並び替え
    goals.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime; // 降順
    });
    callback(goals);
  });
};

// DailyTodos コレクション操作
export const dailyTodosCollection = 'dailyTodos';

// 日次TODOを作成
export const createDailyTodo = async (todoData: Omit<DailyTodo, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
  try {
    const userId = getCurrentUserId();
    const now = Timestamp.now();
    
    const docRef = await addDoc(collection(db, dailyTodosCollection), {
      ...todoData,
      userId,
      createdAt: now,
      updatedAt: now,
    });
    
    return { id: docRef.id, error: null };
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// 日次TODOを更新
export const updateDailyTodo = async (todoId: string, updates: Partial<DailyTodo>) => {
  try {
    const todoRef = doc(db, dailyTodosCollection, todoId);
    await updateDoc(todoRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// 特定の日付のTODOを取得
export const getDailyTodosByDate = async (date: string): Promise<{ todos: DailyTodo[], error: string | null }> => {
  try {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, dailyTodosCollection),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    const todos: DailyTodo[] = [];
    
    querySnapshot.forEach((doc) => {
      todos.push({
        id: doc.id,
        ...doc.data(),
      } as DailyTodo);
    });
    
    return { todos, error: null };
  } catch (error: any) {
    return { todos: [], error: error.message };
  }
};

// Reflections コレクション操作
export const reflectionsCollection = 'reflections';

// 振り返りを作成・更新
export const saveReflection = async (reflectionData: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
  try {
    const userId = getCurrentUserId();
    const now = Timestamp.now();
    
    // 既存の振り返りをチェック
    const q = query(
      collection(db, reflectionsCollection),
      where('userId', '==', userId),
      where('date', '==', reflectionData.date)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // 新規作成
      const docRef = await addDoc(collection(db, reflectionsCollection), {
        ...reflectionData,
        userId,
        createdAt: now,
        updatedAt: now,
      });
      return { id: docRef.id, error: null };
    } else {
      // 更新
      const docRef = querySnapshot.docs[0];
      await updateDoc(docRef.ref, {
        ...reflectionData,
        updatedAt: now,
      });
      return { id: docRef.id, error: null };
    }
  } catch (error: any) {
    return { id: null, error: error.message };
  }
};

// 特定の日付の振り返りを取得
export const getReflectionByDate = async (date: string): Promise<{ reflection: Reflection | null, error: string | null }> => {
  try {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, reflectionsCollection),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { reflection: null, error: null };
    }
    
    const doc = querySnapshot.docs[0];
    const reflection: Reflection = {
      id: doc.id,
      ...doc.data(),
    } as Reflection;
    
    return { reflection, error: null };
  } catch (error: any) {
    return { reflection: null, error: error.message };
  }
};
