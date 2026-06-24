import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import Svg, { Path, Circle, G, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// Custom Jeda shield logo SVG
function ProgressLogo() {
  const theme = useTheme();
  return (
    <Svg width={32} height={32} viewBox="0 0 36 36" fill="none">
      <Path
        d="M18 3L6 8v9c0 5.5 3.5 10.7 8 13.5l4 2.5 4-2.5c4.5-2.8 8-8 8-13.5V8L18 3z"
        stroke={theme.mintDark}
        strokeWidth={2.5}
        fill={theme.mintLight}
      />
      <Path
        d="M18 23c2.5-2.5 4-5.5 4-8 0-1.5-1-2.5-2.5-2.5-1 0-1.8.8-2.5 1.5-.7-.7-1.5-1.5-2.5-1.5-1.5 0-2.5 1-2.5 2.5 0 2.5 1.5 5.5 4 8"
        stroke={theme.mintDark}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M18 14v9" stroke={theme.mintDark} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

// Data mapping for interactive progress history
interface HistoryData {
  status: 'Buruk' | 'Normal' | 'Baik';
  rekomendasi: string;
  hasilJournal: string;
  gaugeAngle: number; // needle rotation angle in degrees
}

const HISTORY_MAP: Record<number, HistoryData> = {
  10: {
    status: 'Normal',
    rekomendasi: 'HARI INI BERJALAN TENANG TANPA GEJALA CEMAS.',
    hasilJournal: 'Hari ini pasar tidak terlalu volatil, saya merasa tenang dan tidak ada dorongan untuk overtrading.',
    gaugeAngle: -15,
  },
  11: {
    status: 'Baik',
    rekomendasi: 'STRATEGI INVESTASI BERJALAN SESUAI RENCANA.',
    hasilJournal: 'Saya berhasil menahan diri dari godaan FOMO koin baru. Tetap pada rencana jangka panjang.',
    gaugeAngle: 35,
  },
  12: {
    status: 'Buruk',
    rekomendasi: 'KEMBALI BERPIKIR RASIONAL & HINDARI INSTANT GRATIFICATION.',
    hasilJournal: 'Sangat tergoda untuk balas dendam karena cutloss pagi tadi. Saya harus berhenti sejenak.',
    gaugeAngle: -55,
  },
  13: {
    status: 'Normal',
    rekomendasi: 'EMOSI CUKUP STABIL, TETAP JAGA KONSISTENSI.',
    hasilJournal: 'Memutuskan untuk tidak entry hari ini karena setup belum jelas. Keputusan yang baik.',
    gaugeAngle: -15,
  },
  14: {
    status: 'Baik',
    rekomendasi: 'LATIHAN PERNAPASAN BERHASIL MEREDAKAN EMOSI.',
    hasilJournal: 'Latihan pernapasan 2 menit sangat membantu meredakan detak jantung saya saat chart mulai merah.',
    gaugeAngle: 35,
  },
  15: {
    status: 'Buruk',
    rekomendasi: 'HOLD & DCA CRYPTO MAJOR!',
    hasilJournal: 'Kepanikan melanda saat Bitcoin turun 5%. Saya hampir menjual semuanya secara impulsif. Butuh lebih banyak JEDA.',
    gaugeAngle: -45, // pointing slightly to left for bad/unstable
  },
  16: {
    status: 'Baik',
    rekomendasi: 'TINGKATKAN SHOLAT & MEDITASI DIRI.',
    hasilJournal: 'Pikiran jernih hari ini. Melakukan analisis teknikal mendalam tanpa terburu-buru.',
    gaugeAngle: 40,
  },
};

const DATES_LIST = [
  { day: 10, label: 'Sab' },
  { day: 11, label: 'Min' },
  { day: 12, label: 'Sen' },
  { day: 13, label: 'Sel' },
  { day: 14, label: 'Rab' },
  { day: 15, label: 'Kam' },
  { day: 16, label: 'Jum' },
];

export default function ProgressScreen() {
  const theme = useTheme();
  const [selectedDay, setSelectedDay] = useState<number>(15);
  const screenWidth = Dimensions.get('window').width;

  const currentData = HISTORY_MAP[selectedDay] || HISTORY_MAP[15];

  // Helper to draw emotional wave path dynamically matching screen width
  const drawEmotionChart = () => {
    const W = screenWidth - 32; // padding horizontal
    const H = 100;
    
    // Points relative to width W:
    // 7->x0, 8->x1, 9->x2, 10->x3, 11->x4, 12->x5, 13->x6, 14->x7, 15->x8, 16->x9
    const dx = W / 9;
    
    // Y values: higher is better (near top of chart)
    const points = [
      { x: 0 * dx, y: 70 },   // 7
      { x: 1 * dx, y: 65 },   // 8
      { x: 2 * dx, y: 25 },   // 9 (peak)
      { x: 3 * dx, y: 55 },   // 10
      { x: 4 * dx, y: 75 },   // 11
      { x: 5 * dx, y: 90 },   // 12 (dip)
      { x: 6 * dx, y: 65 },   // 13
      { x: 7 * dx, y: 45 },   // 14
      { x: 8 * dx, y: 15 },   // 15 (high peak)
      { x: 9 * dx, y: 50 },   // 16
    ];

    // Build cubic bezier path string
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + dx / 2;
      const cpY1 = p0.y;
      const cpX2 = p1.x - dx / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
    }

    // Closed path for gradient fill
    const fillD = `${d} L ${points[points.length - 1].x},110 L 0,110 Z`;

    return { strokePath: d, fillPath: fillD, points };
  };

  const { strokePath, fillPath, points } = drawEmotionChart();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ProgressLogo />
            <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Progress</Text>
          </View>
          <Pressable style={styles.bellButton}>
            <Bell size={22} color={theme.mintDark} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
              <G transform={`rotate(${currentData.gaugeAngle}, 100, 100)`}>
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
              {currentData.status}
            </Text>
          </View>

          {/* DAILY EMOTION GRAPH */}
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

              {/* Highlight dots at peaks/points */}
              <Circle cx={points[2].x} cy={points[2].y} r={4} fill="#2BD5A2" stroke="#FFFFFF" strokeWidth={1} />
              <Circle cx={points[5].x} cy={points[5].y} r={4} fill="#2BD5A2" stroke="#FFFFFF" strokeWidth={1} />
              <Circle cx={points[8].x} cy={points[8].y} r={4} fill="#2BD5A2" stroke="#FFFFFF" strokeWidth={1} />
            </Svg>

            {/* X-Axis Labels */}
            <View style={styles.xAxisRow}>
              {['7', '8', '9', '10', '11', '12', '13', '14', '15', '16'].map((day, idx) => (
                <Text key={idx} style={styles.xAxisLabel}>
                  {day}
                </Text>
              ))}
            </View>
          </View>

          {/* RIWAYAT PROGRESS SECTION */}
          <Text style={[styles.sectionTitleHeader, { color: theme.mintDark }]}>Riwayat Progress</Text>

          {/* HORIZONTAL DATE PILLS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesRow}
          >
            {DATES_LIST.map((item) => {
              const isSelected = selectedDay === item.day;
              return (
                <Pressable
                  key={item.day}
                  onPress={() => setSelectedDay(item.day)}
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
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.dateLabelText,
                      { color: isSelected ? '#A9EAD7' : '#7C8C85' }
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* DYNAMIC PROGRESS DETAILS CARDS */}
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Status Emosi</Text>
            <Text style={[styles.detailValue, { color: theme.mintDark }]}>
              {currentData.status}
            </Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>Rekomendasi</Text>
            <Text style={[styles.detailValue, { color: theme.mintDark, fontSize: 15 }]}>
              {currentData.rekomendasi}
            </Text>
          </View>

          {/* HASIL SELF JOURNAL CARDS */}
          <Text style={[styles.sectionTitleHeader, { color: theme.mintDark, marginTop: Spacing.two }]}>
            Hasil Self Journal
          </Text>
          <View style={styles.journalCard}>
            <Text style={styles.journalText}>"{currentData.hasilJournal}"</Text>
          </View>

        </ScrollView>
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
    fontWeight: '700',
    marginLeft: Spacing.two,
  },
  bellButton: {
    padding: Spacing.one,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 110, // Prevent overlapping with bottom tab bar
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
  datesRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.four,
  },
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
  dateNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  dateLabelText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  detailCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C8C85',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
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
});
