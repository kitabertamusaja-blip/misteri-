import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Sparkles, 
  Moon, 
  TrendingUp, 
  Search, 
  Heart, 
  Share2, 
  ChevronRight,
  Star,
  Loader2,
  X,
  Compass,
  Zap,
  Coffee,
  Briefcase,
  Coins,
  Calendar,
  Hash,
  Flame,
  Bookmark,
  Sun,
  Palette,
  Users,
  Clock,
  Store,
  Crown,
  MapPin,
  Trees,
  MessageSquare,
  Send,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES & ENUMS ---
export enum Page {
  HOME = 'home',
  DETAIL = 'detail',
  ZODIAC = 'zodiac',
  NUMEROLOGY = 'numerology',
  TRENDING = 'trending',
  FAVORITE = 'favorite',
  JAVA_HOROSCOPE = 'java_horoscope',
  CHINESE_ZODIAC = 'chinese_zodiac',
  SUNDANESE_PRIMBON = 'sundanese_primbon',
  COMMENT = 'comment',
  TAROT = 'tarot',
  COMPATIBILITY = 'compatibility'
}

export interface Dream {
  id?: number;
  slug: string;
  judul: string;
  kategori: string;
  ringkasan: string;
  tafsir_positif: string;
  tafsir_negatif: string;
  angka: string;
  view_count: number;
}

export interface UserComment {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export interface ZodiacInfo {
  nama: string;
  tanggal: string;
  icon: string;
}

// --- CONSTANTS ---
const ZODIAC_LIST: ZodiacInfo[] = [
  { nama: 'Aries', tanggal: '21 Mar - 19 Apr', icon: '♈' },
  { nama: 'Taurus', tanggal: '20 Apr - 20 Mei', icon: '♉' },
  { nama: 'Gemini', tanggal: '21 Mei - 20 Jun', icon: '♊' },
  { nama: 'Cancer', tanggal: '21 Jun - 22 Jul', icon: '♋' },
  { nama: 'Leo', tanggal: '23 Jul - 22 Agu', icon: '♌' },
  { nama: 'Virgo', tanggal: '23 Agu - 22 Sep', icon: '♍' },
  { nama: 'Libra', tanggal: '23 Sep - 22 Okt', icon: '♎' },
  { nama: 'Scorpio', tanggal: '23 Okt - 21 Nov', icon: '♏' },
  { nama: 'Sagittarius', tanggal: '22 Nov - 21 Des', icon: '♐' },
  { nama: 'Capricorn', tanggal: '22 Des - 19 Jan', icon: '♑' },
  { nama: 'Aquarius', tanggal: '20 Jan - 18 Feb', icon: '♒' },
  { nama: 'Pisces', tanggal: '19 Feb - 20 Mar', icon: '♓' }
];

const MAJOR_ARCANA = [
  { id: 0, name: "The Fool", icon: "🃏" },
  { id: 1, name: "The Magician", icon: "🧙‍♂️" },
  { id: 2, name: "The High Priestess", icon: "🌙" },
  { id: 3, name: "The Empress", icon: "👑" },
  { id: 4, name: "The Emperor", icon: "⚔️" },
  { id: 5, name: "The Hierophant", icon: "📜" },
  { id: 6, name: "The Lovers", icon: "💖" },
  { id: 7, name: "The Chariot", icon: "🛒" },
  { id: 8, name: "Strength", icon: "🦁" },
  { id: 9, name: "The Hermit", icon: "🕯️" },
  { id: 10, name: "Wheel of Fortune", icon: "🎡" },
  { id: 11, name: "Justice", icon: "⚖️" },
  { id: 12, name: "The Hanged Man", icon: "🧘" },
  { id: 13, name: "Death", icon: "💀" },
  { id: 14, name: "Temperance", icon: "🍷" },
  { id: 15, name: "The Devil", icon: "😈" },
  { id: 16, name: "The Tower", icon: "🏰" },
  { id: 17, name: "The Star", icon: "⭐" },
  { id: 18, name: "The Moon", icon: "🌙" },
  { id: 19, name: "The Sun", icon: "☀️" },
  { id: 20, name: "Judgement", icon: "🎺" },
  { id: 21, name: "The World", icon: "🌍" }
];

// --- API CONFIGURATION ---
const PROD_API_URL = 'https://misteri.faciltrix.com/api'; 
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost/misteri-api' : PROD_API_URL; 

// --- HELPER UNTUK PROXY AI ---
const callGeminiProxy = async (model: string, contents: any, config: any = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/gemini-proxy.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, contents, config })
    });
    const result = await response.json();
    if (result.status === 'success') {
      return result.text;
    } else {
      console.error("Proxy AI Error:", result.message);
      return null;
    }
  } catch (err) {
    console.error("Network Error to Proxy:", err);
    return null;
  }
};

// --- SERVICES ---
const fetchFromDB = async (query: string = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/search.php?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
};

const saveMimpiToDB = async (dreamData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-mimpi.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dreamData)
    });
    return await response.json();
  } catch (e) { 
    return null;
  }
};

const fetchZodiacFromDB = async (zodiac: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-zodiac.php?nama=${zodiac}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.data : null;
  } catch (e) {
    return null;
  }
};

const saveZodiacToDB = async (zodiac: string, fortune: any) => {
  try {
    await fetch(`${API_BASE_URL}/save-zodiac.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: zodiac, content: fortune })
    });
  } catch (e) {
    console.error("Network error saat simpan zodiak");
  }
};

const fetchNumerologyFromDB = async (dob: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-numerology.php?dob=${dob}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.data : null;
  } catch (e) {
    return null;
  }
};

const saveNumerologyToDB = async (dob: string, lifePath: number, reading: any) => {
  try {
    await fetch(`${API_BASE_URL}/save-numerology.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dob, life_path_number: lifePath, content: reading })
    });
  } catch (e) {
    console.error("Network error saat simpan numerologi:", e);
  }
};

const fetchPrimbonFromDB = async (dob: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-primbon.php?dob=${dob}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.data : null;
  } catch (e) {
    return null;
  }
};

const savePrimbonToDB = async (dob: string, weton: string, neptu: number, reading: any) => {
  try {
    await fetch(`${API_BASE_URL}/save-primbon.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dob, weton, neptu, content: reading })
    });
  } catch (e) {
    console.error("Network error saat simpan primbon:", e);
  }
};

const fetchChineseZodiacFromDB = async (dob: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-chinese-zodiac.php?dob=${dob}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.data : null;
  } catch (e) {
    return null;
  }
};

const saveChineseZodiacToDB = async (dob: string, reading: any) => {
  try {
    await fetch(`${API_BASE_URL}/save-chinese-zodiac.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dob, shio: reading.shio, content: reading })
    });
  } catch (e) {
    console.error("Network error saat simpan shio:", e);
  }
};

const fetchSundaFromDB = async (dob: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-sunda.php?dob=${dob}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.data : null;
  } catch (e) {
    return null;
  }
};

const saveSundaToDB = async (dob: string, reading: any) => {
  try {
    await fetch(`${API_BASE_URL}/save-sunda.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dob, wedal: reading.wedal, content: reading })
    });
  } catch (e) {
    console.error("Network error saat simpan Sunda:", e);
  }
};

const fetchTarotFromDB = async (question: string, cardName: string) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/get-tarot.php?q=${encodeURIComponent(question)}&card=${encodeURIComponent(cardName)}&date=${date}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.data : null;
  } catch (e) {
    return null;
  }
};

const saveTarotToDB = async (question: string, cardName: string, reading: any) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    await fetch(`${API_BASE_URL}/save-tarot.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, card_name: cardName, content: reading, date })
    });
  } catch (e) {
    console.error("Network error saat simpan Tarot:", e);
  }
};

const fetchCompatibilityFromDB = async (name1: string, dob1: string, name2: string, dob2: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-compatibility.php?n1=${encodeURIComponent(name1)}&d1=${dob1}&n2=${encodeURIComponent(name2)}&d2=${dob2}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.status === 'success' ? data.data : null;
  } catch (e) {
    return null;
  }
};

const saveCompatibilityToDB = async (name1: string, dob1: string, name2: string, dob2: string, score: number, reading: any) => {
  try {
    await fetch(`${API_BASE_URL}/save-compatibility.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name1, dob1, name2, dob2, score, content: reading })
    });
  } catch (e) {
    console.error("Network error saat simpan kecocokan:", e);
  }
};

const fetchComments = async (limit: number = 0) => {
  try {
    const url = limit > 0 ? `${API_BASE_URL}/get-comments.php?limit=${limit}` : `${API_BASE_URL}/get-comments.php`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.status === 'success' ? data.data : [];
  } catch (e) {
    return [];
  }
};

const saveComment = async (name: string, message: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/save-comment.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    return await response.json();
  } catch (e) {
    return { status: 'error', message: 'Koneksi gagal' };
  }
};

// --- AI GENERATORS (REFACTORED TO USE PROXY) ---
const getAIInterpretation = async (userPrompt: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan tafsir mimpi untuk: "${userPrompt}". Bahasa: Indonesia. Nuansa: Mistis, Bijak, Berwibawa. Sertakan 3 angka mistis keberuntungan. Tahun 2026.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          judul: { type: "STRING" },
          ringkasan: { type: "STRING" },
          tafsir_positif: { type: "STRING" },
          tafsir_negatif: { type: "STRING" },
          angka: { type: "STRING" },
          kategori: { type: "STRING" }
        },
        required: ["judul", "ringkasan", "tafsir_positif", "tafsir_negatif", "angka", "kategori"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

const getZodiacFortune = async (zodiac: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan ramalan harian untuk zodiak ${zodiac}. Hari ini: ${new Date().toLocaleDateString('id-ID')}. Ramalan untuk tahun 2026.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          judul: { type: "STRING" },
          umum: { type: "STRING" },
          cinta: { type: "STRING" },
          karir: { type: "STRING" },
          keuangan: { type: "STRING" },
          warna_hoki: { type: "STRING" },
          angka_hoki: { type: "STRING" }
        },
        required: ["judul", "umum", "cinta", "karir", "keuangan", "warna_hoki", "angka_hoki"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

const getNumerologyReading = async (number: number, dob: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan pembacaan numerologi untuk Angka Jalur Hidup (Life Path Number) ${number} berdasarkan tanggal lahir ${dob}. Nuansa: Mistis and mendalam. Analisis untuk tahun 2026.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          kepribadian: { type: "STRING" },
          karir: { type: "STRING" },
          asmara: { type: "STRING" },
          saran: { type: "STRING" },
          batu_permata: { type: "STRING" }
        },
        required: ["kepribadian", "karir", "asmara", "saran", "batu_permata"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

const getPrimbonReading = async (dob: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan ramalan Primbon Jawa lengkap untuk tanggal lahir ${dob}. 
      Tugas spesifik:
      1. Hitung Weton (Hari + Pasaran).
      2. Hitung Nilai Neptu.
      3. Berikan makna filosofis hari tersebut.
      4. Berikan ramalan Watak, Keberuntungan, Rejeki untuk tahun 2026.
      5. Berikan daftar Pekerjaan yang cocok, Jodoh yang cocok, Warna keberuntungan, dan Hari Baik.
      6. Berikan daftar Jenis Bisnis yang cocok untuk weton ini di tahun 2026.
      Bahasa: Indonesia. Nuansa: Tradisional, Mistis, Berwibawa.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          weton: { type: "STRING" },
          neptu: { type: "NUMBER" },
          makna_hari: { type: "STRING" },
          watak: { type: "STRING" },
          keberuntungan: { type: "STRING" },
          rejeki: { type: "STRING" },
          pekerjaan: { type: "STRING" },
          bisnis: { type: "STRING" },
          jodoh: { type: "STRING" },
          warna: { type: "STRING" },
          hari_baik: { type: "STRING" },
          saran: { type: "STRING" }
        },
        required: ["weton", "neptu", "makna_hari", "watak", "keberuntungan", "rejeki", "pekerjaan", "bisnis", "jodoh", "warna", "hari_baik", "saran"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

const getChineseZodiacReading = async (dob: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan ramalan Horoskop China (Shio) lengkap untuk tanggal lahir ${dob}. 
      Identifikasi: Shio, Elemen (Kayu/Api/Tanah/Logam/Air), and Energi (Yin/Yang).
      Berikan ramalan Karakter, Karir, Asmara, and Keberuntungan tahun 2026 (Tahun Kuda Api).
      Bahasa: Indonesia. Nuansa: Tradisional Oriental, Bijak, Filosofis.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          shio: { type: "STRING" },
          elemen: { type: "STRING" },
          energi: { type: "STRING" },
          icon: { type: "STRING", description: "Emoji hewan shio" },
          karakter: { type: "STRING" },
          karir: { type: "STRING" },
          asmara: { type: "STRING" },
          jodoh_cocok: { type: "STRING" },
          keberuntungan_2026: { type: "STRING" },
          warna_hoki: { type: "STRING" }
        },
        required: ["shio", "elemen", "energi", "icon", "karakter", "karir", "asmara", "jodoh_cocok", "keberuntungan_2026", "warna_hoki"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

const getSundanesePrimbonReading = async (dob: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan ramalan Primbon Sunda (Paririmbon) lengkap untuk tanggal lahir ${dob}. 
      Tugas:
      1. Identifikasi Wedal (Hari Lahir Sunda).
      2. Tentukan Elemen Wedal (Cai/Air, Seuneu/Api, Bumi/Tanah, Angin/Udara, dll).
      3. Berikan watak dasar (Paripolah) yang mendalam.
      4. Berikan ramalan Rejeki (Lalampahan Hirup) untuk tahun 2026.
      5. Berikan Jodoh yang cocok (Pitemuane Jodoh).
      6. Berikan Hari Baik dan Pantangan (Caliweura) di tahun 2026.
      7. Berikan Makna Filosofis Sunda yang relevan.
      Bahasa: Indonesia (dengan sedikit istilah Sunda). Nuansa: Tradisional Sunda, Bijak, Mistis.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          wedal: { type: "STRING" },
          elemen: { type: "STRING" },
          watak: { type: "STRING" },
          rejeki: { type: "STRING" },
          jodoh: { type: "STRING" },
          hari_baik: { type: "STRING" },
          pantangan: { type: "STRING" },
          makna_filosofis: { type: "STRING" },
          nasihat: { type: "STRING" }
        },
        required: ["wedal", "elemen", "watak", "rejeki", "jodoh", "hari_baik", "pantangan", "makna_filosofis", "nasihat"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

const getTarotReading = async (cardName: string, question: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan pembacaan kartu Tarot untuk kartu: "${cardName}". 
      Pertanyaan user: "${question || 'Ramalan harian'}".
      Berikan interpretasi mendalam untuk tahun 2026. 
      Sertakan makna spiritual kartu tersebut.
      Bahasa: Indonesia. Nuansa: Mistis, Bijak, Berwibawa.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          makna_umum: { type: "STRING" },
          spiritual: { type: "STRING" },
          karir: { type: "STRING" },
          asmara: { type: "STRING" },
          nasihat: { type: "STRING" }
        },
        required: ["makna_umum", "spiritual", "karir", "asmara", "nasihat"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

const getPartnerCompatibility = async (n1: string, d1: string, n2: string, d2: string) => {
  const resultText = await callGeminiProxy(
    'gemini-3-flash-preview',
    `Berikan analisis kecocokan pasangan untuk:
      Orang 1: ${n1} (Lahir: ${d1})
      Orang 2: ${n2} (Lahir: ${d2})
      Berikan analisis jujur and mendalam untuk tahun 2026 berdasarkan Zodiak, Weton, Numerologi, and Paririmbon. 
      Hitung skor persentase (%) kecocokan yang logis (bisa rendah, bisa tinggi).
      Bahasa: Indonesia. Nuansa: Bijak, Spiritual, Realistis.`,
    {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          skor: { type: "NUMBER" },
          sebutan: { type: "STRING", description: "Misal: Pasangan Takdir, Tantangan Jiwa, dll" },
          dinamika_elemen: { type: "STRING" },
          kelebihan: { type: "STRING" },
          tantangan: { type: "STRING" },
          saran: { type: "STRING" },
          analisis_2026: { type: "STRING" }
        },
        required: ["skor", "sebutan", "dinamika_elemen", "kelebihan", "tantangan", "saran", "analisis_2026"]
      }
    }
  );
  return resultText ? JSON.parse(resultText) : null;
};

// --- CONTEXT ---
interface AppContextType {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  selectedDream: Dream | null;
  setSelectedDream: (dream: Dream | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showInterstitial: boolean;
  setShowInterstitial: (show: boolean) => void;
  trendingDreams: Dream[];
  refreshTrending: () => void;
  latestComments: UserComment[];
  refreshComments: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [trendingDreams, setTrendingDreams] = useState<Dream[]>([]);
  const [latestComments, setLatestComments] = useState<UserComment[]>([]);

  const refreshTrending = async () => {
    const data = await fetchFromDB();
    if (data) setTrendingDreams(data);
  };

  const refreshComments = async () => {
    const data = await fetchComments(10);
    if (data) setLatestComments(data);
  };

  useEffect(() => {
    refreshTrending();
    refreshComments();
    const saved = localStorage.getItem('misteri_favs_v2');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (slug: string) => {
    setFavorites(prev => {
      const next = prev.includes(slug) ? prev.filter(f => f !== slug) : [...prev, slug];
      localStorage.setItem('misteri_favs_v2', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      favorites, toggleFavorite,
      selectedDream, setSelectedDream,
      isLoading, setIsLoading,
      showInterstitial, setShowInterstitial,
      trendingDreams, refreshTrending,
      latestComments, refreshComments
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- UI COMPONENTS ---
const FloatingShareButton: React.FC<{ text: string }> = ({ text }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Misteri+',
          text: text,
          url: 'https://misteri.faciltrix.com/'
        });
      } catch (err) {
        console.error("Gagal share:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} https://misteri.faciltrix.com/`);
        alert("Pesan ramalan telah disalin!");
      } catch (err) {
        console.error("Gagal menyalin:", err);
      }
    }
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleShare}
      className="fixed bottom-32 right-6 z-[9500] w-16 h-16 bg-[#7F5AF0] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(127,90,240,0.6)] border border-white/20 active:scale-90 transition-all"
    >
      <Share2 size={28} className="text-white" />
      <div className="absolute inset-0 rounded-full border-4 border-[#7F5AF0] animate-ping opacity-20 pointer-events-none"></div>
    </motion.button>
  );
};

const AdBanner: React.FC<{ type: 'banner' | 'interstitial', onClose?: () => void }> = ({ type, onClose }) => {
  if (type === 'interstitial') {
    const handleLanjutkan = () => {
      window.open('https://www.google.com/search?q=misteri+mistis+spiritual', '_blank');
      onClose?.();
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        style={{ zIndex: 100000 }} 
        className="fixed inset-0 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-6 pointer-events-auto"
      >
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose?.();
          }} 
          className="absolute top-10 right-10 text-white/90 hover:text-white p-6 z-[100050] bg-[#7F5AF0]/30 hover:bg-[#7F5AF0]/50 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-2xl active:scale-90 border border-white/20"
          aria-label="Tutup Iklan"
        >
          <X size={36} strokeWidth={3} />
        </button>

        <div 
          className="mystic-card w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative border-none pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#7F5AF0] p-3 text-[10px] font-bold text-center tracking-widest text-white uppercase font-poppins relative z-10">Pesan Mistis 2026</div>
          
          <div className="p-10 text-center space-y-8 relative z-20">
            <div className="w-28 h-28 bg-[#2D284D]/50 rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-lg shadow-[#7F5AF0]/20 animate-floating">🌟</div>
            
            <div className="space-y-4">
              <h3 className="text-3xl font-bold font-cinzel text-white tracking-wider glow-text uppercase">Pesan Gaib</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-poppins px-2">Lihat detail pesan mistis untuk menyingkap tabir masa depan Anda di tahun 2026.</p>
            </div>
            
            <button 
              onClick={handleLanjutkan} 
              className="w-full bg-gradient-to-r from-[#7F5AF0] to-[#6b48d1] py-5 rounded-2xl font-bold text-white shadow-xl shadow-[#7F5AF0]/40 transition-all uppercase tracking-widest text-xs font-poppins active:scale-95 pointer-events-auto z-[100001] cursor-pointer"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
  return (
    <div className="w-full h-24 mystic-card rounded-[1.5rem] flex items-center justify-center my-6 overflow-hidden relative group cursor-pointer border-none">
      <div className="absolute top-2 left-2 text-[8px] text-gray-600 font-bold uppercase tracking-widest">Sponsored 2026</div>
      <div className="text-gray-500 font-bold text-sm tracking-[0.3em] group-hover:text-[#7F5AF0] transition-colors uppercase font-cinzel">Misteri+ Premium</div>
    </div>
  );
};

// --- PAGES ---
const DetailPage = () => {
  const { selectedDream, setCurrentPage, toggleFavorite, favorites } = useAppContext();
  if (!selectedDream) return null;

  const isFavorite = favorites.includes(selectedDream.slug);
  const shareText = `Ternyata arti mimpiku tentang "${selectedDream.judul}" adalah: "${selectedDream.ringkasan}". Cek arti mimpimu di Misteri+ 🔮`;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="py-6 space-y-8">
      <button onClick={() => setCurrentPage(Page.HOME)} className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
        <ChevronRight size={16} className="rotate-180" /> Kembali
      </button>

      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F5AF0] bg-[#7F5AF0]/10 px-4 py-1.5 rounded-full border border-[#7F5AF0]/20">
            {selectedDream.kategori}
          </span>
          <div className="flex gap-3">
            <button onClick={() => toggleFavorite(selectedDream.slug)} className="p-3 bg-[#1A1A2E] rounded-2xl border border-white/5 hover:border-[#7F5AF0]/40 transition-all">
              <Heart size={20} className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'} />
            </button>
            <button className="p-3 bg-[#1A1A2E] rounded-2xl border border-white/5 text-gray-500">
              <Share2 size={20} />
            </button>
          </div>
        </div>
        <h1 className="text-4xl font-cinzel font-bold leading-tight text-white glow-text">{selectedDream.judul}</h1>
      </div>

      <div className="space-y-8">
        <div className="mystic-card p-8 rounded-[2.5rem] border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7F5AF0]"></div>
          <p className="text-gray-300 italic text-lg leading-relaxed font-poppins text-white">"{selectedDream.ringkasan}"</p>
        </div>

        <div className="grid gap-6">
          <div className="bg-[#2CB67D]/5 border border-[#2CB67D]/20 p-8 rounded-[2.5rem] space-y-4">
            <h4 className="text-[#2CB67D] font-bold flex items-center gap-3 text-xs uppercase tracking-widest">
              <Sparkles size={18} /> Dimensi Cahaya 2026
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed font-poppins">{selectedDream.tafsir_positif}</p>
          </div>

          <div className="bg-[#E53E3E]/5 border border-[#E53E3E]/20 p-8 rounded-[2.5rem] space-y-4">
            <h4 className="text-[#E53E3E] font-bold flex items-center gap-3 text-xs uppercase tracking-widest">
              <Moon size={18} /> Bayangan & Peringatan
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed font-poppins">{selectedDream.tafsir_negatif}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] p-10 rounded-[3rem] flex justify-between items-center shadow-2xl shadow-[#7F5AF0]/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h4 className="text-[10px] font-bold uppercase text-white/70 tracking-[0.3em] mb-2">Angka Keberuntungan</h4>
          <p className="text-4xl font-cinzel font-bold text-white tracking-[0.4em] glow-text">{selectedDream.angka}</p>
        </div>
        <div className="text-6xl animate-floating group-hover:scale-110 transition-transform">🔮</div>
      </div>

      <AdBanner type="banner" />
      <FloatingShareButton text={shareText} />
    </motion.div>
  );
};

const ZodiacPage = () => {
  const { setIsLoading } = useAppContext();
  const [selectedSign, setSelectedSign] = useState<ZodiacInfo | null>(null);
  const [reading, setReading] = useState<any>(null);

  const handleFetchFortune = async (sign: ZodiacInfo) => {
    setSelectedSign(sign);
    setIsLoading(true);
    const dbReading = await fetchZodiacFromDB(sign.nama);
    if (dbReading) {
      setReading(dbReading);
    } else {
      const result = await getZodiacFortune(sign.nama);
      if (result) {
        setReading(result);
        await saveZodiacToDB(sign.nama, result);
      }
    }
    setIsLoading(false);
  };

  const shareText = reading ? `Ramalan Zodiak ${selectedSign?.nama} hari ini: "${reading.umum}". Intip nasibmu di Misteri+ ✨` : "";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Horoskop <span className="text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">Bintang</span></h2>
        <p className="text-sm text-gray-500 font-poppins px-6">Garis langit yang menentukan langkah Anda hari ini di tahun 2026.</p>
      </header>

      {!reading ? (
        <div className="grid grid-cols-3 gap-4">
          {ZODIAC_LIST.map((z) => (
            <button 
              key={z.nama} 
              onClick={() => handleFetchFortune(z)}
              className="mystic-card p-6 rounded-[2rem] flex flex-col items-center gap-3 border-none hover:bg-[#7F5AF0]/10 transition-all group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform">{z.icon}</span>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase text-white tracking-widest">{z.nama}</p>
                <p className="text-[7px] text-gray-500 uppercase mt-1">{z.tanggal}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
          <div className="text-center space-y-6">
             <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#7F5AF0] rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-2xl border-2 border-white/10">
               {selectedSign?.icon}
             </div>
             <h3 className="text-3xl font-cinzel font-bold text-white uppercase tracking-[0.2em]">{selectedSign?.nama}</h3>
          </div>

          <div className="grid gap-6">
            <div className="mystic-card p-8 rounded-[2.5rem] border-none relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FFD700]"></div>
              <h4 className="text-[9px] font-bold uppercase text-gray-600 tracking-widest mb-4">Ramalan 2026</h4>
              <p className="text-white font-poppins leading-relaxed">{reading.umum}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="mystic-card p-6 rounded-[2rem] border-none space-y-3">
                 <h4 className="text-[9px] font-bold uppercase text-[#E53E3E] flex items-center gap-2"><Heart size={14}/> Cinta</h4>
                 <p className="text-[11px] text-gray-300 leading-relaxed">{reading.cinta}</p>
               </div>
               <div className="mystic-card p-6 rounded-[2rem] border-none space-y-3">
                 <h4 className="text-[9px] font-bold uppercase text-[#2CB67D] flex items-center gap-2"><Briefcase size={14}/> Karir</h4>
                 <p className="text-[11px] text-gray-300 leading-relaxed">{reading.karir}</p>
               </div>
            </div>

            <div className="mystic-card bg-[#FFD700]/5 p-8 rounded-[2.5rem] border-none flex justify-between items-center">
              <div>
                <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-1">Warna Keberuntungan</h4>
                <p className="text-white font-bold">{reading.warna_hoki}</p>
              </div>
              <div className="text-right">
                <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-1">Angka Hoki</h4>
                <p className="text-[#FFD700] font-cinzel font-bold text-xl">{reading.angka_hoki}</p>
              </div>
            </div>
          </div>

          <button onClick={() => { setReading(null); setSelectedSign(null); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all">Pilih Zodiak Lain</button>
          <FloatingShareButton text={shareText} />
        </motion.div>
      )}
    </motion.div>
  );
};

const CommentPage = () => {
  const { setIsLoading, latestComments, refreshComments } = useAppContext();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsLoading(true);
    const res = await saveComment(name, message);
    if (res.status === 'success') {
      setStatus({ type: 'success', msg: 'Masukan Anda telah kami terima dengan energi positif.' });
      setName('');
      setMessage('');
      refreshComments();
    } else {
      setStatus({ type: 'error', msg: 'Maaf, energi sedang terputus. Coba lagi nanti.' });
    }
    setIsLoading(false);
    setTimeout(() => setStatus(null), 5000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-10">
       <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Ruang <span className="text-[#A78BFA] drop-shadow-[0_0_10px_rgba(167,139,250,0.4)]">Diskusi</span></h2>
        <p className="text-sm text-gray-500 font-poppins px-6">Berikan saran atau masukan untuk pengembangan dimensi Misteri+ di tahun 2026.</p>
      </header>

      <section className="mystic-card p-8 rounded-[3rem] border-none shadow-2xl">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Nama Anda</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Ki Ageng"
                  className="w-full oracle-input rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:outline-none placeholder:text-gray-700"
                />
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Saran / Masukan</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan pesan mistis Anda di sini..."
                rows={4}
                className="w-full oracle-input rounded-2xl py-4 px-6 text-white text-sm focus:outline-none placeholder:text-gray-700 resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={!name.trim() || !message.trim()}
              className="w-full bg-[#7F5AF0] hover:bg-[#6b48d1] disabled:opacity-50 py-4 rounded-2xl font-bold text-white shadow-xl shadow-[#7F5AF0]/20 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
            >
              <Send size={18} /> Kirim Pesan
            </button>
         </form>

         {status && (
           <motion.p 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }} 
             className={`mt-6 text-center text-xs font-bold ${status.type === 'success' ? 'text-[#2CB67D]' : 'text-[#E53E3E]'}`}
           >
             {status.msg}
           </motion.p>
         )}
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-cinzel font-bold tracking-widest uppercase border-b border-white/5 pb-4">Suara Pengguna Terbaru</h3>
        <div className="space-y-4">
          {latestComments.length > 0 ? latestComments.map((c) => (
             <div key={c.id} className="bg-[#1A1A2E]/40 border border-white/5 p-6 rounded-3xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#7F5AF0]">{c.name}</span>
                  <span className="text-[9px] text-gray-600 uppercase tracking-tighter">
                    {new Date(c.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed italic">"{c.message}"</p>
             </div>
          )) : (
            <div className="text-center py-10 opacity-30">Belum ada jejak suara di dimensi ini.</div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

const TarotPage = () => {
  const { setIsLoading } = useAppContext();
  const [question, setQuestion] = useState('');
  const [selectedCard, setSelectedCard] = useState<typeof MAJOR_ARCANA[0] | null>(null);
  const [reading, setReading] = useState<any>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleDrawCard = async () => {
    setIsFlipping(true);
    setIsLoading(true);
    const randomCard = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
    setSelectedCard(randomCard);
    const cached = await fetchTarotFromDB(question, randomCard.name);
    if (cached) {
      setReading(cached);
    } else {
      const result = await getTarotReading(randomCard.name, question);
      if (result) {
        setReading(result);
        await saveTarotToDB(question, randomCard.name, result);
      }
    }
    setTimeout(() => {
      setIsFlipping(false);
      setIsLoading(false);
    }, 1200);
  };

  const shareText = reading ? `Aku mencabut kartu Tarot ${selectedCard?.name}. Nasihat Oracle: "${reading.nasihat}". Tanya Oracle di Misteri+ 🃏` : "";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Oracle <span className="text-[#A78BFA] drop-shadow-[0_0_10px_rgba(167,139,250,0.4)]">Tarot</span></h2>
        <p className="text-sm text-gray-500 font-poppins px-6">Konsultasikan takdir Anda melalui simbol kuno Major Arcana untuk tahun 2026.</p>
      </header>

      {!reading ? (
        <section className="space-y-10">
          <div className="mystic-card p-8 rounded-[3rem] border-none shadow-2xl">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-2">Apa yang ingin Anda ketahui?</label>
              <textarea 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Tuliskan pertanyaan Anda (opsional)..."
                rows={3}
                className="w-full oracle-input rounded-2xl py-4 px-6 text-white text-sm focus:outline-none placeholder:text-gray-700 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="relative w-48 h-72 perspective-1000">
              <motion.div 
                animate={isFlipping ? { rotateY: 180 } : { rotateY: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-full h-full relative preserve-3d"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] border-4 border-[#7F5AF0]/30 rounded-[2rem] flex items-center justify-center backface-hidden shadow-2xl">
                   <div className="w-full h-full p-4 flex flex-col items-center justify-center gap-4 opacity-40">
                      <div className="w-16 h-16 border-2 border-[#7F5AF0] rounded-full flex items-center justify-center">
                        <Moon size={32} className="text-[#7F5AF0]"/>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[...Array(4)].map((_, i) => <div key={i} className="w-2 h-2 bg-[#7F5AF0] rounded-full"></div>)}
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
            
            <button 
              onClick={handleDrawCard}
              className="w-full max-w-xs bg-gradient-to-r from-[#7F5AF0] to-[#6b48d1] py-5 rounded-[2.5rem] font-bold text-white shadow-xl shadow-[#7F5AF0]/20 transition-all uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center justify-center gap-4"
            >
              <Sparkles size={20} /> Ambil Satu Kartu
            </button>
          </div>
        </section>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
          <div className="text-center space-y-8">
             <motion.div 
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.8 }}
              className="w-56 h-80 mx-auto bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] border-4 border-[#A78BFA] rounded-[3rem] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(167,139,250,0.3)] relative overflow-hidden"
             >
                <div className="absolute inset-0 bg-gradient-to-t from-[#A78BFA]/10 to-transparent"></div>
                <span className="text-8xl mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{selectedCard?.icon}</span>
                <span className="text-2xl font-cinzel font-bold text-white uppercase tracking-widest text-center px-4">{selectedCard?.name}</span>
             </motion.div>
             <h3 className="text-sm font-bold text-[#A78BFA] uppercase tracking-[0.4em]">Wahyu Terbuka</h3>
          </div>

          <div className="grid gap-8">
            <div className="mystic-card p-10 rounded-[3.5rem] relative border-none">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#A78BFA] to-transparent rounded-full"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 mb-6">Manifestasi 2026</h4>
              <p className="text-gray-200 leading-relaxed font-poppins italic text-lg text-white">"{reading.makna_umum}"</p>
            </div>

            <div className="mystic-card bg-[#A78BFA]/5 p-10 rounded-[3rem] border-none space-y-4">
               <h4 className="text-[10px] font-bold uppercase text-[#A78BFA] tracking-[0.3em] flex items-center gap-3"><Compass size={18}/> Dimensi Spiritual</h4>
               <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.spiritual}</p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-[#2CB67D] tracking-[0.3em] flex items-center gap-3"><Briefcase size={18}/> Karir</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.karir}</p>
              </div>
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-[#E53E3E] tracking-[0.3em] flex items-center gap-3"><Heart size={18}/> Asmara</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.asmara}</p>
              </div>
            </div>

            <div className="mystic-card bg-white/5 p-12 rounded-[4rem] space-y-6 border-none shadow-2xl">
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-4">
                <Star size={22} className="text-yellow-500" /> Nasihat Oracle
              </h4>
              <p className="text-xl text-gray-200 font-poppins leading-relaxed italic">"{reading.nasihat}"</p>
            </div>
          </div>

          <button onClick={() => { setReading(null); setQuestion(''); setSelectedCard(null); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all">Tanya Oracle Lagi</button>
          <FloatingShareButton text={shareText} />
        </motion.div>
      )}
      <AdBanner type="banner" />
    </motion.div>
  );
};

const CompatibilityPage = () => {
  const { setIsLoading } = useAppContext();
  const [name1, setName1] = useState('');
  const [dob1, setDob1] = useState('');
  const [name2, setName2] = useState('');
  const [dob2, setDob2] = useState('');
  const [reading, setReading] = useState<any>(null);

  const handleCalculate = async () => {
    if (!name1 || !dob1 || !name2 || !dob2) return;
    setIsLoading(true);
    const dbReading = await fetchCompatibilityFromDB(name1, dob1, name2, dob2);
    if (dbReading) {
      setReading(dbReading);
    } else {
      const result = await getPartnerCompatibility(name1, dob1, name2, dob2);
      if (result) {
        setReading(result);
        await saveCompatibilityToDB(name1, dob1, name2, dob2, result.skor, result);
      }
    }
    setIsLoading(false);
  };

  const shareText = reading ? `Kecocokanku dengan ${name2} adalah ${reading.skor}%. Kami adalah "${reading.sebutan}". Cek jodohmu di Misteri+ ❤️` : "";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Harmoni <span className="text-[#F472B6] drop-shadow-[0_0_10px_rgba(244,114,182,0.4)]">Jiwa</span></h2>
        <p className="text-sm text-gray-500 font-poppins px-6">Analisis kecocokan pasangan untuk tahun 2026.</p>
      </header>

      {!reading ? (
        <section className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="mystic-card p-8 rounded-[3rem] border-none shadow-2xl space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><User size={80}/></div>
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#F472B6]">Sisi Pertama</h4>
               <div className="space-y-4">
                  <input type="text" value={name1} onChange={(e) => setName1(e.target.value)} placeholder="Nama Kamu" className="w-full oracle-input rounded-2xl py-4 px-6 text-white text-sm focus:outline-none placeholder:text-gray-700" />
                  <input type="date" value={dob1} onChange={(e) => setDob1(e.target.value)} className="w-full oracle-input rounded-2xl py-4 px-6 text-[#F472B6] focus:outline-none text-sm" />
               </div>
            </div>
            <div className="flex justify-center -my-3 relative z-10">
               <div className="bg-[#1A1A2E] p-3 rounded-full border border-white/5 shadow-xl">
                 <Heart size={24} className="text-[#F472B6] fill-[#F472B6]/20 animate-pulse" />
               </div>
            </div>
            <div className="mystic-card p-8 rounded-[3rem] border-none shadow-2xl space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5"><Users size={80}/></div>
               <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Sisi Pasangan</h4>
               <div className="space-y-4">
                  <input type="text" value={name2} onChange={(e) => setName2(e.target.value)} placeholder="Nama Pasangan" className="w-full oracle-input rounded-2xl py-4 px-6 text-white text-sm focus:outline-none placeholder:text-gray-700" />
                  <input type="date" value={dob2} onChange={(e) => setDob2(e.target.value)} className="w-full oracle-input rounded-2xl py-4 px-6 text-gray-400 focus:outline-none text-sm" />
               </div>
            </div>
          </div>
          <button onClick={handleCalculate} disabled={!name1 || !dob1 || !name2 || !dob2} className="w-full bg-gradient-to-r from-[#F472B6] to-[#DB2777] py-6 rounded-[2.5rem] font-bold text-white shadow-xl shadow-[#F472B6]/20 transition-all uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center justify-center gap-4">
            <Sparkles size={20} /> Cek Kecocokan
          </button>
        </section>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
          <div className="text-center space-y-8">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-[#F472B6] blur-[100px] opacity-25 animate-pulse"></div>
               <div className="relative w-48 h-48 bg-gradient-to-br from-[#F472B6] to-[#1A1A2E] rounded-full flex flex-col items-center justify-center border-4 border-[#F472B6]/30 shadow-2xl">
                 <span className="text-5xl font-cinzel font-bold text-white tracking-widest glow-text">{reading.skor}%</span>
                 <span className="text-[10px] text-white/90 font-bold uppercase tracking-[0.2em] mt-2">Kecocokan</span>
               </div>
            </div>
            <h3 className="text-2xl font-cinzel font-bold text-white uppercase tracking-[0.2em]">{reading.sebutan}</h3>
          </div>
          <div className="grid gap-8">
            <div className="mystic-card p-10 rounded-[3.5rem] relative border-none">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#F472B6] to-transparent rounded-full"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 mb-6">Dinamika Elemen</h4>
              <p className="text-gray-200 leading-relaxed font-poppins italic text-lg text-white">"{reading.dinamika_elemen}"</p>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none bg-green-500/5">
                <h4 className="text-[10px] font-bold uppercase text-[#2CB67D] tracking-[0.3em] flex items-center gap-3"><Sparkles size={18}/> Kelebihan</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.kelebihan}</p>
              </div>
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none bg-red-500/5">
                <h4 className="text-[10px] font-bold uppercase text-[#E53E3E] tracking-[0.3em] flex items-center gap-3"><X size={18}/> Tantangan</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.tantangan}</p>
              </div>
            </div>
            <div className="mystic-card bg-white/5 p-12 rounded-[4rem] space-y-6 border-none shadow-2xl">
              <h4 className="text-[#F472B6] text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-4"><Moon size={22} /> Prediksi 2026</h4>
              <p className="text-lg text-gray-200 font-poppins leading-relaxed">"{reading.analisis_2026}"</p>
            </div>
          </div>
          <button onClick={() => { setReading(null); setName1(''); setName2(''); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all">Coba Pasangan Lain</button>
          <FloatingShareButton text={shareText} />
        </motion.div>
      )}
      <AdBanner type="banner" />
    </motion.div>
  );
};

const HomePage = () => {
  const { setCurrentPage, setSelectedDream, setShowInterstitial, setIsLoading, trendingDreams, refreshTrending, latestComments } = useAppContext();
  const [searchInput, setSearchInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      inputRef.current?.focus();
      return;
    }
    setIsLoading(true);
    try {
      const dbResults = await fetchFromDB(searchInput);
      if (dbResults && dbResults.length > 0) {
          const found = dbResults[0];
          setSelectedDream(found);
          saveMimpiToDB(found); 
          setShowInterstitial(true);
          setCurrentPage(Page.DETAIL);
          setIsLoading(false);
          return;
      }
      const result = await getAIInterpretation(searchInput);
      if (result) {
          const dreamData = { ...result, view_count: 1 };
          setSelectedDream(dreamData);
          await saveMimpiToDB(dreamData);
          refreshTrending();
          setShowInterstitial(true);
          setCurrentPage(Page.DETAIL);
      }
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="py-6 space-y-12">
      <section className="space-y-10 text-center pt-8">
        <h2 className="text-5xl font-cinzel font-bold leading-[1.1] text-white">Pesan <br/><span className="text-[#7F5AF0] glow-text">Semesta</span></h2>
        <div className="relative group max-w-lg mx-auto">
          <input ref={inputRef} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Apa mimpimu?" className="w-full oracle-input rounded-full py-6 pl-14 pr-16 text-white text-lg transition-all" />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={24} />
          <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#7F5AF0] rounded-full text-white"><ChevronRight size={20} /></button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3 px-1">
        {[
          { label: 'Tafsir', id: Page.HOME, icon: <Moon size={16} />, color: '#7F5AF0' }, 
          { label: 'Jodoh', id: Page.COMPATIBILITY, icon: <Heart size={16} />, color: '#F472B6' }, 
          { label: 'Zodiak', id: Page.ZODIAC, icon: <Sparkles size={16} />, color: '#FFD700' }, 
          { label: 'Numerik', id: Page.NUMEROLOGY, icon: <Zap size={16} />, color: '#2CB67D' }, 
          { label: 'Tarot', id: Page.TAROT, icon: <Compass size={16} />, color: '#A78BFA' },
          { label: 'P. Jawa', id: Page.JAVA_HOROSCOPE, icon: <Sun size={16} />, color: '#FF7E33' },
          { label: 'Shio', id: Page.CHINESE_ZODIAC, icon: <Crown size={16} />, color: '#E53E3E' },
          { label: 'P. Sunda', id: Page.SUNDANESE_PRIMBON, icon: <Trees size={16} />, color: '#14B8A6' }
        ].map(cat => (
          <button key={cat.label} onClick={() => setCurrentPage(cat.id)} className="flex flex-col items-center gap-1.5 group">
            <div className="w-10 h-10 bg-[#1A1A2E]/50 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-[#7F5AF0] transition-all"><span style={{ color: cat.color }}>{cat.icon}</span></div>
            <span className="text-[6.5px] font-bold uppercase text-gray-500 tracking-widest">{cat.label}</span>
          </button>
        ))}
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-cinzel font-bold tracking-wider uppercase flex items-center gap-3 text-white"><Flame size={20} className="text-[#7F5AF0]" /> Hits</h3>
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 pt-6 px-4 snap-x">
          {trendingDreams.map(dream => (
            <div key={dream.slug} onClick={() => { setSelectedDream(dream); setShowInterstitial(true); setCurrentPage(Page.DETAIL); }} className="flex-shrink-0 w-56 mystic-card p-6 rounded-[2.5rem] space-y-5 cursor-pointer snap-center border-none">
              <div className="w-12 h-12 bg-[#7F5AF0]/10 rounded-2xl flex items-center justify-center text-[#7F5AF0]"><Sparkles size={22} /></div>
              <p className="font-bold text-lg leading-tight h-14 line-clamp-2 font-poppins text-white">{dream.judul}</p>
              <p className="text-[10px] text-[#7F5AF0] font-bold uppercase tracking-widest">{dream.kategori}</p>
            </div>
          ))}
        </div>
      </section>
      <AdBanner type="banner" />
    </motion.div>
  );
};

// ... Halaman Lain (Primbon, Numerologi, Shio, dll) diimplementasikan dengan getAI... yang sudah direfactor ...

const ChineseZodiacPage = () => {
  const { setIsLoading } = useAppContext();
  const [dob, setDob] = useState('');
  const [reading, setReading] = useState<any>(null);
  const handleCalculate = async () => {
    if (!dob) return;
    setIsLoading(true);
    const dbReading = await fetchChineseZodiacFromDB(dob);
    if (dbReading) setReading(dbReading);
    else {
      const result = await getChineseZodiacReading(dob);
      if (result) { setReading(result); await saveChineseZodiacToDB(dob, result); }
    }
    setIsLoading(false);
  };
  const shareText = reading ? `Shio: ${reading.shio}. Nasib 2026: "${reading.keberuntungan_2026}". Cek di Misteri+ 🐉` : "";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold text-white">Primbon <span className="text-[#E53E3E]">China</span></h2>
      </header>
      {!reading ? (
        <section className="mystic-card p-12 rounded-[4rem] space-y-10 border-none">
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#0F0F1A] border border-[#E53E3E]/30 rounded-[2rem] py-7 px-8 text-[#E53E3E] text-center text-2xl" />
          <button onClick={handleCalculate} className="w-full bg-[#E53E3E] py-6 rounded-[2.5rem] font-bold text-white uppercase tracking-widest">Singkap Takdir Shio</button>
        </section>
      ) : (
        <div className="space-y-12">
          <div className="text-center">
            <span className="text-7xl block mb-4">{reading.icon}</span>
            <span className="text-3xl font-cinzel font-bold text-white uppercase tracking-widest">Shio {reading.shio}</span>
          </div>
          <div className="grid gap-8">
            <div className="mystic-card p-10 rounded-[3.5rem] border-none"><p className="text-gray-200 italic text-lg text-white">"{reading.karakter}"</p></div>
            <div className="mystic-card bg-[#E53E3E]/5 p-12 rounded-[4rem] space-y-6 border-none"><h4 className="text-[#E53E3E] text-xs font-bold uppercase tracking-widest">Nasib 2026</h4><p className="text-xl text-gray-200 italic text-white">"{reading.keberuntungan_2026}"</p></div>
          </div>
          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest text-gray-600">Hitung Ulang</button>
          <FloatingShareButton text={shareText} />
        </div>
      )}
    </motion.div>
  );
};

const SundanesePrimbonPage = () => {
  const { setIsLoading } = useAppContext();
  const [dob, setDob] = useState('');
  const [reading, setReading] = useState<any>(null);
  const handleCalculate = async () => {
    if (!dob) return;
    setIsLoading(true);
    const dbReading = await fetchSundaFromDB(dob);
    if (dbReading) setReading(dbReading);
    else {
      const result = await getSundanesePrimbonReading(dob);
      if (result) { setReading(result); await saveSundaToDB(dob, result); }
    }
    setIsLoading(false);
  };
  const shareText = reading ? `Wedalku: ${reading.wedal}. Nasihat: "${reading.nasihat}". Cek di Misteri+ 🌳` : "";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold text-white">Primbon <span className="text-[#14B8A6]">Sunda</span></h2>
      </header>
      {!reading ? (
        <section className="mystic-card p-12 rounded-[4rem] space-y-10 border-none">
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#0F0F1A] border border-[#14B8A6]/30 rounded-[2rem] py-7 px-8 text-[#14B8A6] text-center text-2xl" />
          <button onClick={handleCalculate} className="w-full bg-[#14B8A6] py-6 rounded-[2.5rem] font-bold text-white uppercase tracking-widest">Singkap Paririmbon</button>
        </section>
      ) : (
        <div className="space-y-12 text-white">
          <div className="text-center"><span className="text-3xl font-cinzel font-bold text-white uppercase tracking-widest">Wedal: {reading.wedal}</span></div>
          <div className="mystic-card p-12 rounded-[3.5rem] border-none"><h4 className="text-[10px] font-bold uppercase text-gray-600 mb-6">Watak Dasar</h4><p className="text-gray-200 text-xl italic">"{reading.watak}"</p></div>
          <div className="mystic-card bg-white/5 p-12 rounded-[4rem] space-y-6 border-none shadow-2xl"><h4 className="text-[#14B8A6] text-xs font-bold uppercase tracking-widest">Piwuruk 2026</h4><p className="text-xl text-gray-200 italic">"{reading.nasihat}"</p></div>
          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase text-gray-600">Coba Kala Lain</button>
          <FloatingShareButton text={shareText} />
        </div>
      )}
    </motion.div>
  );
};

const NumerologyPage = () => {
  const { setIsLoading } = useAppContext();
  const [dob, setDob] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [lifePath, setLifePath] = useState<number | null>(null);
  const handleCalculate = async () => {
    if (!dob) return;
    setIsLoading(true);
    const digits = dob.replace(/\D/g, '');
    let sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
    }
    setLifePath(sum);
    const dbReading = await fetchNumerologyFromDB(dob);
    if (dbReading) setReading(dbReading);
    else {
      const result = await getNumerologyReading(sum, dob);
      if (result) { setReading(result); await saveNumerologyToDB(dob, sum, result); }
    }
    setIsLoading(false);
  };
  const shareText = reading ? `Life Path-ku ${lifePath}. Saran: "${reading.saran}". Cek di Misteri+ 🔢` : "";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center"><h2 className="text-4xl font-cinzel font-bold text-white">Takdir <span className="text-[#2CB67D]">Numerik</span></h2></header>
      {!reading ? (
        <section className="mystic-card p-12 rounded-[4rem] space-y-10 border-none"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#0F0F1A] border border-[#7F5AF0]/30 rounded-[2rem] py-7 px-8 text-[#A78BFA] text-center text-2xl" /><button onClick={handleCalculate} className="w-full bg-[#2CB67D] py-6 rounded-[2.5rem] font-bold text-white uppercase tracking-widest">Hitung Angka Takdir</button></section>
      ) : (
        <div className="space-y-12">
          <div className="text-center"><span className="text-7xl font-cinzel font-bold text-white tracking-widest">{lifePath}</span><p className="text-xs uppercase text-gray-500">Life Path Number</p></div>
          <div className="mystic-card p-12 rounded-[3.5rem] border-none"><h4 className="text-[10px] font-bold uppercase text-gray-600 mb-6">Kepribadian Utama</h4><p className="text-gray-200 italic text-xl text-white">"{reading.kepribadian}"</p></div>
          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase text-gray-600">Hitung Ulang</button>
          <FloatingShareButton text={shareText} />
        </div>
      )}
    </motion.div>
  );
};

const JavaHoroscopePage = () => {
  const { setIsLoading } = useAppContext();
  const [dob, setDob] = useState('');
  const [reading, setReading] = useState<any>(null);
  const handleCalculate = async () => {
    if (!dob) return;
    setIsLoading(true);
    const dbReading = await fetchPrimbonFromDB(dob);
    if (dbReading) setReading(dbReading);
    else {
      const result = await getPrimbonReading(dob);
      if (result) { setReading(result); await savePrimbonToDB(dob, result.weton, result.neptu, result); }
    }
    setIsLoading(false);
  };
  const shareText = reading ? `Weton: ${reading.weton}. Watak: "${reading.watak}". Cek di Misteri+ ☀️` : "";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center"><h2 className="text-4xl font-cinzel font-bold text-white">Primbon <span className="text-[#FF7E33]">Jawa</span></h2></header>
      {!reading ? (
        <section className="mystic-card p-12 rounded-[4rem] space-y-10 border-none"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-[#0F0F1A] border border-[#7F5AF0]/30 rounded-[2rem] py-7 px-8 text-[#A78BFA] text-center text-2xl" /><button onClick={handleCalculate} className="w-full bg-[#FF7E33] py-6 rounded-[2.5rem] font-bold text-white uppercase tracking-widest">Singkap Weton</button></section>
      ) : (
        <div className="space-y-12">
          <div className="text-center"><span className="text-4xl font-cinzel font-bold text-white tracking-widest">{reading.weton}</span><p className="text-xs uppercase text-gray-500">Neptu: {reading.neptu}</p></div>
          <div className="mystic-card p-12 rounded-[3.5rem] border-none text-white"><h4 className="text-[10px] font-bold uppercase text-gray-600 mb-6">Watak Bawaan</h4><p className="text-gray-200 italic text-xl">"{reading.watak}"</p></div>
          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase text-gray-600">Coba Kala Lain</button>
          <FloatingShareButton text={shareText} />
        </div>
      )}
    </motion.div>
  );
};

// --- LAYOUT & MAIN ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPage, setCurrentPage } = useAppContext();
  const runes = ['ꦀ', 'ꦁ', 'ꦂ', 'ꦃ', 'ꦄ', 'ꦅ', 'ꦆ', 'ꦇ', 'ꦈ', 'ꦉ', 'ꦊ', 'ꦋ', 'ꦌ', 'ꦍ', 'ꦎ'];
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#0F0F1A] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.08]">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="mystic-rune" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, fontSize: `${25 + Math.random() * 70}px`, animationDelay: `${Math.random() * 12}s`, animationDuration: `${18 + Math.random() * 25}s` }}>
            {runes[Math.floor(Math.random() * runes.length)]}
          </div>
        ))}
      </div>
      <header className="px-8 py-7 flex items-center justify-between sticky top-0 z-40 bg-[#0F0F1A]/85 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentPage(Page.HOME)}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] rounded-2xl flex items-center justify-center shadow-xl"><Moon size={26} className="text-white" /></div>
          <h1 className="font-cinzel text-2xl font-bold tracking-[0.4em] uppercase">Misteri<span className="text-[#7F5AF0]">+</span></h1>
        </div>
        <button onClick={() => setCurrentPage(Page.NUMEROLOGY)} className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 bg-[#1A1A2E]/60"><Zap size={24} className="text-[#7F5AF0]" /></button>
      </header>
      <main className="flex-1 px-6 pb-40">{children}</main>
    </div>
  );
};

const PremiumBottomNav = () => {
  const { currentPage, setCurrentPage } = useAppContext();
  const navItems = [{ id: Page.HOME, icon: Moon, label: 'Ritual' }, { id: Page.TRENDING, icon: TrendingUp, label: 'Trens' }, { id: Page.FAVORITE, icon: Heart, label: 'Fav' }, { id: Page.COMMENT, icon: MessageSquare, label: 'Komen' }];
  return (
    <div className="fixed bottom-8 inset-x-0 flex justify-center z-[9000] pointer-events-none">
      <nav className="mystic-card w-[94%] max-w-[440px] pointer-events-auto h-[88px] flex items-center justify-around bg-[#1A1A2E]/80 backdrop-blur-3xl border-white/10 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} className="relative flex flex-col items-center justify-center w-20 group">
              {isActive && <motion.div layoutId="active-pill" className="absolute inset-x-1 inset-y-2 bg-[#7F5AF0]/15 rounded-2xl" />}
              <div className={`relative z-10 flex flex-col items-center transition-all ${isActive ? "text-[#7F5AF0] scale-110" : "text-gray-400"}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] font-bold tracking-widest mt-2 uppercase">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

const AppContent = () => {
  const { currentPage, isLoading, showInterstitial, setShowInterstitial } = useAppContext();
  const loadingMessages = ["Menyambung dimensi...", "Membaca garis waktu...", "Memanggil energi leluhur...", "Menerjemahkan tabir..."];
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => setMsgIdx(p => (p + 1) % loadingMessages.length), 2200);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME: return <HomePage />;
      case Page.DETAIL: return <DetailPage />;
      case Page.ZODIAC: return <ZodiacPage />;
      case Page.NUMEROLOGY: return <NumerologyPage />;
      case Page.JAVA_HOROSCOPE: return <JavaHoroscopePage />;
      case Page.CHINESE_ZODIAC: return <ChineseZodiacPage />;
      case Page.SUNDANESE_PRIMBON: return <SundanesePrimbonPage />;
      case Page.COMMENT: return <CommentPage />;
      case Page.TAROT: return <TarotPage />;
      case Page.COMPATIBILITY: return <CompatibilityPage />;
      case Page.TRENDING: return <div className="py-6 text-center text-gray-500">Halaman Trens sedang ritual...</div>;
      default: return <HomePage />;
    }
  };

  return (
    <>
      <Layout>
        {isLoading && (
          <div className="fixed inset-0 bg-[#050508]/98 backdrop-blur-2xl flex flex-col items-center justify-center z-[80000]">
            <div className="relative"><div className="w-40 h-40 border-t-[#7F5AF0] border rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center text-5xl">✨</div></div>
            <p className="font-cinzel text-2xl tracking-widest text-[#7F5AF0] mt-16 animate-pulse uppercase">{loadingMessages[msgIdx]}</p>
          </div>
        )}
        <AnimatePresence mode="wait"><motion.div key={currentPage} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }}>{renderPage()}</motion.div></AnimatePresence>
      </Layout>
      <PremiumBottomNav />
      {showInterstitial && <AdBanner type="interstitial" onClose={() => setShowInterstitial(false)} />}
    </>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<React.StrictMode><AppProvider><AppContent /></AppProvider></React.StrictMode>);
}