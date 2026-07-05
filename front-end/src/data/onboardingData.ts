import { AnimationObject } from 'lottie-react-native';

export interface OnboardingData {
  id: number;
  animation: AnimationObject;
  titleBlack: string;
  titleMint: string;
  titleMintInline: boolean;
  description: string;
}

const data: OnboardingData[] = [
  {
    id: 1,
    animation: require('../assets/animation/MeditatingBrain.json'),
    titleBlack: "Berhenti Sejenak,",
    titleMint: "Ambil JEDA",
    titleMintInline: true,
    description: "JEDA hadir sebagai ruang aman untuk membantumu pulih dari Adiksi Investasi Digital",
  },
  {
    id: 2,
    animation: require('../assets/animation/MeditatingBrain.json'),
    titleBlack: "Peluang Selalu",
    titleMint: "Ada",
    titleMintInline: false,
    description: "Memilih untuk tidak over-trading dan mengamankan modalmu juga merupakan sebuah strategi.",
  },
  {
    id: 3,
    animation: require('../assets/animation/MeditatingBrain.json'),
    titleBlack: "Kendalikan",
    titleMint: "Emosi mu",
    titleMintInline: false,
    description: "Saat panik muncul, tarik napas perlahan, redam adrenalin yang merugikan.",
  },
  {
    id: 4,
    animation: require('../assets/animation/MeditatingBrain.json'),
    titleBlack: "Pahami",
    titleMint: "Pola Pikiran mu",
    titleMintInline: false,
    description: "Kenali emosi lewat catatan evaluasi singkat, sadari bias yang berulang dan jadilah orang yang lebih rasional.",
  },
  {
    id: 5,
    animation: require('../assets/animation/CommunityV2.json'),
    titleBlack: "Belajar & ",
    titleMint: "Tumbuh Bersama",
    titleMintInline: false,
    description: "ikuti diskusi, bertukar pengalaman, dan bangun kebiasaan trading/investasi yang lebih sehat bersama komunitas JEDA.",
  },
];

export default data;