// OpenAI API接続テスト用のユーティリティ関数

export interface APITestResult {
  success: boolean;
  message: string;
  response?: any;
  error?: string;
}

export const testOpenAIConnection = async (apiKey: string): Promise<APITestResult> => {
  try {
    // APIキーの形式チェック
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return {
        success: false,
        message: 'APIキーの形式が正しくありません。sk-で始まるキーを入力してください。',
        error: 'Invalid API key format'
      };
    }

    // OpenAI APIとの接続テスト
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `API接続に失敗しました (${response.status}): ${errorData.error?.message || response.statusText}`,
        error: `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'API接続が成功しました！',
      response: {
        modelsCount: data.data?.length || 0,
        hasGPT4: data.data?.some((model: any) => model.id.includes('gpt-4')) || false,
        hasGPT35: data.data?.some((model: any) => model.id.includes('gpt-3.5')) || false
      }
    };

  } catch (error) {
    console.error('API接続テストエラー:', error);
    
    let errorMessage = 'API接続中にエラーが発生しました。';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    } else if (error instanceof Error) {
      errorMessage = `エラー: ${error.message}`;
    }

    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testOpenAICompletion = async (apiKey: string, testMessage: string = 'こんにちは'): Promise<APITestResult> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: testMessage
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: `チャット完了APIのテストに失敗しました (${response.status}): ${errorData.error?.message || response.statusText}`,
        error: `HTTP ${response.status}`
      };
    }

    const data = await response.json();
    const completion = data.choices?.[0]?.message?.content || '';

    return {
      success: true,
      message: 'チャット完了APIのテストが成功しました！',
      response: {
        completion,
        usage: data.usage
      }
    };

  } catch (error) {
    console.error('チャット完了APIテストエラー:', error);
    
    return {
      success: false,
      message: `チャット完了APIのテスト中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// 環境変数からAPIキーを取得する関数
export const getAPIKeyFromEnv = (): string | null => {
  // Viteでは環境変数はVITE_プレフィックスが必要
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  return apiKey && apiKey !== 'your_openai_api_key_here' ? apiKey : null;
};

// 環境変数の設定状況をチェックする関数
export const checkEnvConfig = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    openai: {
      configured: !!(apiKey && apiKey !== 'your_openai_api_key_here'),
      placeholder: apiKey === 'your_openai_api_key_here'
    },
    supabase: {
      configured: !!(supabaseUrl && supabaseKey),
      url: supabaseUrl,
      hasKey: !!supabaseKey
    }
  };
};
