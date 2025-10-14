// OpenAI APIを使用した目標設定チャット機能
import OpenAI from 'openai';

// 環境変数からAPIキーを取得
const getOpenAIKey = () => {
  // 環境変数から取得
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey && envKey !== 'your_openai_api_key_here') {
    return envKey;
  }
  
  // ローカルストレージから取得
  const storedKey = localStorage.getItem('openai_api_key');
  if (storedKey) {
    return storedKey;
  }
  
  return null;
};

// OpenAI クライアントを初期化
const initializeOpenAI = () => {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません');
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // ブラウザでの使用を許可（開発用）
  });
};

export interface GoalChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GoalChatResponse {
  content: string;
  shouldCreateGoal?: boolean;
  goalData?: {
    title: string;
    duration: string;
    reasoning: string;
    todos?: string[];
  };
  needsDurationClarification?: boolean;
  needsTodoList?: boolean;
}

// 目標設定用のシステムプロンプト
const GOAL_SETTING_SYSTEM_PROMPT = `あなたは目標設定の専門家です。ユーザーと対話して、具体的で達成可能な目標を一緒に考えてください。

役割：
- ユーザーの話を聞いて、目標を明確にする
- 具体的で測定可能な目標を提案する
- 期間を正しく認識する（ユーザーの入力に期間が含まれている場合はそれを使用）
- 目標達成のための具体的なTODOリストを生成する

目標設定のフレームワーク：
1. 目標の明確化（何を達成したいか）
2. 期間の設定（ユーザーの入力から期間を抽出、不明な場合のみ聞き返す）
3. 具体的な行動計画（どうやって達成するか）
4. TODOリストの生成（具体的で実行可能なタスク）

重要なポイント：
- ユーザーの入力に期間が含まれている場合は、それを正しく認識してください
- 期間の認識例：「1か月で5キロ痩せる」→ 期間：1ヶ月
- 期間が含まれている場合は、期間の確認をスキップして直接TODOリスト生成に進んでください
- 期間が不明確な場合のみ「いつまでに達成したいですか？」と聞き返してください
- 期間が明確になったら、直近1週間の具体的なTODOリストを生成してください
- 各TODOは具体的な行動レベル（食べ物、運動、行動）を含めてください
- 初心者でも迷わず実行できる具体的な内容にしてください

期間認識のパターン：
- 「1か月で」「1ヶ月で」「1month」→ 1month
- 「3か月で」「3ヶ月で」「3months」→ 3months
- 「6か月で」「6ヶ月で」「6months」→ 6months
- 「1年で」「1year」「12ヶ月で」→ 1year

応答パターン：

1. 期間が不明な場合：
{
  "content": "素晴らしい目標ですね！その目標を達成するために、いつまでに完了したいですか？（例：1ヶ月、3ヶ月、6ヶ月、1年など）",
  "needsDurationClarification": true
}

2. 目標と期間が明確で、TODOリストが必要な場合（期間が含まれている場合）：
{
  "content": "目標と期間が明確になりました！直近1週間の具体的なTODOリストを生成しましょう。",
  "needsTodoList": true
}

3. 目標、期間、TODOリストが全て揃った場合：
{
  "shouldCreateGoal": true,
  "goalData": {
    "title": "具体的な目標タイトル",
    "duration": "1month" | "3months" | "6months" | "1year",
    "reasoning": "なぜこの期間が適切かの理由",
    "todos": ["TODO1", "TODO2", "TODO3", "TODO4", "TODO5"]
  }
}

重要：ユーザーの入力に期間が含まれている場合（例：「1か月で5キロ痩せる」）、必ずパターン2（needsTodoList: true）を返してください。

常に日本語で応答してください。`;

export const sendGoalChatMessage = async (
  messages: GoalChatMessage[]
): Promise<GoalChatResponse> => {
  try {
    const openai = initializeOpenAI();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: GOAL_SETTING_SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '申し訳ありません、応答を生成できませんでした。';
    
    // JSON形式の応答をチェック
    try {
      const parsedResponse = JSON.parse(content);
      
      // 期間の明確化が必要な場合
      if (parsedResponse.needsDurationClarification) {
        return {
          content: parsedResponse.content,
          needsDurationClarification: true
        };
      }
      
      // TODOリストが必要な場合
      if (parsedResponse.needsTodoList) {
        return {
          content: parsedResponse.content,
          needsTodoList: true
        };
      }
      
      // 目標作成の準備ができた場合
      if (parsedResponse.shouldCreateGoal && parsedResponse.goalData) {
        const todos = parsedResponse.goalData.todos || [];
        const todoListText = todos.length > 0 ? `\n\n**TODOリスト**:\n${todos.map((todo, index) => `${index + 1}. ${todo}`).join('\n')}` : '';
        
        return {
          content: `素晴らしい目標ですね！\n\n**目標**: ${parsedResponse.goalData.title}\n**期間**: ${getDurationLabel(parsedResponse.goalData.duration)}\n**理由**: ${parsedResponse.goalData.reasoning}${todoListText}\n\nこの目標を設定しますか？`,
          shouldCreateGoal: true,
          goalData: parsedResponse.goalData
        };
      }
    } catch (e) {
      // JSONでない場合は通常のテキスト応答として処理
    }
    
    return {
      content,
      shouldCreateGoal: false
    };
    
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    if (error.message?.includes('APIキー')) {
      throw new Error('OpenAI APIキーが設定されていません。マイページから設定してください。');
    } else if (error.message?.includes('quota')) {
      throw new Error('APIの使用制限に達しています。しばらくしてから再試行してください。');
    } else if (error.message?.includes('network')) {
      throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
    } else {
      throw new Error(`AIとの通信でエラーが発生しました: ${error.message}`);
    }
  }
};

// TODOリスト生成用の関数
export const generateTodoList = async (
  goalTitle: string,
  duration: string,
  messages: GoalChatMessage[]
): Promise<string[]> => {
  try {
    const openai = initializeOpenAI();
    
    const todoPrompt = `目標「${goalTitle}」を達成するための直近1週間の具体的なTODOリストを生成してください。

【重要な指示】
- 必ず5個の具体的なTODOを生成してください（1個だけでは不十分です）
- 直近1週間で実行できる具体的な行動
- 毎日または数日に分けて実行できるタスク
- 具体的な食べ物、運動、行動を含める
- 初心者でも迷わず実行できるレベル

【適切な例】
✅ 良い例：
- 「30分ウォーキング」
- 「野菜のスープを食べる」
- 「夕食はそばを食べる」
- 「階段を3階分上る」
- 「白米を半分に減らす」
- 「間食をナッツ10粒に変更」

❌ 悪い例：
- 「運動する」
- 「健康的な食事を心がける」
- 「カロリーを減らす」

【条件】
- 必ず5個の具体的なタスクを生成（1個や2個では不十分）
- 1週間で実行可能な内容
- 具体的な食べ物・運動・行動を含める
- シンプルで明確な表現
- 各タスクは異なる分野から選択（運動、食事、学習、家事、趣味など）

【出力形式】
JSON形式で以下のように返してください：
{
  "todos": ["具体的なTODO1", "具体的なTODO2", "具体的なTODO3", "具体的なTODO4", "具体的なTODO5"]
}

日本語で返してください。`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // より詳細な分析が可能なモデルに変更
      messages: [
        { role: 'system', content: todoPrompt },
        ...messages
      ],
      max_tokens: 1200, // より具体的な内容のためトークン数を増加
      temperature: 0.3, // より一貫性のある具体的な出力のため温度を下げる
    });

    const content = response.choices[0]?.message?.content || '';
    console.log('OpenAI応答内容:', content);
    
    try {
      // JSON部分を抽出（```json と ``` の間の部分）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[1].trim();
        console.log('抽出されたJSON:', jsonContent);
        const parsedResponse = JSON.parse(jsonContent);
        console.log('パースされたJSON:', parsedResponse);
        return parsedResponse.todos || [];
      } else {
        // 直接JSON解析を試行
        const parsedResponse = JSON.parse(content);
        console.log('パースされたJSON:', parsedResponse);
        return parsedResponse.todos || [];
      }
    } catch (e) {
      console.log('JSON解析エラー:', e);
      console.log('テキスト解析にフォールバック');
      // JSON解析に失敗した場合、テキストからTODOを抽出
      const lines = content.split('\n').filter(line => {
        const trimmedLine = line.trim();
        return trimmedLine && (
          // 数字付きリスト（1. 2. など）
          /^\d+\./.test(trimmedLine) ||
          // ハイフン付きリスト
          trimmedLine.startsWith('-') ||
          // その他の記号
          trimmedLine.includes('•') ||
          trimmedLine.includes('・') ||
          // 日本語のTODOリスト（「」で囲まれたもの）
          trimmedLine.includes('"') ||
          // その他のTODOらしき行
          (trimmedLine.length > 5 && !trimmedLine.includes('目標') && !trimmedLine.includes('TODO'))
        );
      });
      
      console.log('抽出された行:', lines);
      
      const todos = lines.slice(0, 8).map(line => {
        let todo = line.trim();
        // 数字付きリストの番号を削除
        todo = todo.replace(/^\d+\.\s*/, '');
        // ハイフンや記号を削除
        todo = todo.replace(/^[-•・]\s*/, '');
        // 引用符を削除
        todo = todo.replace(/^["']|["']$/g, '');
        // 余分な空白を削除
        return todo.trim();
      }).filter(todo => todo.length > 0);
      
      console.log('最終的なTODOリスト:', todos);
      return todos;
    }
    
  } catch (error: any) {
    console.error('TODOリスト生成エラー:', error);
    return [];
  }
};

// 期間ラベルの取得
const getDurationLabel = (duration: string): string => {
  const labels: { [key: string]: string } = {
    '1month': '1ヶ月',
    '3months': '3ヶ月',
    '6months': '6ヶ月',
    '1year': '1年'
  };
  return labels[duration] || duration;
};

// APIキーの設定状況をチェック
export const checkOpenAISetup = (): { configured: boolean; message: string } => {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    return {
      configured: false,
      message: 'OpenAI APIキーが設定されていません。マイページから設定してください。'
    };
  }
  
  return {
    configured: true,
    message: 'OpenAI APIが利用可能です。'
  };
};
