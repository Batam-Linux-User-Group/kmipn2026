import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { assessmentsApi, AssessmentHistoryEntry } from '@/services/api';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

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
    case 'Rendah': return 40;      // jarum kanan → sehat
    case 'Rentan': return -10;     // jarum tengah → waspada
    case 'Adiksi Tinggi': return -55; // jarum kiri → buruk
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

/** Map total_score (0-12+) → Y posisi di chart (makin tinggi score = makin rendah di chart) */
function scoreToChartY(score: number, chartH: number): number {
  const maxScore = 14;
  const pct = Math.min(score / maxScore, 1);
  // score tinggi = buruk = turun di chart
  return chartH * 0.15 + pct * chartH * 0.7;
}

// --------------------------------------------------------------------------
// Fallback data saat API belum siap / tidak ada data
// --------------------------------------------------------------------------

const FALLBACK: AssessmentHistoryEntry[] = [];

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------

export default function ProgressScreen() {
  const theme = useTheme();
  const screenWidth = Dimensions.get('window').width;

  const [history, setHistory] = useState<AssessmentHistoryEntry[]>(FALLBACK);
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
      const cpX2 = p1.x - dx / 2;
      d += ` C ${cpX1},${p0.y} ${cpX2},${p1.y} ${p1.x},${p1.y}`;
    }

    const last = pts[pts.length - 1];
    const fillD = `${d} L ${last.x},110 L 0,110 Z`;

    const labels = history.map((e) => getDayNumber(e.date).toString());

    return { strokePath: d, fillPath: fillD, points: pts, xLabels: labels };
  }, [history, screenWidth]);

  const gaugeAngle = currentData
    ? gaugeAngleFromStatus(currentData.risk_status)
    : 0;

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
                <Path
                  d="M 20,100 A 80,80 0 0,1 180,100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth={16}
                  strokeLinecap="round"
                />
                <Circle cx={100} cy={100} r={10} fill="#1E2A22" />
                <Circle cx={100} cy={100} r={5} fill="#7C8C85" />
                <G transform={`rotate(${gaugeAngle}, 100, 100)`}>
                  <Line
                    x1={100} y1={100} x2={100} y2={35}
                    stroke="#1E2A22" strokeWidth={4} strokeLinecap="round"
                  />
                </G>
              </Svg>
              <Text style={[styles.gaugeStatusText, { color: theme.mintDark }]}>
                {statusText}
              </Text>
            </View>

            {/* CHART — hanya tampil jika ada data */}
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
                    <Path d={fillPath} fill="url(#graphGrad)" />
                    <Path d={strokePath} fill="none" stroke="#056B4E" strokeWidth={3} />
                    {/* Dot untuk entry yang dipilih */}
                    {points[selectedIndex] && (
                      <Circle
                        cx={points[selectedIndex].x}
                        cy={points[selectedIndex].y}
                        r={5}
                        fill="#3BCFA6"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    )}
                  </Svg>
                  <View style={styles.xAxisRow}>
                    {xLabels.map((label, idx) => (
                      <Text key={idx} style={styles.xAxisLabel}>{label}</Text>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* RIWAYAT PILLS */}
            {history.length > 0 && (
              <>
                <Text style={[styles.sectionTitleHeader, { color: theme.mintDark }]}>
                  Riwayat Progress
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.datesRow}
                >
                  {history.map((entry, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <Pressable
                        key={entry.date}
                        onPress={() => setSelectedIndex(idx)}
                        style={[
                          styles.datePill,
                          isSelected
                            ? { backgroundColor: theme.mintDark, borderColor: theme.mintDark }
                            : { backgroundColor: '#FFFFFF', borderColor: '#ECEFEF' },
                        ]}
                      >
                        <Text style={[styles.dateNumber, { color: isSelected ? '#FFFFFF' : '#1E2A22' }]}>
                          {getDayNumber(entry.date)}
                        </Text>
                        <Text style={[styles.dateLabelText, { color: isSelected ? '#A9EAD7' : '#7C8C85' }]}>
                          {getDayLabel(entry.date)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* DETAIL CARDS */}
                {currentData && (
                  <>
                    <View style={styles.detailCard}>
                      <Text style={styles.detailLabel}>Status Emosi</Text>
                      <Text style={[styles.detailValue, { color: theme.mintDark }]}>
                        {statusLabel(currentData.risk_status)}
                      </Text>
                    </View>

                    <View style={styles.detailCard}>
                      <Text style={styles.detailLabel}>Rekomendasi</Text>
                      <Text style={[styles.detailValue, { color: theme.mintDark, fontSize: 15 }]}>
                        {currentData.recommendation}
                      </Text>
                    </View>

                    {currentData.journal_text ? (
                      <>
                        <Text style={[styles.sectionTitleHeader, { color: theme.mintDark, marginTop: Spacing.two }]}>
                          Hasil Self Journal
                        </Text>
                        <View style={styles.journalCard}>
                          <Text style={styles.journalText}>
                            "{currentData.journal_text}"
                          </Text>
                        </View>
                      </>
                    ) : null}
                  </>
                )}
              </>
            )}

            {/* Kosong */}
            {history.length === 0 && !isLoading && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.cardSubtitle }]}>
                  Belum ada data assessment.{'\n'}Selesaikan Daily Question untuk memulai!
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: Spacing.two },
  bellButton: { padding: Spacing.one },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 110,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    gap: 10,
  },
  streakPill: {
    flex: 1,
    backgroundColor: '#F0FDF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C5E3DE',
    padding: 14,
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A886A',
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7C8C85',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  gaugeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C8C85',
    textAlign: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.one,
  },
  gaugeStatusText: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C8C85',
    textAlign: 'center',
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  graphCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 24,
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFEF',
    marginBottom: Spacing.five,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#B0C2B8',
    width: 20,
    textAlign: 'center',
  },
  sectionTitleHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  datesRow: { flexDirection: 'row', paddingBottom: Spacing.four },
  datePill: {
    width: 48,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  dateNumber: { fontSize: 14, fontWeight: '800' },
  dateLabelText: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  detailCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    marginBottom: 12,
  },
  detailLabel: { fontSize: 12, fontWeight: '600', color: '#7C8C85', marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '700' },
  journalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3BCFA6',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  journalText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#1A2520',
    lineHeight: 22,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
