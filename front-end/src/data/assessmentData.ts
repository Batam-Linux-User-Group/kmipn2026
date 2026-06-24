// src/data/assessmentData.ts
// Complete DAG for the JEDA assessment flow.
// Each node has a question, highlighted keywords, and options with scores + routing.

export interface AssessmentOption {
  text: string;
  next: string; // next node ID, or 'result'
  score: number; // 0 = healthy, 1 = moderate, 2 = risky
  isTrigger?: boolean; // true = show 30s breathing screen before advancing
}

export interface AssessmentNode {
  id: string;
  question: string;
  highlightWords: string[]; // words to render in #3BCFA6
  options: AssessmentOption[];
}

export const assessmentNodes: Record<string, AssessmentNode> = {
  // ══════════════════════════════════════════════════
  // ROOT
  // ══════════════════════════════════════════════════
  start: {
    id: 'start',
    question: 'Instrumen Investasi mana yang sering kamu lakukan?',
    highlightWords: ['Instrumen Investasi', 'sering'],
    options: [
      { text: 'Crypto/Forex', next: 'c_lama', score: 0 },
      { text: 'Saham', next: 's_lama', score: 0 },
    ],
  },

  // ══════════════════════════════════════════════════
  // BRANCH 1: SAHAM
  // ══════════════════════════════════════════════════
  s_lama: {
    id: 's_lama',
    question: 'Sudah berapa lama kamu di investasi di Saham?',
    highlightWords: ['Saham'],
    options: [
      { text: '< 1 Bulan', next: 's_frekuensi', score: 2 },
      { text: '< 6 Bulan', next: 's_frekuensi', score: 1 },
      { text: '> 1 Tahun', next: 's_frekuensi', score: 0 },
    ],
  },

  s_frekuensi: {
    id: 's_frekuensi',
    question: 'Seberapa Sering Kamu melihat chart per-hari?',
    highlightWords: ['Sering'],
    options: [
      { text: 'Hanya saat jam pasar buka (sebentar)', next: 's_portofolio', score: 0 },
      { text: 'Sepanjang jam pasar buka', next: 's_portofolio', score: 1 },
      { text: 'Bahkan di luar jam pasar (Terus terusan)', next: 's_portofolio', score: 2 },
    ],
  },

  s_portofolio: {
    id: 's_portofolio',
    question: 'Apa yang sedang portofoliomu hari ini?',
    highlightWords: ['portofoliomu'],
    options: [
      { text: 'Baru saja Cutloss / Jual rugi', next: 's_rugi_cutloss', score: 2 },
      { text: 'Nyangkut / Hold', next: 's_rugi_nyangkut', score: 1 },
      { text: 'Tidak Entry', next: 's_emosi_tidak_entry', score: 0 },
    ],
  },

  // --- Sub-branch A: Saham Cutloss ---
  s_rugi_cutloss: {
    id: 's_rugi_cutloss',
    question: 'Seberapa Besar Rugi Tersebut bagi Anda?',
    highlightWords: ['Besar'],
    options: [
      { text: 'Sangat Kecil (10% Modal)', next: 's_after_cutloss', score: 0 },
      { text: 'Kecil (Dibawah 10% modal)', next: 's_after_cutloss', score: 1 },
      { text: 'Besar', next: 's_after_cutloss', score: 2 },
    ],
  },

  s_after_cutloss: {
    id: 's_after_cutloss',
    question: 'Apa yang kamu lakukan setelah Cutloss?',
    highlightWords: ['Cutloss'],
    options: [
      { text: 'Beli Saham lain untuk menutup kerugian', next: 's_kondisi', score: 2 },
      { text: 'Ingin Top up untuk Averaging Down', next: 's_kondisi', score: 1 },
      { text: 'Menutup Aplikasi dan berhenti melihat chart', next: 's_kondisi', score: 0 },
    ],
  },

  s_kondisi: {
    id: 's_kondisi',
    question: 'Bagaimana kondisi kamu saat itu?',
    highlightWords: ['kondisi'],
    options: [
      {
        text: 'Panik berat, langsung ingin balas dendam',
        next: 's_alasan',
        score: 2,
        isTrigger: true,
      },
      { text: 'Kecewa, tapi mencoba move on', next: 's_alasan', score: 1 },
      { text: 'Menganggap sebagai dana belajar', next: 's_alasan', score: 0 },
    ],
  },

  // --- Sub-branch B: Saham Nyangkut/Hold ---
  s_rugi_nyangkut: {
    id: 's_rugi_nyangkut',
    question: 'Seberapa Besar Rugi Tersebut bagi Anda?',
    highlightWords: ['Besar'],
    options: [
      { text: 'Besar (Diatas 20% modal)', next: 's_solusi_nyangkut', score: 2 },
      { text: 'Kecil (Dibawah 10% modal)', next: 's_solusi_nyangkut', score: 0 },
    ],
  },

  s_solusi_nyangkut: {
    id: 's_solusi_nyangkut',
    question: 'Apa solusi dari kamu?',
    highlightWords: ['solusi'],
    options: [
      { text: 'Average Down', next: 's_alasan', score: 1 },
      { text: 'Hold sampai biru (cuan)', next: 's_alasan', score: 1 },
    ],
  },

  // --- Saham Convergence ---
  s_alasan: {
    id: 's_alasan',
    question: 'Apa alasanmu entry seperti itu?',
    highlightWords: ['alasanmu'],
    options: [
      { text: 'Mengikuti Influencer Pompom Saham', next: 'result', score: 2 },
      { text: 'Entry tanpa analisis', next: 'result', score: 2 },
      { text: 'Fomo, entry saham gorengan', next: 'result', score: 2 },
    ],
  },

  // --- Sub-branch C: Saham Tidak Entry ---
  s_emosi_tidak_entry: {
    id: 's_emosi_tidak_entry',
    question: 'Bagaimana emosimu hari ini?',
    highlightWords: ['emosimu'],
    options: [
      { text: 'Baik', next: 'result', score: 0 },
      { text: 'Biasa', next: 'result', score: 1 },
      { text: 'Buruk', next: 'result', score: 2 },
    ],
  },

  // ══════════════════════════════════════════════════
  // BRANCH 2: CRYPTO / FOREX
  // ══════════════════════════════════════════════════
  c_lama: {
    id: 'c_lama',
    question: 'Sudah berapa lama kamu di investasi di Kripto/Forex?',
    highlightWords: ['Kripto/Forex'],
    options: [
      { text: '< 1 Bulan', next: 'c_frekuensi', score: 2 },
      { text: '> 6 Bulan', next: 'c_frekuensi', score: 1 },
      { text: '> 1 Tahun', next: 'c_frekuensi', score: 0 },
    ],
  },

  c_frekuensi: {
    id: 'c_frekuensi',
    question: 'Seberapa Sering Kamu melihat chart per-hari?',
    highlightWords: ['Sering'],
    options: [
      { text: 'Jarang (1-2 kali sehari)', next: 'c_jenis', score: 0 },
      { text: 'Sering (5-10 kali sehari)', next: 'c_jenis', score: 1 },
      { text: 'Hampir Selalu (>10 kali sehari)', next: 'c_jenis', score: 2 },
    ],
  },

  c_jenis: {
    id: 'c_jenis',
    question: 'Jenis investasi apa yang paling sering?',
    highlightWords: ['sering'],
    options: [
      { text: 'Futures/Forex', next: 'c_rugi', score: 1 },
      { text: 'Spot', next: 'c_spot_portofolio', score: 0 },
    ],
  },

  // ════════ Crypto Sub-branch: FUTURES/FOREX ════════
  c_rugi: {
    id: 'c_rugi',
    question: 'Seberapa sering rugi saat trading?',
    highlightWords: ['sering'],
    options: [
      { text: 'Sangat Sering (Setiap kali Trading)', next: 'c_pantau', score: 2 },
      { text: 'Sedang (50/50)', next: 'c_pantau', score: 1 },
      { text: 'Sesekali / Belum pernah', next: 'c_pantau', score: 0 },
    ],
  },

  c_pantau: {
    id: 'c_pantau',
    question: 'Berapa lama kamu memantau layar tanpa istirahat?',
    highlightWords: [],
    options: [
      { text: '> 4 Jam / Saya kurang tidur', next: 'c_kondisi_hari', score: 2 },
      { text: '< 2 Jam', next: 'c_kondisi_hari', score: 1 },
      { text: 'Sebentar', next: 'c_kondisi_hari', score: 0 },
    ],
  },

  c_kondisi_hari: {
    id: 'c_kondisi_hari',
    question: 'Kondisi tradingmu Hari ini?',
    highlightWords: ['kondisi'],
    options: [
      { text: 'Margin Call (Saldo terlikuidasi)', next: 'c_langkah', score: 2 },
      { text: 'Posisi floating minus parah', next: 'c_langkah', score: 1 },
      { text: 'Tidak ada', next: 'c_langkah', score: 0 },
    ],
  },

  c_langkah: {
    id: 'c_langkah',
    question: 'Di situasi ini, apa langkah gegabah yang kamu lakukan?',
    highlightWords: [],
    options: [
      { text: 'Mencari pinjaman/Dana darurat untuk menahan margin', next: 'c_kondisi_mental', score: 2 },
      { text: 'Membuka posisi berlawanan dengan volume lebih besar', next: 'c_kondisi_mental', score: 2 },
      { text: 'Pasrah dan menerima kerugian ini sebagai pelajaran', next: 'result', score: 0 },
    ],
  },

  c_kondisi_mental: {
    id: 'c_kondisi_mental',
    question: 'Bagaimana kondisi kamu saat itu?',
    highlightWords: ['kondisi'],
    options: [
      {
        text: 'Panik berat, langsung ingin balas dendam',
        next: 'c_alasan',
        score: 2,
        isTrigger: true,
      },
      { text: 'Kecewa, tapi masih bisa move-on', next: 'c_alasan', score: 1 },
      { text: 'Menganggap sebagai dana belajar', next: 'c_alasan', score: 0 },
    ],
  },

  c_alasan: {
    id: 'c_alasan',
    question: 'Apa alasanmu entry seperti itu?',
    highlightWords: ['alasanmu'],
    options: [
      { text: 'Mengikuti Perkataan Influencer', next: 'result', score: 2 },
      { text: 'Entry tanpa analisis', next: 'result', score: 2 },
      { text: 'Fomo', next: 'result', score: 2 },
      { text: 'Coba-coba', next: 'result', score: 1 },
    ],
  },

  // ════════ Crypto Sub-branch: SPOT ════════
  c_spot_portofolio: {
    id: 'c_spot_portofolio',
    question: 'Apa yang sedang portofoliomu hari ini?',
    highlightWords: ['portofoliomu'],
    options: [
      { text: 'Baru saja Cutloss / Jual rugi', next: 'c_spot_rugi_cutloss', score: 2 },
      { text: 'Nyangkut / Hold', next: 'c_spot_rugi_nyangkut', score: 1 },
      { text: 'Tidak Entry', next: 'c_spot_emosi_tidak_entry', score: 0 },
    ],
  },

  // --- Spot Cutloss ---
  c_spot_rugi_cutloss: {
    id: 'c_spot_rugi_cutloss',
    question: 'Seberapa Besar Rugi Tersebut bagi Anda?',
    highlightWords: ['Besar'],
    options: [
      { text: 'Besar (Diatas 20% modal)', next: 'c_spot_after_cutloss', score: 2 },
      { text: 'Kecil (Dibawah 10% modal)', next: 'c_spot_after_cutloss', score: 0 },
    ],
  },

  c_spot_after_cutloss: {
    id: 'c_spot_after_cutloss',
    question: 'Apa yang kamu lakukan setelah Cutloss?',
    highlightWords: ['Cutloss'],
    options: [
      { text: 'Beli coin lain untuk menutup kerugian', next: 'c_spot_kondisi', score: 2 },
      { text: 'Ingin Top-up untuk Averaging Down', next: 'c_spot_kondisi', score: 1 },
      { text: 'Menutup Aplikasi dan berhenti melihat chart', next: 'c_spot_kondisi', score: 0 },
    ],
  },

  c_spot_kondisi: {
    id: 'c_spot_kondisi',
    question: 'Bagaimana kondisi kamu saat itu?',
    highlightWords: ['kondisi'],
    options: [
      {
        text: 'Panik berat, langsung ingin balas dendam',
        next: 'c_spot_alasan',
        score: 2,
        isTrigger: true,
      },
      { text: 'Kecewa, tapi masih bisa move-on', next: 'c_spot_alasan', score: 1 },
      { text: 'Menganggap sebagai dana belajar', next: 'c_spot_alasan', score: 0 },
    ],
  },

  // --- Spot Nyangkut/Hold ---
  c_spot_rugi_nyangkut: {
    id: 'c_spot_rugi_nyangkut',
    question: 'Seberapa Besar Rugi Tersebut bagi Anda?',
    highlightWords: ['Besar'],
    options: [
      { text: 'Besar (Diatas 20% modal)', next: 'c_spot_solusi_nyangkut', score: 2 },
      { text: 'Kecil (Dibawah 10% modal)', next: 'c_spot_solusi_nyangkut', score: 0 },
    ],
  },

  c_spot_solusi_nyangkut: {
    id: 'c_spot_solusi_nyangkut',
    question: 'Apa solusi dari kamu?',
    highlightWords: ['solusi'],
    options: [
      { text: 'Average Down / Serok bawah', next: 'c_spot_alasan', score: 1 },
      { text: 'Hold sampai kejemput / To the moon', next: 'c_spot_alasan', score: 1 },
    ],
  },

  // --- Spot Convergence ---
  c_spot_alasan: {
    id: 'c_spot_alasan',
    question: 'Apa alasanmu entry seperti ini?',
    highlightWords: ['alasanmu'],
    options: [
      { text: 'Mengikuti Perkataan Influencer', next: 'result', score: 2 },
      { text: 'Entry tanpa analisis', next: 'result', score: 2 },
      { text: 'Fomo, masuk ke coin yang naik tinggi', next: 'result', score: 2 },
    ],
  },

  // --- Spot Tidak Entry ---
  c_spot_emosi_tidak_entry: {
    id: 'c_spot_emosi_tidak_entry',
    question: 'Bagaimana emosimu hari ini?',
    highlightWords: ['emosimu'],
    options: [
      { text: 'Baik', next: 'result', score: 0 },
      { text: 'Biasa', next: 'result', score: 1 },
      { text: 'Buruk', next: 'result', score: 2 },
    ],
  },
};

// Helper: get a node by ID
export function getNode(id: string): AssessmentNode | undefined {
  return assessmentNodes[id];
}

// Scoring thresholds for risk status
export function getRiskStatus(totalScore: number): {
  status: string;
  recommendation: string;
} {
  if (totalScore <= 3) {
    return {
      status: 'Rendah',
      recommendation:
        'Kebiasaan investasimu terlihat sehat. Tetap pertahankan pendekatan yang disiplin dan berbasis analisis. Gunakan JEDA secara berkala untuk menjaga kesehatan mental investasimu.',
    };
  }
  if (totalScore <= 7) {
    return {
      status: 'Rentan',
      recommendation:
        'Kamu menunjukkan beberapa tanda kerentanan dalam perilaku investasi. Waspadai dorongan impulsif dan pastikan setiap keputusan didasari analisis. Sangat disarankan untuk rutin menggunakan JEDA.',
    };
  }
  return {
    status: 'Adiksi Tinggi',
    recommendation:
      'Anda menunjukkan adiksi investasi digital yang signifikan. Sangat disarankan untuk melakukan intervensi dan mengambil JEDA. Menambah risiko saat emosi tidak stabil adalah awal dari kehancuran.',
  };
}
