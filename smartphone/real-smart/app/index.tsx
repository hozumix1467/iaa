import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Clock, Plus, Calendar, Smartphone, RefreshCw, TrendingUp, Home, History, User } from 'lucide-react-native';
// SVGライブラリは使用しない
import { supabase } from '@/lib/supabase';
import { PhoneUsage, PhoneUsageInsert } from '@/types/database';
import { screenTimeAPI, ScreenTimeData, minutesToHours, minutesToHoursMinutes } from '@/lib/screenTimeAPI';

export default function HomeScreen() {
  const [usageData, setUsageData] = useState<PhoneUsage[]>([]);
  const [todayHours, setTodayHours] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ScreenTime API関連の状態
  const [screenTimeData, setScreenTimeData] = useState<ScreenTimeData | null>(null);
  const [isScreenTimeAuthorized, setIsScreenTimeAuthorized] = useState(false);
  const [loadingScreenTime, setLoadingScreenTime] = useState(false);
  
  // タブ管理の状態
  const [activeTab, setActiveTab] = useState('home');
  
  // マイページの設定状態
  const [userName, setUserName] = useState('ユーザー');
  const [hourlyWage, setHourlyWage] = useState(1000); // 時給1000円
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetchUsageData();
    checkScreenTimeAuthorization();
    // ScreenTimeが認証済みの場合は自動でデータを取得
    if (isScreenTimeAuthorized) {
      fetchScreenTimeData();
    }
  }, [isScreenTimeAuthorized]);

  async function fetchUsageData() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('phone_usage')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (fetchError) throw fetchError;

      setUsageData(data || []);

      const today = new Date().toISOString().split('T')[0];
      const todayData = data?.find((item) => item.date === today);
      if (todayData) {
        setTodayHours(todayData.hours.toString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '使用データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }

  // ScreenTime API関連の関数
  async function checkScreenTimeAuthorization() {
    try {
      const isAuthorized = await screenTimeAPI.isAuthorized();
      setIsScreenTimeAuthorized(isAuthorized);
    } catch (err) {
      console.error('ScreenTime認証状態の確認に失敗:', err);
    }
  }

  async function requestScreenTimeAuthorization() {
    try {
      setLoadingScreenTime(true);
      const isAuthorized = await screenTimeAPI.requestAuthorization();
      setIsScreenTimeAuthorized(isAuthorized);
      
      if (isAuthorized) {
        await fetchScreenTimeData();
        Alert.alert('成功', 'ScreenTime APIへのアクセスが許可されました');
      } else {
        Alert.alert('エラー', 'ScreenTime APIへのアクセスが拒否されました');
      }
    } catch (err) {
      Alert.alert('エラー', 'ScreenTime APIの認証に失敗しました');
    } finally {
      setLoadingScreenTime(false);
    }
  }

  async function fetchScreenTimeData() {
    try {
      setLoadingScreenTime(true);
      const data = await screenTimeAPI.getTodayScreenTime();
      setScreenTimeData(data);
      
      // ScreenTimeデータを時間に変換して自動入力
      const hours = minutesToHours(data.totalScreenTime);
      setTodayHours(hours.toString());
    } catch (err) {
      Alert.alert('エラー', 'ScreenTimeデータの取得に失敗しました');
    } finally {
      setLoadingScreenTime(false);
    }
  }

  async function saveUsage() {
    const hours = parseFloat(todayHours);
    if (isNaN(hours) || hours < 0 || hours > 24) {
      setError('0から24の間の数値を入力してください');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const today = new Date().toISOString().split('T')[0];

      const { data: existingData } = await supabase
        .from('phone_usage')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (existingData) {
        const { error: updateError } = await supabase
          .from('phone_usage')
          .update({ hours, updated_at: new Date().toISOString() })
          .eq('date', today);

        if (updateError) throw updateError;
      } else {
        const insertData: PhoneUsageInsert = {
          date: today,
          hours,
        };

        const { error: insertError } = await supabase
          .from('phone_usage')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      await fetchUsageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }


  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // 1週間分のデータを準備する関数
  function prepareWeeklyData() {
    const today = new Date();
    const weekData = [];
    
    // 過去7日分のデータを準備
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // 該当日のデータを検索
      const dayData = usageData.find(item => item.date === dateString);
      
      weekData.push({
        date: dateString,
        hours: dayData ? dayData.hours : 0,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
      });
    }
    
    return weekData;
  }

  // グラフ用のデータを準備（SVG用）
  function getChartData() {
    const weeklyData = prepareWeeklyData();
    
    return weeklyData.map((item, index) => ({
      x: index,
      y: Math.min(item.hours, 8), // 最大8時間に制限
      label: item.label,
    }));
  }

  // 過去1か月の累計時間を計算
  function calculateMonthlyUsage() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const monthlyData = usageData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= thirtyDaysAgo && itemDate <= today;
    });
    
    const totalHours = monthlyData.reduce((sum, item) => sum + item.hours, 0);
    const totalMinutes = Math.round(totalHours * 60);
    
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalMinutes: totalMinutes,
      workingDays: monthlyData.length,
      averagePerDay: monthlyData.length > 0 ? Math.round((totalHours / monthlyData.length) * 10) / 10 : 0
    };
  }

  // 労働時間換算で給与を計算
  function calculateSalaryFromUsage(totalHours: number) {
    const workingHours = totalHours;
    const salary = Math.round(workingHours * hourlyWage);
    return {
      workingHours: Math.round(workingHours * 10) / 10,
      salary: salary,
      hourlyWage: hourlyWage
    };
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ホームタブ */}
        {activeTab === 'home' && (
          <View style={styles.appUsageCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>アプリ使用状況</Text>
          {!isScreenTimeAuthorized && (
            <TouchableOpacity
              style={styles.authButton}
              onPress={requestScreenTimeAuthorization}
              disabled={loadingScreenTime}
            >
              {loadingScreenTime ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Smartphone size={16} color="#007AFF" />
                  <Text style={styles.authButtonText}>ScreenTime連携</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {isScreenTimeAuthorized && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchScreenTimeData}
              disabled={loadingScreenTime}
            >
              {loadingScreenTime ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <RefreshCw size={16} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}
        </View>

        {isScreenTimeAuthorized && screenTimeData ? (
          <>
            <View style={styles.screenTimeInfo}>
              <Text style={styles.screenTimeText}>
                ScreenTime: {minutesToHoursMinutes(screenTimeData.totalScreenTime)}
              </Text>
              <Text style={styles.screenTimeSubText}>
                ピックアップ: {screenTimeData.pickups}回 | 通知: {screenTimeData.notifications}回
              </Text>
            </View>
            {screenTimeData.appUsage.slice(0, 5).map((app, index) => (
              <View key={app.bundleId} style={styles.appUsageItem}>
                <Text style={styles.appName}>{app.appName}</Text>
                <Text style={styles.appUsageTime}>{minutesToHoursMinutes(app.usageTime)}</Text>
              </View>
            ))}
            {screenTimeData.appUsage.length > 5 && (
              <Text style={styles.moreAppsText}>
                他 {screenTimeData.appUsage.length - 5} 個のアプリ
              </Text>
            )}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              ScreenTime連携ボタンをタップして{'\n'}アプリの使用状況を取得してください
            </Text>
          </View>
        )}

        <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <TrendingUp size={20} color="#007AFF" />
          <Text style={styles.cardTitle}>1週間の使用時間推移</Text>
        </View>
        {usageData.length === 0 ? (
          <Text style={styles.emptyText}>まだデータがありません</Text>
               ) : (
                 <View style={styles.chartContainer}>
                   <View style={styles.simpleChart}>
                     {/* Y軸ラベル */}
                     <View style={styles.yAxisLabels}>
                       {[8, 6, 4, 2, 0].map(i => (
                         <Text key={`y-label-${i}`} style={styles.yAxisLabel}>
                           {i}h
                         </Text>
                       ))}
                     </View>
                     
                     {/* グラフエリア */}
                     <View style={styles.graphArea}>
                       {/* グリッド線 */}
                       <View style={styles.gridLines}>
                         {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                           <View key={`grid-y-${i}`} style={[styles.gridLine, { top: i * 20 }]} />
                         ))}
                         {[0, 1, 2, 3, 4, 5, 6].map(i => (
                           <View key={`grid-x-${i}`} style={[styles.gridLineVertical, { left: i * 43.3 }]} />
                         ))}
                       </View>
                       
                       {/* データバー */}
                       <View style={styles.dataBars}>
                         {getChartData().map((point, index) => {
                           // 正しいY軸に基づいて高さを計算（0h=0px, 8h=160px）
                           const height = (point.y / 8) * 160;
                           const weeklyData = prepareWeeklyData();
                           const dateLabel = weeklyData[index]?.label || '';
                           return (
                             <View key={`bar-${index}`} style={styles.barContainer}>
                               <Text style={styles.dateLabel}>{dateLabel}</Text>
                               <Text style={styles.barValue}>{point.y.toFixed(1)}h</Text>
                               <View style={[styles.dataBar, { height: Math.max(height, 2) }]} />
                             </View>
                           );
                         })}
                       </View>
                     </View>
                     
                   </View>
                   <View style={styles.chartLegend}>
                     <Text style={styles.chartLegendText}>過去7日間の使用時間推移</Text>
                   </View>
                 </View>
               )}
        </View>
          </View>
        )}

        {/* 過去タブ */}
        {activeTab === 'history' && (
          <View style={styles.historyPage}>
            <View style={styles.monthlyStatsCard}>
              <Text style={styles.cardTitle}>過去1か月の統計</Text>
              {(() => {
                const monthlyStats = calculateMonthlyUsage();
                const salaryStats = calculateSalaryFromUsage(monthlyStats.totalHours);
                return (
                  <>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>累計使用時間</Text>
                      <Text style={styles.statValue}>{monthlyStats.totalHours}時間</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>1日平均</Text>
                      <Text style={styles.statValue}>{monthlyStats.averagePerDay}時間</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>労働時間換算</Text>
                      <Text style={styles.statValue}>{salaryStats.workingHours}時間</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>時給換算金額</Text>
                      <Text style={styles.statValue}>{salaryStats.salary.toLocaleString()}円</Text>
                      <Text style={styles.statSubText}>（時給{salaryStats.hourlyWage}円）</Text>
                    </View>
                  </>
                );
              })()}
            </View>

            <View style={styles.detailedHistoryCard}>
              <Text style={styles.cardTitle}>詳細履歴</Text>
              {usageData.slice(0, 30).map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyDate}>{item.date}</Text>
                  <Text style={styles.historyHours}>{item.hours}時間</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* マイページタブ */}
        {activeTab === 'profile' && (
          <View style={styles.profilePage}>
            <View style={styles.profileCard}>
              <Text style={styles.cardTitle}>ユーザー設定</Text>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>ユーザー名</Text>
                <TextInput
                  style={styles.settingInput}
                  value={userName}
                  onChangeText={setUserName}
                  placeholder="ユーザー名を入力"
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>時給設定</Text>
                <TextInput
                  style={styles.settingInput}
                  value={hourlyWage.toString()}
                  onChangeText={(text) => setHourlyWage(parseInt(text) || 0)}
                  placeholder="時給を入力"
                  keyboardType="numeric"
                />
                <Text style={styles.settingUnit}>円/時間</Text>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>通知設定</Text>
                <TouchableOpacity
                  style={[styles.toggleButton, notificationsEnabled && styles.toggleButtonActive]}
                  onPress={() => setNotificationsEnabled(!notificationsEnabled)}
                >
                  <Text style={[styles.toggleButtonText, notificationsEnabled && styles.toggleButtonTextActive]}>
                    {notificationsEnabled ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.premiumCard}>
              <Text style={styles.cardTitle}>プレミアム機能</Text>
              <Text style={styles.premiumText}>
                より詳細な分析とエクスポート機能をご利用いただけます
              </Text>
              <TouchableOpacity style={styles.premiumButton}>
                <Text style={styles.premiumButtonText}>プレミアムにアップグレード</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* フッター */}
    <View style={styles.footer}>
      <TouchableOpacity 
        style={[styles.footerTab, activeTab === 'home' && styles.activeTab]}
        onPress={() => setActiveTab('home')}
      >
        <View style={[styles.tabIconContainer, activeTab === 'home' && styles.activeTabIconContainer]}>
          <Home size={24} color={activeTab === 'home' ? '#007AFF' : '#666'} />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTabLabel]}>ホーム</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.footerTab, activeTab === 'history' && styles.activeTab]}
        onPress={() => setActiveTab('history')}
      >
        <View style={[styles.tabIconContainer, activeTab === 'history' && styles.activeTabIconContainer]}>
          <History size={24} color={activeTab === 'history' ? '#007AFF' : '#666'} />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'history' && styles.activeTabLabel]}>過去</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.footerTab, activeTab === 'profile' && styles.activeTab]}
        onPress={() => setActiveTab('profile')}
      >
        <View style={[styles.tabIconContainer, activeTab === 'profile' && styles.activeTabIconContainer]}>
          <User size={24} color={activeTab === 'profile' ? '#007AFF' : '#666'} />
        </View>
        <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>マイページ</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  todayCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  unitText: {
    fontSize: 18,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#fee',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44',
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
  },
  historyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyDate: {
    fontSize: 16,
    color: '#333',
  },
  historyHours: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  authButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
  },
  screenTimeInfo: {
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  screenTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  screenTimeSubText: {
    fontSize: 12,
    color: '#666',
  },
  appUsageCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 60,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appUsageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  appUsageTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  moreAppsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
  },
  simpleChart: {
    width: 320,
    height: 220,
    position: 'relative',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 160, // グラフエリアと同じ高さに調整
    width: 30,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  graphArea: {
    position: 'absolute',
    left: 35,
    top: 0,
    width: 260,
    height: 160, // X軸ラベルのスペースを考慮して調整
  },
  gridLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#f0f0f0',
  },
  dataBars: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 0,
    bottom: 0, // X軸ラベルが不要になったので全高を使用
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    width: 30,
    justifyContent: 'flex-end',
    height: '100%',
  },
  dataBar: {
    width: 20,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginTop: 5,
    minHeight: 2,
  },
  barValue: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '500',
  },
  xAxisLabels: {
    position: 'absolute',
    left: 10,
    bottom: 0,
    right: 10,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    width: 30,
  },
  chartLegend: {
    marginTop: 12,
    alignItems: 'center',
  },
  chartLegendText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  // フッターのスタイル
  footer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  footerTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // アクティブなタブのスタイル（必要に応じて追加）
  },
  tabIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeTabIconContainer: {
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  // 過去ページのスタイル
  historyPage: {
    padding: 16,
  },
  monthlyStatsCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#333',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  statSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detailedHistoryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // マイページのスタイル
  profilePage: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  settingUnit: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  toggleButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  premiumCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  premiumText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
