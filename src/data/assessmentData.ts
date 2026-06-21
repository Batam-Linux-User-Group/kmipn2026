/**
 * assessmentData.ts
 *
 * Konfigurasi pohon keputusan (DAG) untuk Modul Asesmen Awal JEDA.
 * Setiap node merepresentasikan satu pertanyaan. Navigasi bersifat non-linear:
 * Pilihan jawaban menentukan node berikutnya (branching).
 *
 * Skema Poin:
 *   0 = Tidak ada gejala / respons sehat
 *   1 = Gejala ringan / rentan
 *   2 = Gejala berat / indikasi adiksi tinggi
 *
 * Flag khusus:
 *   isTrigger: true  → memaksa navigasi langsung ke BreathingScreen (intervensi krisis 45 detik)
 *   nextNodeId: 'result' → menandakan akhir asesmen, pindah ke layar hasil
 */

// ─── Interfaces ──────────────────────────────────────────────────────────

export interface Option {
  id: string;
  text: string;
  points: number;        // 0 | 1 | 2
  nextNodeId: string;    // ID node berikutnya, atau 'result' untuk akhir
  isTrigger?: boolean;   // Jika true, langsung pindah ke BreathingScreen
}

export interface QuestionNode {
  id: string;
  question: string;
  description?: string;  // Deskripsi tambahan untuk konteks
  options: Option[];
}

export type DecisionTree = Record<string, QuestionNode>;

// ─── Kategori Hasil ──────────────────────────────────────────────────────

export type ResultCategory = 'sehat' | 'rentan' | 'adiksi_tinggi';

export interface ResultInfo {
  category: ResultCategory;
  title: string;
  description: string;
  color: string;
  emoji: string;
}

export function getResultCategory(totalScore: number): ResultInfo {
  if (totalScore <= 2) {
    return {
      category: 'sehat',
      title: 'Kondisi Sehat',
      description:
        'Perilaku investasi digital Anda masih dalam batas wajar. Tetap jaga keseimbangan dan hindari dorongan impulsif.',
      color: '#3BCFA6',
      emoji: '🟢',
    };
  }
  if (totalScore <= 5) {
    return {
      category: 'rentan',
      title: 'Rentan',
      description:
        'Anda menunjukkan beberapa tanda kerentanan terhadap adiksi investasi digital. Pertimbangkan untuk mengambil jeda secara rutin.',
      color: '#F5A623',
      emoji: '🟡',
    };
  }
  return {
    category: 'adiksi_tinggi',
    title: 'Adiksi Tinggi',
    description:
      'Anda menunjukkan gejala adiksi investasi digital yang signifikan. Sangat disarankan untuk melakukan intervensi dan berkonsultasi dengan profesional.',
    color: '#E74C3C',
    emoji: '🔴',
  };
}

// ─── Pohon Keputusan (Decision Tree / DAG) ──────────────────────────────

export const assessmentTree: DecisionTree = {
  // ──────────────────────────────────────────────────────────────────────
  // NODE 1: Segmentasi Instrumen (Crypto vs Saham)
  // ──────────────────────────────────────────────────────────────────────
  start: {
    id: 'start',
    question: 'Instrumen investasi digital apa yang paling sering Anda gunakan?',
    description: 'Pilih instrumen utama yang paling mendominasi aktivitas trading Anda.',
    options: [
      {
        id: 'start_crypto',
        text: 'Kripto / Forex (pasar 24/7)',
        points: 0,
        nextNodeId: 'q_lama_crypto',
      },
      {
        id: 'start_saham',
        text: 'Saham (pasar jam kerja)',
        points: 0,
        nextNodeId: 'q_lama_saham',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // NODE 2a: Durasi Trading — Jalur Kripto
  // ──────────────────────────────────────────────────────────────────────
  q_lama_crypto: {
    id: 'q_lama_crypto',
    question: 'Berapa lama Anda menghabiskan waktu untuk memantau pasar kripto dalam sehari?',
    description: 'Termasuk cek harga, analisa chart, dan baca berita market.',
    options: [
      {
        id: 'lc_rendah',
        text: 'Kurang dari 1 jam',
        points: 0,
        nextNodeId: 'q_fomo',
      },
      {
        id: 'lc_sedang',
        text: '1–4 jam',
        points: 1,
        nextNodeId: 'q_fomo',
      },
      {
        id: 'lc_tinggi',
        text: 'Lebih dari 4 jam (termasuk tengah malam)',
        points: 2,
        nextNodeId: 'q_fomo',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // NODE 2b: Durasi Trading — Jalur Saham
  // ──────────────────────────────────────────────────────────────────────
  q_lama_saham: {
    id: 'q_lama_saham',
    question: 'Berapa lama Anda menghabiskan waktu untuk memantau pasar saham dalam sehari?',
    description: 'Termasuk cek portofolio, analisa chart, dan baca berita market.',
    options: [
      {
        id: 'ls_rendah',
        text: 'Hanya saat jam pasar buka (sebentar)',
        points: 0,
        nextNodeId: 'q_fomo',
      },
      {
        id: 'ls_sedang',
        text: 'Sepanjang jam pasar buka',
        points: 1,
        nextNodeId: 'q_fomo',
      },
      {
        id: 'ls_tinggi',
        text: 'Bahkan di luar jam pasar (terus cek pre-market/after-hours)',
        points: 2,
        nextNodeId: 'q_fomo',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // NODE 3: FOMO (Fear of Missing Out) — Konvergen
  // ──────────────────────────────────────────────────────────────────────
  q_fomo: {
    id: 'q_fomo',
    question: 'Seberapa sering Anda merasa cemas ketika TIDAK memantau pergerakan harga?',
    description: 'Rasa takut tertinggal peluang atau takut rugi tanpa disadari.',
    options: [
      {
        id: 'fomo_rendah',
        text: 'Jarang, saya bisa tenang tanpa cek harga',
        points: 0,
        nextNodeId: 'q_cutloss',
      },
      {
        id: 'fomo_sedang',
        text: 'Kadang merasa gelisah, terutama saat pasar volatil',
        points: 1,
        nextNodeId: 'q_cutloss',
      },
      {
        id: 'fomo_tinggi',
        text: 'Hampir selalu cemas, sulit fokus pada aktivitas lain',
        points: 2,
        nextNodeId: 'q_cutloss',
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // NODE 4: Reaksi terhadap Kerugian (Cutloss) — Node KRITIS
  // Opsi terakhir memiliki isTrigger: true → intervensi krisis pernapasan
  // ──────────────────────────────────────────────────────────────────────
  q_cutloss: {
    id: 'q_cutloss',
    question: 'Apa reaksi Anda ketika mengalami kerugian (cutloss) yang signifikan?',
    description: 'Respons emosional dan perilaku setelah kehilangan uang di pasar.',
    options: [
      {
        id: 'cl_rendah',
        text: 'Menerima dan evaluasi strategi dengan tenang',
        points: 0,
        nextNodeId: 'q_dampak',
      },
      {
        id: 'cl_sedang',
        text: 'Kecewa, tapi mencoba move on setelah beberapa waktu',
        points: 1,
        nextNodeId: 'q_dampak',
      },
      {
        id: 'cl_tinggi',
        text: 'Panik berat / langsung ingin "balas dendam" (revenge trading)',
        points: 2,
        nextNodeId: 'q_dampak',
        isTrigger: true, // ⚠️ INTERVENSI KRISIS: Paksa napas 45 detik
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────
  // NODE 5: Dampak terhadap Kehidupan Sehari-hari
  // ──────────────────────────────────────────────────────────────────────
  q_dampak: {
    id: 'q_dampak',
    question:
      'Apakah aktivitas investasi digital Anda sudah mengganggu kehidupan sehari-hari?',
    description:
      'Termasuk gangguan tidur, pekerjaan, hubungan sosial, atau kesehatan fisik.',
    options: [
      {
        id: 'dp_rendah',
        text: 'Tidak, kehidupan saya berjalan normal',
        points: 0,
        nextNodeId: 'result',
      },
      {
        id: 'dp_sedang',
        text: 'Sedikit terganggu (kurang tidur / kurang fokus kerja)',
        points: 1,
        nextNodeId: 'result',
      },
      {
        id: 'dp_tinggi',
        text: 'Sangat terganggu (insomnia, konflik keluarga, performa kerja turun)',
        points: 2,
        nextNodeId: 'result',
      },
    ],
  },
};

// ─── Utilitas ────────────────────────────────────────────────────────────

/**
 * Menghitung total jumlah node pertanyaan dalam tree (tidak termasuk 'result').
 * Berguna untuk progress bar.
 */
export function getTotalNodeCount(): number {
  return Object.keys(assessmentTree).length;
}

/**
 * Mendapatkan node berdasarkan ID.
 */
export function getNodeById(nodeId: string): QuestionNode | undefined {
  return assessmentTree[nodeId];
}
