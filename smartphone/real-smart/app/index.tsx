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
  Modal,
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
  
  // 時給編集の状態
  const [isEditingWage, setIsEditingWage] = useState(false);
  const [tempHourlyWage, setTempHourlyWage] = useState(hourlyWage);
  
  // ポップアップの状態
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  
  // カレンダーの状態
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    fetchUsageData();
    checkScreenTimeAuthorization();
  }, []);

  useEffect(() => {
    // ScreenTimeが認証済みの場合は自動でデータを取得
    if (isScreenTimeAuthorized) {
      fetchScreenTimeData();
    } else {
      // 認証されていない場合は自動で認証を要求
      requestScreenTimeAuthorization();
    }
  }, [isScreenTimeAuthorized]);
  
  useEffect(() => {
    prepareCalendarData();
  }, [usageData]);

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

  // グラフ用のデータを準備（アプリ別積み上げ）
  function getChartData() {
    const weeklyData = prepareWeeklyData();
    
    // データの最大値を動的に計算
    const maxHours = Math.max(...weeklyData.map(item => item.hours), 1);
    const dynamicMax = Math.ceil(maxHours * 1.2);
    
    // アプリ別の色定義
    const appColors = [
      '#5AC8FA', // YouTube
      '#FF3B30', // YouTube Music
      '#34C759', // LINE
      '#007AFF', // Canva
      '#FF9500', // Safari
      '#AF52DE', // Messages
      '#FF2D92', // Instagram
      '#5856D6', // Twitter
    ];
    
    return weeklyData.map((item, index) => {
      // 各日のアプリ使用時間をシミュレート（実際のデータがない場合）
      const apps = [
        { name: 'YouTube', hours: item.hours * 0.5, color: appColors[0] },
        { name: 'LINE', hours: item.hours * 0.3, color: appColors[2] },
        { name: 'Safari', hours: item.hours * 0.2, color: appColors[4] },
      ];
      
      return {
        x: index,
        totalHours: item.hours,
        apps: apps,
        maxValue: dynamicMax,
      };
    });
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

  // 日付をタップしたときの処理
  function handleDayTap(dayData) {
    setSelectedDayData(dayData);
    setIsPopupVisible(true);
  }
  
  // ポップアップを閉じる処理
  function closePopup() {
    setIsPopupVisible(false);
    setSelectedDayData(null);
  }
  
  // カレンダーのデータを準備
  function prepareCalendarData() {
    const data = {};
    usageData.forEach(item => {
      data[item.date] = item.hours;
    });
    setCalendarData(data);
  }
  
  // カレンダーの日付を生成
  function generateCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }
  
  // 日付をフォーマット
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // 時給編集の処理
  function handleWageEdit() {
    setIsEditingWage(true);
    setTempHourlyWage(hourlyWage);
  }

  function handleWageSave() {
    setHourlyWage(tempHourlyWage);
    setIsEditingWage(false);
  }

  function handleWageCancel() {
    setTempHourlyWage(hourlyWage);
    setIsEditingWage(false);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ホームタブ */}
        {activeTab === 'home' && (
          <View style={styles.homeContainer}>
            {/* iOS標準スクリーンタイムヘッダー */}
            <View style={styles.screenTimeHeader}>
              <Text style={styles.deviceTitle}>本日のスマホ使用時間</Text>
              <Text style={styles.averageTime}>
                {(() => {
                  // ScreenTimeデータがある場合はそれを使用、なければ手動入力データを使用
                  if (screenTimeData) {
                    return minutesToHoursMinutes(screenTimeData.totalScreenTime);
                  } else {
                    const today = new Date().toISOString().split('T')[0];
                    const todayData = usageData.find((item) => item.date === today);
                    if (todayData) {
                      const hours = Math.floor(todayData.hours);
                      const minutes = Math.round((todayData.hours - hours) * 60);
                      return `${hours}時間${minutes}分`;
                    } else {
                      return '0時間0分';
                    }
                  }
                })()}
              </Text>
            </View>

            {/* ScreenTimeデータ表示 */}
            <View style={styles.screenTimeData}>
              {screenTimeData ? (
                <View style={styles.appUsageList}>
                  <Text style={styles.appUsageTitle}>アプリ別使用時間</Text>
                  {screenTimeData.appUsage.slice(0, 5).map((app, index) => (
                    <View key={app.bundleId} style={styles.appUsageItem}>
                      <Text style={styles.appName}>{app.appName}</Text>
                      <Text style={styles.appUsageTime}>{minutesToHoursMinutes(app.usageTime)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noScreenTimeData}>
                  <Text style={styles.noScreenTimeText}>
                    ScreenTimeデータが利用できません
                  </Text>
                  <Text style={styles.noScreenTimeSubText}>
                    手動で使用時間を入力してください
                  </Text>
                </View>
              )}
            </View>

            {/* iOS標準スクリーンタイムグラフ */}
            <View style={styles.weeklyChart}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>1週間の使用時間</Text>
              </View>
              
              {usageData.length === 0 ? (
                <View style={styles.emptyChart}>
                  <Text style={styles.emptyChartText}>まだデータがありません</Text>
                </View>
              ) : (
                <View style={styles.chartContainer}>
                  <View style={styles.chartArea}>
                    {/* Y軸ラベル（左側） */}
                    <View style={styles.yAxisLabels}>
                      {(() => {
                        const chartData = getChartData();
                        const maxValue = chartData[0]?.maxValue || 8;
                        return [maxValue, 0].map(i => (
                          <Text key={`y-label-${i}`} style={styles.yAxisLabel}>
                            {i.toFixed(0)}時間
                          </Text>
                        ));
                      })()}
                    </View>
                    
                    {/* グリッド線 */}
                    <View style={styles.gridLines}>
                      {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <View key={`grid-y-${i}`} style={[styles.gridLine, { top: i * 32 }]} />
                      ))}
                    </View>
                    
                    {/* 平均線 */}
                    <View style={styles.averageLine}>
                      <View style={styles.averageLineDot} />
                      <Text style={styles.averageLineLabel}>平均</Text>
                    </View>
                    
                    {/* データバー（積み上げ式） */}
                    <View style={styles.dataBars}>
                      {getChartData().map((dayData, index) => {
                        const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];
                        const totalHeight = (dayData.totalHours / dayData.maxValue) * 160;
                        
                        return (
                          <TouchableOpacity 
                            key={`bar-${index}`} 
                            style={styles.barContainer}
                            onPress={() => handleDayTap(dayData)}
                          >
                            <View style={styles.stackedBar}>
                              {dayData.apps.map((app, appIndex) => {
                                const appHeight = (app.hours / dayData.maxValue) * 160;
                                return (
                                  <View
                                    key={`${index}-${appIndex}`}
                                    style={[
                                      styles.appSegment,
                                      {
                                        height: Math.max(appHeight, 1),
                                        backgroundColor: app.color,
                                      }
                                    ]}
                                  />
                                );
                              })}
                            </View>
                            <Text style={styles.dayLabel}>{dayLabels[index]}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}
              
              {/* アプリ別使用時間の凡例 */}
              {usageData.length > 0 && (
                <View style={styles.appLegend}>
                  <Text style={styles.legendTitle}>アプリ別使用時間</Text>
                  {(() => {
                    const chartData = getChartData();
                    const totalHours = chartData.reduce((sum, day) => sum + day.totalHours, 0);
                    const appTotals = {};
                    
                    chartData.forEach(day => {
                      day.apps.forEach(app => {
                        if (!appTotals[app.name]) {
                          appTotals[app.name] = { hours: 0, color: app.color };
                        }
                        appTotals[app.name].hours += app.hours;
                      });
                    });
                    
                    return Object.entries(appTotals)
                      .sort(([,a], [,b]) => b.hours - a.hours)
                      .map(([appName, data]) => (
                        <View key={appName} style={styles.legendItem}>
                          <View style={[styles.legendColor, { backgroundColor: data.color }]} />
                          <Text style={styles.legendAppName}>{appName}</Text>
                          <Text style={styles.legendHours}>
                            {Math.round(data.hours * 10) / 10}時間
                          </Text>
                        </View>
                      ));
                  })()}
                </View>
              )}
            </View>
          </View>
        )}

        {/* 過去タブ */}
        {activeTab === 'history' && (
          <View style={styles.historyPage}>
            <View style={styles.monthlyStatsSection}>
              <View style={styles.statsHeader}>
                <Text style={styles.cardTitle}>過去1か月の統計</Text>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={handleWageEdit}
                >
                  <Text style={styles.editButtonText}>編集</Text>
                </TouchableOpacity>
              </View>
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
                    
                    {isEditingWage && (
                      <View style={styles.wageEditSection}>
                        <Text style={styles.wageEditLabel}>時給設定</Text>
                        <View style={styles.wageEditRow}>
                          <TextInput
                            style={styles.wageEditInput}
                            value={tempHourlyWage.toString()}
                            onChangeText={(text) => setTempHourlyWage(parseInt(text) || 0)}
                            keyboardType="numeric"
                            placeholder="時給を入力"
                          />
                          <Text style={styles.wageEditUnit}>円/時間</Text>
                        </View>
                        <View style={styles.wageEditButtons}>
                          <TouchableOpacity 
                            style={styles.wageEditButton}
                            onPress={handleWageSave}
                          >
                            <Text style={styles.wageEditButtonText}>保存</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.wageEditButton, styles.wageEditButtonCancel]}
                            onPress={handleWageCancel}
                          >
                            <Text style={[styles.wageEditButtonText, styles.wageEditButtonTextCancel]}>キャンセル</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </>
                );
              })()}
            </View>

            {/* カレンダーセクション */}
            <View style={styles.calendarSection}>
              <Text style={styles.cardTitle}>使用時間カレンダー</Text>
              <View style={styles.calendarContainer}>
                {/* カレンダーヘッダー */}
                <View style={styles.calendarHeader}>
                  <TouchableOpacity 
                    onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    style={styles.calendarNavButton}
                  >
                    <Text style={styles.calendarNavText}>‹</Text>
                  </TouchableOpacity>
                  <Text style={styles.calendarTitle}>
                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                    style={styles.calendarNavButton}
                  >
                    <Text style={styles.calendarNavText}>›</Text>
                  </TouchableOpacity>
                </View>
                
                {/* 曜日ヘッダー */}
                <View style={styles.weekdayHeader}>
                  {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                    <Text key={day} style={styles.weekdayText}>{day}</Text>
                  ))}
                </View>
                
                {/* カレンダーグリッド */}
                <View style={styles.calendarGrid}>
                  {generateCalendarDays(selectedDate.getFullYear(), selectedDate.getMonth()).map((day, index) => {
                    const dateStr = formatDate(day);
                    const hours = calendarData[dateStr] || 0;
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                    const isToday = formatDate(day) === formatDate(new Date());
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.calendarDay,
                          !isCurrentMonth && styles.calendarDayOtherMonth,
                          isToday && styles.calendarDayToday
                        ]}
                        onPress={() => {
                          if (hours > 0) {
                            setSelectedDayData({
                              totalHours: hours,
                              apps: [
                                { name: 'YouTube', hours: hours * 0.5, color: '#5AC8FA' },
                                { name: 'LINE', hours: hours * 0.3, color: '#34C759' },
                                { name: 'Safari', hours: hours * 0.2, color: '#FF9500' },
                              ]
                            });
                            setIsPopupVisible(true);
                          }
                        }}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          !isCurrentMonth && styles.calendarDayTextOtherMonth,
                          isToday && styles.calendarDayTextToday
                        ]}>
                          {day.getDate()}
                        </Text>
                        {hours > 0 && (
                          <Text style={[
                            styles.calendarUsageText,
                            { color: hours > 4 ? '#FF3B30' : hours > 2 ? '#FF9500' : '#34C759' }
                          ]}>
                            {hours.toFixed(1)}h
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
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

    {/* 日付詳細ポップアップ */}
    <Modal
      visible={isPopupVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closePopup}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>使用時間詳細</Text>
            <TouchableOpacity onPress={closePopup} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          {selectedDayData && (
            <View style={styles.modalBody}>
              <View style={styles.totalUsageSection}>
                <Text style={styles.totalUsageLabel}>合計使用時間</Text>
                <Text style={styles.totalUsageValue}>
                  {selectedDayData.totalHours.toFixed(1)}時間
                </Text>
              </View>
              
              <View style={styles.appUsageSection}>
                <Text style={styles.appUsageTitle}>アプリ別使用時間</Text>
                {selectedDayData.apps.map((app, index) => (
                  <View key={index} style={styles.appUsageItem}>
                    <View style={[styles.appColorIndicator, { backgroundColor: app.color }]} />
                    <Text style={styles.appName}>{app.name}</Text>
                    <Text style={styles.appHours}>{app.hours.toFixed(1)}時間</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
    </>
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
  chartSection: {
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
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
  homeContainer: {
    marginHorizontal: 16,
    marginTop: 60,
    marginBottom: 16,
    padding: 20,
  },
  screenTimeHeader: {
    marginBottom: 24,
  },
  deviceTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  averageLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  averageTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  authSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  screenTimeData: {
    marginBottom: 24,
  },
  todayUsage: {
    marginBottom: 16,
  },
  todayLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  todayTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  pickupInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickupText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  notificationText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  appUsageList: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  appUsageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  weeklyChart: {
    marginBottom: 24,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  emptyChartText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  chartArea: {
    height: 200,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
    width: '100%',
  },
  averageLine: {
    position: 'absolute',
    top: 80,
    left: 60,
    right: 0,
    height: 1,
    backgroundColor: '#34C759',
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageLineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  averageLineLabel: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
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
    height: 160,
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'left',
  },
  graphArea: {
    position: 'absolute',
    left: 35,
    top: 0,
    width: 260,
    height: 160,
  },
  gridLines: {
    position: 'absolute',
    left: 60,
    right: 0,
    top: 0,
    bottom: 40,
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
    left: 60,
    right: 0,
    top: 0,
    bottom: 40,
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
  stackedBar: {
    width: 24,
    marginBottom: 8,
    alignItems: 'center',
  },
  appSegment: {
    width: 24,
    minHeight: 1,
  },
  barValue: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  appLegend: {
    marginTop: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendAppName: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  legendHours: {
    fontSize: 14,
    color: '#8E8E93',
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
  monthlyStatsSection: {
    marginTop: 60,
    marginBottom: 16,
    padding: 20,
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
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  wageEditSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  wageEditLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  wageEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wageEditInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  wageEditUnit: {
    fontSize: 14,
    color: '#666',
  },
  wageEditButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  wageEditButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  wageEditButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  wageEditButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  wageEditButtonTextCancel: {
    color: '#666',
  },
  detailedHistorySection: {
    padding: 20,
  },
  // マイページのスタイル
  profilePage: {
    padding: 16,
    paddingTop: 80,
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
  // ポップアップのスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
  },
  modalBody: {
    gap: 20,
  },
  totalUsageSection: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  totalUsageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalUsageValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  appUsageSection: {
    gap: 12,
  },
  appUsageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  appUsageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  appColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  appName: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  appHours: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  // カレンダーのスタイル
  calendarSection: {
    marginTop: 60,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarContainer: {
    marginTop: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarNavText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  calendarDayOtherMonth: {
    backgroundColor: '#f8f8f8',
  },
  calendarDayToday: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  calendarDayText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  calendarDayTextOtherMonth: {
    color: '#ccc',
  },
  calendarDayTextToday: {
    color: '#007AFF',
    fontWeight: '600',
  },
  calendarUsageText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 11,
  },
  // ScreenTimeデータがない場合のスタイル
  noScreenTimeData: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  noScreenTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noScreenTimeSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
