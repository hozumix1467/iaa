// ScreenTime API のモック実装
// 実際のScreenTime API実装時は、このファイルを置き換えます

export interface ScreenTimeData {
  totalScreenTime: number; // 分単位
  appUsage: Array<{
    appName: string;
    bundleId: string;
    usageTime: number; // 分単位
  }>;
  pickups: number;
  notifications: number;
  lastUsed: Date;
}

export interface ScreenTimeAPI {
  requestAuthorization(): Promise<boolean>;
  getTodayScreenTime(): Promise<ScreenTimeData>;
  isAuthorized(): Promise<boolean>;
}

// モックデータ生成用のヘルパー関数
function generateMockAppUsage(): Array<{ appName: string; bundleId: string; usageTime: number }> {
  const apps = [
    { name: 'Safari', bundleId: 'com.apple.Safari' },
    { name: 'メッセージ', bundleId: 'com.apple.MobileSMS' },
    { name: 'YouTube', bundleId: 'com.google.ios.youtube' },
    { name: 'Twitter', bundleId: 'com.atebits.Tweetie2' },
    { name: 'Instagram', bundleId: 'com.burbn.instagram' },
    { name: 'TikTok', bundleId: 'com.zhiliaoapp.musically' },
    { name: 'LINE', bundleId: 'jp.naver.line' },
    { name: 'Discord', bundleId: 'com.hammerandchisel.discord' },
    { name: 'Spotify', bundleId: 'com.spotify.client' },
    { name: 'Netflix', bundleId: 'com.netflix.Netflix' },
  ];

  const totalTime = Math.floor(Math.random() * 480) + 120; // 2-10時間（分単位）
  const appUsage: Array<{ appName: string; bundleId: string; usageTime: number }> = [];
  
  let remainingTime = totalTime;
  const numApps = Math.floor(Math.random() * 8) + 3; // 3-10個のアプリ
  
  for (let i = 0; i < numApps && remainingTime > 0; i++) {
    const app = apps[Math.floor(Math.random() * apps.length)];
    
    // 重複を避ける
    if (appUsage.some(usage => usage.bundleId === app.bundleId)) {
      continue;
    }
    
    // 最後のアプリは残り時間をすべて使用
    const usageTime = i === numApps - 1 ? remainingTime : Math.floor(Math.random() * Math.min(remainingTime, 60)) + 5;
    
    appUsage.push({
      appName: app.name,
      bundleId: app.bundleId,
      usageTime: usageTime
    });
    
    remainingTime -= usageTime;
  }
  
  // 使用時間順にソート
  return appUsage.sort((a, b) => b.usageTime - a.usageTime);
}

// モック実装
class MockScreenTimeAPI implements ScreenTimeAPI {
  private isAuthorizedState = false;

  async requestAuthorization(): Promise<boolean> {
    // モックでは常に成功
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機でリアルな感じに
    this.isAuthorizedState = true;
    return true;
  }

  async isAuthorized(): Promise<boolean> {
    return this.isAuthorizedState;
  }

  async getTodayScreenTime(): Promise<ScreenTimeData> {
    if (!this.isAuthorizedState) {
      throw new Error('ScreenTime APIへのアクセスが許可されていません');
    }

    // モックデータの生成
    const appUsage = generateMockAppUsage();
    const totalScreenTime = appUsage.reduce((sum, app) => sum + app.usageTime, 0);
    
    // ピックアップ回数は使用時間に比例（大体1分に1回程度）
    const pickups = Math.floor(totalScreenTime * 0.8 + Math.random() * 50);
    
    // 通知数も使用時間に比例
    const notifications = Math.floor(totalScreenTime * 0.5 + Math.random() * 30);

    return {
      totalScreenTime,
      appUsage,
      pickups,
      notifications,
      lastUsed: new Date()
    };
  }
}

// シングルトンインスタンス
export const screenTimeAPI = new MockScreenTimeAPI();

// 実際のScreenTime API実装時に使用する型定義
export type RealScreenTimeAPI = ScreenTimeAPI;

// 時間を分から時間（小数点第1位）に変換するヘルパー関数
export function minutesToHours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10;
}

// 時間を分から「X時間Y分」形式に変換するヘルパー関数
export function minutesToHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}分`;
  } else if (remainingMinutes === 0) {
    return `${hours}時間`;
  } else {
    return `${hours}時間${remainingMinutes}分`;
  }
}
