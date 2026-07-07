import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import Svg, { Path, Circle, G, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { FontFamily } from '@/constants/fontsfamily';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { assessmentsApi, AssessmentHistoryEntry } from '@/services/api';

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getDayLabel(dateStr: string): string {
  try {
    return DAY_LABELS[new Date(dateStr).getDay()];
  } catch {
    return '';
  }
}

function getDayNumber(dateStr: string): number {
  try {
    return new Date(dateStr).getDate();
  } catch {
    return 0;
  }
}

/** Map risk_status → gauge angle (kiri = buruk, kanan = baik) */
function gaugeAngleFromStatus(status: string): number {
  switch (status) {
    case 'Rendah': return 40;      // jarum kanan → sehat (Baik)
    case 'Rentan': return -10;     // jarum tengah → waspada (Normal)
    case 'Adiksi Tinggi': return -55; // jarum kiri → buruk (Buruk)
    default: return 0;
  }
}

/** Map risk_status → label singkat untuk UI */
function statusLabel(status: string): string {
  switch (status) {
    case 'Rendah': return 'Baik';
    case 'Rentan': return 'Normal';
    case 'Adiksi Tinggi': return 'Buruk';
    default: return '-';
  }
}

/** Map total_score (0-14) → Y posisi di chart (makin tinggi score = makin rendah di chart) */
function scoreToChartY(score: number, chartH: number): number {
  const maxScore = 14;
  const pct = Math.min(score / maxScore, 1);
  return chartH * 0.15 + pct * chartH * 0.7;
}

export default function ProgressScreen() {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const { tradingPlan } = useAssessmentStore();

  const [history, setHistory] = useState<AssessmentHistoryEntry[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await assessmentsApi.getHistory(7);
        if (!mounted) return;
        setHistory(res.history);
        setCurrentStreak(res.current_streak);
        setLongestStreak(res.longest_streak);
        // Default pilih entry terbaru
        setSelectedIndex(res.history.length > 0 ? res.history.length - 1 : 0);
      } catch (err) {
        console.error('[Progress] fetch error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const currentData = history[selectedIndex] ?? null;

  // ---------- Chart drawing ----------
  const { strokePath, fillPath, points, xLabels } = useMemo(() => {
    if (history.length === 0) {
      return { strokePath: '', fillPath: '', points: [], xLabels: [] };
    }
    const W = screenWidth - 32;
    const H = 100;
    const dx = W / Math.max(history.length - 1, 1);

    const pts = history.map((entry, i) => ({
      x: i * dx,
      y: scoreToChartY(entry.total_score, H),
    }));

    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + dx / 2;
      const cpY1 = p0.y;
      const cpX2 = p1.x - dx / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
    }

    const last = pts[pts.length - 1];
    const fillD = `${d} L ${last.x},110 L 0,110 Z`;

    const labels = history.map((e) => getDayNumber(e.date).toString());

    return { strokePath: d, fillPath: fillD, points: pts, xLabels: labels };
  }, [history, screenWidth]);

  const gaugeAngle = currentData ? gaugeAngleFromStatus(currentData.risk_status) : 0;
  const statusText = currentData ? statusLabel(currentData.risk_status) : '-';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('@/assets/images/logo-shield.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
            <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Progress</Text>
          </View>
          <Pressable style={styles.bellButton}>
            <Bell size={22} color={theme.mintDark} />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3BCFA6" />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.cardSubtitle }]}>
              Belum ada data assessment.{"\n"}Selesaikan Daily Question untuk memulai!
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* STREAK PILLS */}
            <View style={styles.streakRow}>
              <View style={styles.streakPill}>
                <Text style={styles.streakValue}>{currentStreak}</Text>
                <Text style={styles.streakLabel}>STREAK SEKARANG</Text>
              </View>
              <View style={styles.streakPill}>
                <Text style={styles.streakValue}>{longestStreak}</Text>
                <Text style={styles.streakLabel}>STREAK TERPANJANG</Text>
              </View>
            </View>

            {/* EMOTIONAL GAUGE METER */}
            <Text style={styles.gaugeTitle}>Tingkat Emosional Saat Ini</Text>
            
            <View style={styles.gaugeContainer}>
              <Svg width={200} height={110} viewBox="0 0 200 110">
                <Defs>
                  <LinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#FF7B6E" />
                    <Stop offset="50%" stopColor="#F5B041" />
                    <Stop offset="100%" stopColor="#0FB184" />
                  </LinearGradient>
                </Defs>
                
                {/* Gauge arc track */}
                <Path
                  d="M 20,100 A 80,80 0 0,1 180,100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth={16}
                  strokeLinecap="round"
                />

                {/* Needle center anchor */}
                <Circle cx={100} cy={100} r={10} fill="#1E2A22" />
                <Circle cx={100} cy={100} r={5} fill="#7C8C85" />
                
                {/* Gauge needle indicator */}
                <G transform={`rotate(${gaugeAngle}, 100, 100)`}>
                  <Line
                    x1={100}
                    y1={100}
                    x2={100}
                    y2={35}
                    stroke="#1E2A22"
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              
              <Text style={[styles.gaugeStatusText, { color: theme.mintDark }]}>
                {statusText}
              </Text>
            </View>

            {/* DAILY EMOTION GRAPH */}
            {history.length > 1 && (
              <>
                <Text style={styles.sectionTitle}>Perkembangan Emosi Harian</Text>

                <View style={styles.graphCard}>
                  <Svg width={screenWidth - 32} height={110}>
                    <Defs>
                      <LinearGradient id="graphGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#056B4E" stopOpacity={0.18} />
                        <Stop offset="100%" stopColor="#056B4E" stopOpacity={0.0} />
                      </LinearGradient>
                    </Defs>
                    
                    {/* Fill area */}
                    <Path d={fillPath} fill="url(#graphGrad)" />
                    
                    {/* Wave stroke */}
                    <Path d={strokePath} fill="none" stroke="#056B4E" strokeWidth={3} />

                    {/* Highlight dot at selected index */}
                    {points[selectedIndex] && (
                      <Circle
                        cx={points[selectedIndex].x}
                        cy={points[selectedIndex].y}
                        r={5}
                        fill="#2BD5A2"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    )}
                  </Svg>

                  {/* X-Axis Labels */}
                  <View style={styles.xAxisRow}>
                    {xLabels.map((day, idx) => (
                      <Text key={idx} style={styles.xAxisLabel}>
                        {day}
                      </Text>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* RIWAYAT PROGRESS SECTION */}
            <Text style={[styles.sectionTitleHeader, { color: theme.mintDark }]}>Riwayat Progress</Text>

            {/* HORIZONTAL DATE PILLS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.datesRow}
            >
              {history.map((entry, idx) => {
                const isSelected = selectedIndex === idx;
                const dayNum = getDayNumber(entry.date);
                const dayLbl = getDayLabel(entry.date);
                return (
                  <Pressable
                    key={entry.date}
                    onPress={() => setSelectedIndex(idx)}
                    style={[
                      styles.datePill,
                      isSelected
                        ? { backgroundColor: theme.mintDark, borderColor: theme.mintDark }
                        : { backgroundColor: '#FFFFFF', borderColor: '#ECEFEF' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateNumber,
                        { color: isSelected ? '#FFFFFF' : '#1E2A22' }
                      ]}
                    >
                      {dayNum}
                    </Text>
                    <Text
                      style={[
                        styles.dateLabelText,
                        { color: isSelected ? '#A9EAD7' : '#7C8C85' }
                      ]}
                    >
                      {dayLbl}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* DYNAMIC PROGRESS DETAILS CARDS */}
            {currentData && (
              <>
                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Status Emosi</Text>
                  <Text style={[styles.detailValue, { color: theme.mintDark }]}>
                    {statusText}
                  </Text>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailLabel}>Rekomendasi</Text>
                  <Text style={[styles.detailValue, { color: theme.mintDark, fontSize: 15 }]}>
                    {currentData.recommendation}
                  </Text>
                </View>

                {/* HASIL SELF JOURNAL CARDS */}
                {currentData.journal_text ? (
                  <>
                    <Text style={[styles.sectionTitleHeader, { color: theme.mintDark, marginTop: Spacing.two }]}>
                      Hasil Self Journal
                    </Text>
                    <View style={styles.journalCard}>
                      <Text style={styles.journalText}>&quot;{currentData.journal_text}&quot;</Text>
                    </View>
                  </>
                ) : null}
              </>
            )}

            {/* DYNAMIC TRADING PLAN CARD FROM STORE */}
            {tradingPlan && (
              <>
                <Text style={[styles.sectionTitleHeader, { color: theme.mintDark, marginTop: Spacing.two }]}>
                  Hasil Trading Plan
                </Text>
                <View style={[styles.journalCard, { borderColor: '#3BCFA6' }]}>
                  <View style={styles.tradingPlanRow}>
                    <Text style={styles.tradingPlanLabel}>Entry: </Text>
                    <Text style={styles.tradingPlanVal}>{tradingPlan.entry}</Text>
                  </View>
                  <View style={styles.tradingPlanRow}>
                    <Text style={styles.tradingPlanLabel}>Harga: </Text>
                    <Text style={styles.tradingPlanVal}>{tradingPlan.price}</Text>
                  </View>
                  <View style={styles.tradingPlanRow}>
                    <Text style={styles.tradingPlanLabel}>TP & SL: </Text>
                    <Text style={styles.tradingPlanVal}>{tradingPlan.tpSl}</Text>
                  </View>
                  <View style={styles.tradingPlanRow}>
                    <Text style={styles.tradingPlanLabel}>Alasan: </Text>
                    <Text style={styles.tradingPlanVal}>{tradingPlan.reason}</Text>
                  </View>
                </View>
              </>
            )}

          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: FontFamily.manropeMedium,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FontFamily.manropeBold,
    marginLeft: Spacing.two,
  },
  bellButton: {
    padding: Spacing.one,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 180, // Perbesar dari 110 agar bisa scroll lebih jauh ke bawah tanpa tertutup navigation bar
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
    gap: 10,
  },
  streakPill: {
    flex: 1,
    backgroundColor: '#FAFDFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 17,
    elevation: 3,
  },
  streakValue: {
    fontSize: 24,
    fontFamily: FontFamily.manropeExtraBold,
    color: '#1A886A',
  },
  streakLabel: {
    fontSize: 9,
    fontFamily: FontFamily.manropeBold,
    color: '#7C8C85',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  gaugeTitle: {
    fontSize: 12,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#7C8C85',
    textAlign: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  gaugeStatusText: {
    fontSize: 28,
    fontFamily: FontFamily.manropeExtraBold,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FontFamily.manropeBold,
    color: '#7C8C85',
    textAlign: 'center',
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  graphCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    marginBottom: Spacing.five,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 5,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#B0C2B8',
    width: 20,
    textAlign: 'center',
  },
  sectionTitleHeader: {
    fontSize: 16,
    fontFamily: FontFamily.manropeBold,
    marginBottom: Spacing.three,
  },
  datesRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.four,
  },
  datePill: {
    width: 48,
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 17,
    elevation: 3,
  },
  dateNumber: {
    fontSize: 14,
    fontFamily: FontFamily.manropeExtraBold,
  },
  dateLabelText: {
    fontSize: 10,
    fontFamily: FontFamily.manropeSemiBold,
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#7C8C85',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: FontFamily.manropeBold,
  },
  journalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3BCFA6',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  journalText: {
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: FontFamily.manropeMedium,
    color: '#1A2520',
    lineHeight: 22,
  },
  tradingPlanRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tradingPlanLabel: {
    width: 75,
    fontSize: 14,
    fontFamily: FontFamily.manropeBold,
    color: '#1A886A',
  },
  tradingPlanVal: {
    flex: 1,
    fontSize: 14,
    fontFamily: FontFamily.manropeMedium,
    color: '#1A2520',
  },
});
