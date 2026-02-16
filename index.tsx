
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
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES & ENUMS ---
export enum Page {
  HOME = 'home',
  DETAIL = 'detail',
  ZODIAC = 'zodiac',
  NUMEROLOGY = 'numerology',
  TRENDING = 'trending',
  FAVORITE = 'favorite',
  JAVA_HOROSCOPE = 'java_horoscope'
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

// --- API INITIALIZATION ---
const getApiKeyFromEnv = (): string => {
  const win = window as any;
  return win['process']?.['env']?.['API_KEY'] || '';
};

const ai = new GoogleGenAI({ apiKey: getApiKeyFromEnv() });
const PROD_API_URL = 'https://www.misteri.faciltrix.com/api'; 
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost/misteri-api' : PROD_API_URL; 

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

// --- AI GENERATORS ---
const getAIInterpretation = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan tafsir mimpi untuk: "${userPrompt}". Bahasa: Indonesia. Nuansa: Mistis, Bijak, Berwibawa. Sertakan 3 angka mistis keberuntungan.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judul: { type: Type.STRING },
            ringkasan: { type: Type.STRING },
            tafsir_positif: { type: Type.STRING },
            tafsir_negatif: { type: Type.STRING },
            angka: { type: Type.STRING },
            kategori: { type: Type.STRING }
          },
          required: ["judul", "ringkasan", "tafsir_positif", "tafsir_negatif", "angka", "kategori"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

const getZodiacFortune = async (zodiac: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan ramalan harian untuk zodiak ${zodiac}. Hari ini: ${new Date().toLocaleDateString('id-ID')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            umum: { type: Type.STRING },
            cinta: { type: Type.STRING },
            karir: { type: Type.STRING },
            keuangan: { type: Type.STRING },
            warna_hoki: { type: Type.STRING },
            angka_hoki: { type: Type.STRING }
          },
          required: ["umum", "cinta", "karir", "keuangan", "warna_hoki", "angka_hoki"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};

const getNumerologyReading = async (number: number, dob: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan pembacaan numerologi untuk Angka Jalur Hidup (Life Path Number) ${number} berdasarkan tanggal lahir ${dob}. Nuansa: Mistis dan mendalam.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kepribadian: { type: Type.STRING },
            karir: { type: Type.STRING },
            asmara: { type: Type.STRING },
            saran: { type: Type.STRING },
            batu_permata: { type: Type.STRING }
          },
          required: ["kepribadian", "karir", "asmara", "saran", "batu_permata"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};

const getPrimbonReading = async (dob: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan ramalan Primbon Jawa lengkap untuk tanggal lahir ${dob}. 
      Tugas spesifik:
      1. Hitung Weton (Hari + Pasaran).
      2. Hitung Nilai Neptu.
      3. Berikan makna filosofis hari tersebut (misal: Senin adalah Bunga, Selasa adalah Api, Rabu adalah Daun, Kamis adalah Angin, Jumat adalah Air, Sabtu adalah Tanah, Minggu adalah Mega/Langit).
      4. Berikan ramalan Watak, Keberuntungan, Rejeki.
      5. Berikan daftar Pekerjaan yang cocok, Jodoh yang cocok, Warna keberuntungan, dan Hari Baik.
      6. Berikan daftar Jenis Bisnis yang cocok untuk weton ini.
      
      Bahasa: Indonesia. Nuansa: Tradisional, Mistis, Berwibawa.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weton: { type: Type.STRING },
            neptu: { type: Type.NUMBER },
            makna_hari: { type: Type.STRING, description: 'Makna filosofis hari tersebut (misal: "Kamis adalah Angin, wataknya pemberi")' },
            watak: { type: Type.STRING },
            keberuntungan: { type: Type.STRING },
            rejeki: { type: Type.STRING },
            pekerjaan: { type: Type.STRING, description: 'Daftar pekerjaan yang cocok' },
            bisnis: { type: Type.STRING, description: 'Jenis bisnis atau wirausaha yang cocok' },
            jodoh: { type: Type.STRING, description: 'Kriteria atau weton jodoh yang cocok' },
            warna: { type: Type.STRING, description: 'Warna keberuntungan' },
            hari_baik: { type: Type.STRING, description: 'Hari-hari baik untuk memulai hajat' },
            saran: { type: Type.STRING }
          },
          required: ["weton", "neptu", "makna_hari", "watak", "keberuntungan", "rejeki", "pekerjaan", "bisnis", "jodoh", "warna", "hari_baik", "saran"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Primbon AI Error:", error);
    return null;
  }
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [trendingDreams, setTrendingDreams] = useState<Dream[]>([]);

  const refreshTrending = async () => {
    const data = await fetchFromDB();
    if (data) setTrendingDreams(data);
  };

  useEffect(() => {
    refreshTrending();
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
      trendingDreams, refreshTrending
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// --- UI COMPONENTS ---
const AdBanner: React.FC<{ type: 'banner' | 'interstitial', onClose?: () => void }> = ({ type, onClose }) => {
  if (type === 'interstitial') {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
      >
        <div className="bg-[#1A1A2E] w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl border border-[#7F5AF0]/30 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2"><X size={20} /></button>
          <div className="bg-[#7F5AF0] p-2 text-[10px] font-bold text-center tracking-widest text-white uppercase font-poppins">Rekomendasi Mistis</div>
          <div className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-[#2D284D] rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-lg shadow-[#7F5AF0]/20">🌟</div>
            <h3 className="text-2xl font-bold font-cinzel text-white tracking-wider">PREMIUM ACCESS</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-poppins">Buka kunci ramalan harian dan hilangkan iklan selamanya hanya dengan Rp 15rb/bulan.</p>
            <button onClick={onClose} className="w-full bg-gradient-to-r from-[#7F5AF0] to-[#6b48d1] py-4 rounded-2xl font-bold text-white shadow-xl shadow-[#7F5AF0]/20 transition-all uppercase tracking-widest text-xs font-poppins active:scale-95">Lanjutkan</button>
          </div>
        </div>
      </motion.div>
    );
  }
  return (
    <div className="w-full h-24 bg-[#1A1A2E]/50 backdrop-blur-md border border-white/5 rounded-2xl flex items-center justify-center my-6 overflow-hidden relative group cursor-pointer transition-all hover:border-[#7F5AF0]/30">
      <div className="absolute top-2 left-2 text-[8px] text-gray-600 font-bold uppercase tracking-widest">Sponsored</div>
      <div className="text-gray-500 font-bold text-sm tracking-[0.3em] group-hover:text-[#7F5AF0] transition-colors uppercase font-cinzel">Misteri+ Premium</div>
    </div>
  );
};

// --- PAGES ---
const HomePage = () => {
  const { setCurrentPage, setSelectedDream, setShowInterstitial, setIsLoading, trendingDreams, refreshTrending } = useAppContext();
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
      } else {
        alert("Energi mistis sedang terputus. Silakan coba kata kunci lain.");
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleCategoryClick = (id: Page) => {
    if (id === Page.HOME) {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setCurrentPage(id);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-6 space-y-10">
      <section className="space-y-6 text-center md:text-left">
        <h2 className="text-5xl font-cinzel font-bold leading-[1.1] tracking-tight">
          Apa pesan <br/>
          <span className="text-[#7F5AF0] drop-shadow-[0_0_10px_rgba(127,90,240,0.5)]">Semesta</span> bagimu?
        </h2>
        <div className="relative group max-w-lg mx-auto md:mx-0">
          <div className="absolute inset-0 bg-[#7F5AF0]/10 blur-2xl group-focus-within:bg-[#7F5AF0]/20 transition-all"></div>
          <input 
            ref={inputRef}
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            placeholder="Ketik mimpimu semalam..." 
            className="relative w-full bg-[#1A1A2E]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] py-5 pl-14 pr-16 text-white focus:outline-none focus:border-[#7F5AF0]/50 transition-all font-poppins text-base shadow-2xl" 
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#7F5AF0] transition-colors" size={22} />
          <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#7F5AF0] rounded-full text-white shadow-lg shadow-[#7F5AF0]/30 hover:bg-[#6b48d1] transition-all flex items-center justify-center active:scale-90">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tafsir', id: Page.HOME, icon: <Moon size={24} />, color: '#7F5AF0' }, 
          { label: 'Zodiak', id: Page.ZODIAC, icon: <Sparkles size={24} />, color: '#FFD700' }, 
          { label: 'Numerik', id: Page.NUMEROLOGY, icon: <Zap size={24} />, color: '#2CB67D' }, 
          { label: 'Primbon', id: Page.JAVA_HOROSCOPE, icon: <Sun size={24} />, color: '#FF7E33' }
        ].map(cat => (
          <button key={cat.label} onClick={() => handleCategoryClick(cat.id)} className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 bg-[#1A1A2E]/60 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/5 group-hover:border-[#7F5AF0]/50 group-hover:bg-[#7F5AF0]/10 transition-all shadow-xl">
              <span style={{ color: cat.color }}>{cat.icon}</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em]">{cat.label}</span>
          </button>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex justify-between items-end px-1">
          <div>
            <h3 className="text-xl font-cinzel font-bold tracking-wider uppercase flex items-center gap-3">
              <Compass size={20} className="text-[#7F5AF0]" />
              Populer
            </h3>
            <div className="w-12 h-1 bg-[#7F5AF0] rounded-full mt-1"></div>
          </div>
          <button onClick={() => setCurrentPage(Page.TRENDING)} className="text-[#7F5AF0] text-[10px] font-bold uppercase tracking-widest hover:underline">Semua</button>
        </div>
        
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-4 pt-2 -mx-2 px-2">
          {trendingDreams.length > 0 ? trendingDreams.map(dream => (
            <motion.div 
              whileTap={{ scale: 0.96 }}
              key={dream.slug} 
              onClick={() => { setSelectedDream(dream); setShowInterstitial(true); setCurrentPage(Page.DETAIL); }} 
              className="flex-shrink-0 w-52 bg-[#1A1A2E]/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#7F5AF0]/30 cursor-pointer transition-all"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Moon size={60} />
              </div>
              <div className="w-11 h-11 bg-[#7F5AF0]/10 rounded-2xl flex items-center justify-center text-[#7F5AF0] shadow-inner">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="font-bold text-base leading-tight h-12 line-clamp-2 font-poppins">{dream.judul}</p>
                <p className="text-[9px] text-[#7F5AF0] font-bold uppercase tracking-widest mt-2">{dream.kategori}</p>
              </div>
            </motion.div>
          )) : (
            <div className="w-full py-16 text-center text-gray-500 text-xs italic font-poppins bg-[#1A1A2E]/20 rounded-3xl border border-dashed border-white/5">
              Menghubungkan energi mistis...
            </div>
          )}
        </div>
      </section>

      <AdBanner type="banner" />
    </motion.div>
  );
};

const DetailPage = () => {
  const { selectedDream, setCurrentPage, favorites, toggleFavorite } = useAppContext();
  
  useEffect(() => {
    if (!selectedDream) {
      setCurrentPage(Page.HOME);
    }
  }, [selectedDream]);

  if (!selectedDream) return null;

  return (
    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="py-6 space-y-10">
      <header className="flex items-center justify-between">
        <button onClick={() => setCurrentPage(Page.HOME)} className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-white bg-white/5 px-4 py-2 rounded-full">
          <ChevronRight size={14} className="rotate-180" /> Kembali
        </button>
        <div className="flex gap-3">
          <button onClick={() => toggleFavorite(selectedDream.slug)} className="w-10 h-10 bg-[#1A1A2E] rounded-full border border-white/5 flex items-center justify-center active:scale-90 transition-all">
            <Heart size={18} className={favorites.includes(selectedDream.slug) ? 'text-red-500 fill-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-gray-500'} />
          </button>
          <button className="w-10 h-10 bg-[#1A1A2E] rounded-full border border-white/5 flex items-center justify-center active:scale-90 transition-all text-gray-500">
            <Share2 size={18} />
          </button>
        </div>
      </header>
      
      <div className="space-y-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#7F5AF0] bg-[#7F5AF0]/10 px-5 py-2 rounded-full border border-[#7F5AF0]/20 inline-block">{selectedDream.kategori}</span>
        <h1 className="text-4xl font-cinzel font-bold leading-tight tracking-wide text-white">{selectedDream.judul}</h1>
      </div>

      <section className="bg-gradient-to-br from-[#1A1A2E] to-transparent p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#7F5AF0] rounded-full"></div>
        <p className="text-gray-200 italic text-xl leading-relaxed font-poppins font-light">"{selectedDream.ringkasan}"</p>
      </section>

      <div className="grid gap-6">
        <div className="bg-[#2CB67D]/5 border border-[#2CB67D]/20 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
          <h4 className="text-[#2CB67D] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-poppins">
            <div className="w-2 h-2 bg-[#2CB67D] rounded-full animate-pulse"></div>
            Sisi Terang
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed font-poppins font-light">{selectedDream.tafsir_positif}</p>
        </div>
        <div className="bg-[#E53E3E]/5 border border-[#E53E3E]/20 p-8 rounded-[2.5rem] space-y-4 shadow-xl">
          <h4 className="text-[#E53E3E] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-poppins">
            <div className="w-2 h-2 bg-[#E53E3E] rounded-full animate-pulse"></div>
            Peringatan
          </h4>
          <p className="text-sm text-gray-300 leading-relaxed font-poppins font-light">{selectedDream.tafsir_negatif}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#7F5AF0] to-[#6b48d1] p-12 rounded-[3.5rem] flex justify-between items-center shadow-2xl shadow-[#7F5AF0]/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="z-10">
          <h4 className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/60 mb-3 font-poppins">Angka Mistis</h4>
          <p className="text-6xl font-cinzel font-bold tracking-[0.1em] text-white drop-shadow-lg">{selectedDream.angka}</p>
        </div>
        <div className="text-7xl z-10 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-bounce">🔮</div>
      </div>

      <AdBanner type="banner" />
    </motion.div>
  );
};

const ZodiacPage = () => {
  const { setCurrentPage, setIsLoading } = useAppContext();
  const [selectedZodiac, setSelectedZodiac] = useState<string | null>(null);
  const [fortune, setFortune] = useState<any>(null);

  const handleZodiacClick = async (nama: string) => {
    setIsLoading(true);
    setSelectedZodiac(nama);
    
    const dbFortune = await fetchZodiacFromDB(nama);
    if (dbFortune) {
      setFortune(dbFortune);
      setIsLoading(false);
      return;
    }

    const aiResult = await getZodiacFortune(nama);
    if (aiResult) {
      setFortune(aiResult);
      await saveZodiacToDB(nama, aiResult);
    }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-10">
      {!selectedZodiac ? (
        <>
          <header className="space-y-4">
            <h2 className="text-4xl font-cinzel font-bold leading-tight">Garis <span className="text-[#FFD700]">Takdir</span></h2>
            <p className="text-sm text-gray-500 font-poppins">Pilih rasi bintangmu untuk menyingkap nasib hari ini.</p>
          </header>

          <div className="grid grid-cols-3 gap-4">
            {ZODIAC_LIST.map((z, idx) => (
              <motion.button
                key={z.nama}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleZodiacClick(z.nama)}
                className="bg-[#1A1A2E]/50 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:border-[#FFD700]/30 transition-all active:scale-95 group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{z.icon}</span>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-white">{z.nama}</p>
                  <p className="text-[8px] text-gray-500 font-medium mt-1 uppercase tracking-tighter">{z.tanggal}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
          <button onClick={() => { setSelectedZodiac(null); setFortune(null); }} className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
            <ChevronRight size={14} className="rotate-180" /> Kembali
          </button>

          {fortune && (
            <>
              <div className="flex flex-col items-center text-center space-y-4">
                <span className="text-7xl drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                  {ZODIAC_LIST.find(z => z.nama === selectedZodiac)?.icon}
                </span>
                <h1 className="text-4xl font-cinzel font-bold tracking-widest uppercase">{selectedZodiac}</h1>
              </div>

              <section className="bg-gradient-to-br from-[#1A1A2E] to-transparent p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <h4 className="text-[#FFD700] text-xs font-bold uppercase tracking-[0.2em] mb-4">Kondisi Umum</h4>
                <p className="text-gray-300 leading-relaxed font-poppins italic">"{fortune.umum}"</p>
              </section>

              <div className="grid gap-6">
                <div className="bg-[#7F5AF0]/5 border border-[#7F5AF0]/20 p-7 rounded-[2.5rem]">
                  <h4 className="text-[#7F5AF0] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.2em] mb-3"><Heart size={16} /> Cinta</h4>
                  <p className="text-sm text-gray-400 font-poppins">{fortune.cinta}</p>
                </div>
                <div className="bg-[#2CB67D]/5 border border-[#2CB67D]/20 p-7 rounded-[2.5rem]">
                  <h4 className="text-[#2CB67D] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.2em] mb-3"><Briefcase size={16} /> Karir</h4>
                  <p className="text-sm text-gray-400 font-poppins">{fortune.karir}</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
      <AdBanner type="banner" />
    </motion.div>
  );
};

const NumerologyPage = () => {
  const { setIsLoading } = useAppContext();
  const [dob, setDob] = useState('');
  const [reading, setReading] = useState<any>(null);
  const [lifePathNumber, setLifePathNumber] = useState<number | null>(null);

  const calculateLifePath = (dateString: string) => {
    const digits = dateString.replace(/-/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    }
    return sum;
  };

  const handleCalculate = async () => {
    if (!dob) return;
    setIsLoading(true);
    
    const dbReading = await fetchNumerologyFromDB(dob);
    const num = calculateLifePath(dob);
    setLifePathNumber(num);

    if (dbReading) {
      setReading(dbReading);
      setIsLoading(false);
      return;
    }

    const result = await getNumerologyReading(num, dob);
    
    if (result) {
      setReading(result);
      await saveNumerologyToDB(dob, num, result);
    }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-10">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight">Rahasia <span className="text-[#2CB67D]">Numerik</span></h2>
        <p className="text-sm text-gray-500 font-poppins">Temukan takdir yang tertulis dalam angka kelahiranmu.</p>
      </header>

      {!reading ? (
        <section className="bg-[#1A1A2E]/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
          <div className="space-y-4 text-center">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 block">Pilih Tanggal Lahir</label>
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-[#2CB67D]/50 transition-all font-poppins text-center text-lg" 
            />
          </div>
          <button 
            onClick={handleCalculate}
            disabled={!dob}
            className="w-full bg-[#2CB67D] hover:bg-[#259b6a] disabled:opacity-50 py-5 rounded-2xl font-bold text-white shadow-xl shadow-[#2CB67D]/20 transition-all uppercase tracking-widest text-xs active:scale-95 flex items-center justify-center gap-3"
          >
            <Zap size={18} /> Singkap Takdir
          </button>
        </section>
      ) : (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-[#2CB67D] blur-3xl opacity-20 animate-pulse"></div>
               <div className="relative w-32 h-32 bg-gradient-to-br from-[#2CB67D] to-[#1A1A2E] rounded-full flex items-center justify-center border-4 border-[#2CB67D]/30 shadow-2xl">
                 <span className="text-6xl font-cinzel font-bold text-white">{lifePathNumber}</span>
               </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#2CB67D]">Angka Jalur Hidup</p>
              <h3 className="text-xl font-cinzel font-bold mt-2">Sang Pencari Makna</h3>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#2CB67D]"></div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2"><Hash size={16} /> Kepribadian</h4>
              <p className="text-gray-300 leading-relaxed font-poppins italic">"{reading.kepribadian}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h4 className="text-[9px] font-bold uppercase text-[#2CB67D] tracking-widest mb-3 flex items-center gap-2"><Briefcase size={12}/> Karir</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{reading.karir}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <h4 className="text-[9px] font-bold uppercase text-[#7F5AF0] tracking-widest mb-3 flex items-center gap-2"><Heart size={12}/> Asmara</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{reading.asmara}</p>
              </div>
            </div>

            <div className="bg-[#2CB67D]/10 border border-[#2CB67D]/20 p-8 rounded-[2.5rem]">
              <h4 className="text-[#2CB67D] text-xs font-bold uppercase tracking-widest mb-4">Saran Spiritual</h4>
              <p className="text-sm text-gray-300 font-poppins italic">{reading.saran}</p>
            </div>

            <div className="flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/10">
               <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Batu Keberuntungan</span>
               <span className="text-[#2CB67D] font-bold font-cinzel tracking-widest">{reading.batu_permata}</span>
            </div>
          </div>

          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors">Coba Tanggal Lain</button>
        </motion.div>
      )}

      <AdBanner type="banner" />
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
    if (dbReading) {
      setReading(dbReading);
      setIsLoading(false);
      return;
    }

    const result = await getPrimbonReading(dob);
    if (result) {
      setReading(result);
      await savePrimbonToDB(dob, result.weton, result.neptu, result);
    }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-10">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight">Primbon <span className="text-[#FF7E33]">Jawa</span></h2>
        <p className="text-sm text-gray-500 font-poppins">Menyingkap serat kehidupan melalui hitungan weton leluhur.</p>
      </header>

      {!reading ? (
        <section className="bg-[#1A1A2E]/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
          <div className="space-y-4 text-center">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 block">Kala Kelahiran (Tanggal Lahir)</label>
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-white/10 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-[#FF7E33]/50 transition-all font-poppins text-center text-lg" 
            />
          </div>
          <button 
            onClick={handleCalculate}
            disabled={!dob}
            className="w-full bg-[#FF7E33] hover:bg-[#e66a22] disabled:opacity-50 py-5 rounded-2xl font-bold text-white shadow-xl shadow-[#FF7E33]/20 transition-all uppercase tracking-widest text-xs active:scale-95 flex items-center justify-center gap-3"
          >
            <Sun size={18} /> Hitung Weton
          </button>
        </section>
      ) : (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-8">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-[#FF7E33] blur-3xl opacity-20 animate-pulse"></div>
               <div className="relative w-56 h-28 bg-gradient-to-br from-[#FF7E33] to-[#1A1A2E] rounded-3xl flex flex-col items-center justify-center border-4 border-[#FF7E33]/30 shadow-2xl px-4">
                 <span className="text-2xl font-cinzel font-bold text-white uppercase tracking-wider">{reading.weton}</span>
                 <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-1">Neptu: {reading.neptu}</span>
               </div>
            </div>
            <div className="px-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#FF7E33] mb-1">Pariweda Hari</p>
              <h3 className="text-sm font-poppins font-semibold text-white italic bg-[#FF7E33]/10 py-3 px-4 rounded-2xl border border-[#FF7E33]/20">
                "{reading.makna_hari}"
              </h3>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FF7E33]"></div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">Watak Bawaan</h4>
              <p className="text-gray-300 leading-relaxed font-poppins italic">"{reading.watak}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                <h4 className="text-[9px] font-bold uppercase text-[#FF7E33] tracking-widest flex items-center gap-2"><Briefcase size={12}/> Pekerjaan</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{reading.pekerjaan}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                <h4 className="text-[9px] font-bold uppercase text-amber-500 tracking-widest flex items-center gap-2"><Store size={12}/> Bisnis Hoki</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{reading.bisnis}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                <h4 className="text-[9px] font-bold uppercase text-[#7F5AF0] tracking-widest flex items-center gap-2"><Users size={12}/> Jodoh</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{reading.jodoh}</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                <h4 className="text-[9px] font-bold uppercase text-yellow-500 tracking-widest flex items-center gap-2"><Clock size={12}/> Hari Baik</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">{reading.hari_baik}</p>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette size={16} className="text-[#2CB67D]" />
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Warna Keberuntungan</span>
                </div>
                <span className="text-[#2CB67D] font-bold uppercase tracking-wider text-xs">{reading.warna}</span>
            </div>

            <div className="bg-[#FF7E33]/5 border border-[#FF7E33]/20 p-8 rounded-[2.5rem] space-y-4">
              <h4 className="text-[#FF7E33] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Coins size={14} /> Ramalan Rejeki
              </h4>
              <p className="text-sm text-gray-300 font-poppins leading-relaxed italic">"{reading.rejeki}"</p>
            </div>

            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#7F5AF0]">Saran Spiritual</h4>
              <p className="text-sm text-gray-400 font-poppins italic leading-relaxed">{reading.saran}</p>
            </div>
          </div>

          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors">Coba Tanggal Lain</button>
        </motion.div>
      )}

      <AdBanner type="banner" />
    </motion.div>
  );
};

const TrendingPage = () => {
  const { trendingDreams, setSelectedDream, setShowInterstitial, setCurrentPage } = useAppContext();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-8">
      <header className="space-y-3">
        <h2 className="text-4xl font-cinzel font-bold leading-tight flex items-center gap-4">
          <Flame className="text-[#E53E3E]" fill="currentColor" size={32} />
          Mimpi <span className="text-[#E53E3E]">Trens</span>
        </h2>
        <p className="text-sm text-gray-500 font-poppins">Tafsir yang paling banyak dicari oleh pencari hidayah.</p>
      </header>

      <div className="space-y-4">
        {trendingDreams.map((dream, idx) => (
          <motion.div 
            key={dream.slug}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => { setSelectedDream(dream); setShowInterstitial(true); setCurrentPage(Page.DETAIL); }}
            className="bg-[#1A1A2E]/60 border border-white/5 p-5 rounded-[2rem] flex items-center gap-5 hover:border-[#E53E3E]/30 cursor-pointer transition-all group shadow-xl"
          >
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-lg font-cinzel font-bold text-gray-500 group-hover:text-[#E53E3E] group-hover:scale-110 transition-transform">
              {idx + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base font-poppins line-clamp-1">{dream.judul}</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{dream.kategori}</p>
            </div>
            <div className="text-[#E53E3E] flex items-center gap-1">
              <TrendingUp size={14} />
              <span className="text-[10px] font-bold">{dream.view_count}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const FavoritePage = () => {
  const { favorites, trendingDreams, setSelectedDream, setShowInterstitial, setCurrentPage } = useAppContext();
  const favoriteItems = trendingDreams.filter(d => favorites.includes(d.slug));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-8">
      <header className="space-y-3">
        <h2 className="text-4xl font-cinzel font-bold leading-tight flex items-center gap-4">
          <Bookmark className="text-[#7F5AF0]" fill="currentColor" size={32} />
          Mimpi <span className="text-[#7F5AF0]">Favorit</span>
        </h2>
        <p className="text-sm text-gray-500 font-poppins">Kumpulan tafsir yang Anda simpan untuk dibaca kembali.</p>
      </header>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {favoriteItems.map((dream) => (
            <motion.div 
              key={dream.slug}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSelectedDream(dream); setShowInterstitial(true); setCurrentPage(Page.DETAIL); }}
              className="bg-[#1A1A2E]/40 border border-white/5 p-6 rounded-[2.5rem] space-y-4 hover:border-[#7F5AF0]/30 cursor-pointer transition-all shadow-xl"
            >
              <div className="w-10 h-10 bg-[#7F5AF0]/10 rounded-xl flex items-center justify-center text-[#7F5AF0]">
                <Heart size={18} fill="currentColor" />
              </div>
              <h4 className="font-bold text-sm leading-tight line-clamp-2 font-poppins h-10">{dream.judul}</h4>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#7F5AF0]">{dream.kategori}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl opacity-20">🖤</div>
          <p className="text-gray-500 text-sm font-poppins italic max-w-[200px]">Belum ada mimpi yang ditandai sebagai favorit Anda.</p>
          <button onClick={() => setCurrentPage(Page.HOME)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7F5AF0] hover:underline">Mulai Mencari</button>
        </div>
      )}
    </motion.div>
  );
};

// --- MAIN LAYOUT (PREMIUM UPGRADE) ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPage, setCurrentPage } = useAppContext();
  
  const navItems = [
    { id: Page.HOME, icon: Moon, label: 'Home' },
    { id: Page.TRENDING, icon: TrendingUp, label: 'Hits' },
    { id: Page.FAVORITE, icon: Heart, label: 'Favorit' }
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#0F0F1A] text-white selection:bg-[#7F5AF0]/30 overflow-hidden">
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-40 bg-[#0F0F1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage(Page.HOME)}>
          <div className="w-11 h-11 bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] rounded-2xl flex items-center justify-center shadow-xl shadow-[#7F5AF0]/20 group-hover:scale-110 transition-transform">
            <Moon size={22} className="text-white" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold tracking-[0.2em] text-white uppercase">Misteri<span className="text-[#7F5AF0]">+</span></h1>
        </div>
        <button onClick={() => setCurrentPage(Page.NUMEROLOGY)} className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${currentPage === Page.NUMEROLOGY ? 'bg-[#2CB67D]/20 border-[#2CB67D]/50 shadow-[0_0_15px_#2CB67D33]' : 'bg-[#1A1A2E] border-white/5'}`}>
          <Zap size={20} className={currentPage === Page.NUMEROLOGY ? 'text-[#2CB67D]' : 'text-[#7F5AF0]'} />
        </button>
      </header>
      
      <main className="flex-1 px-6 pb-32">
        {children}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(127,90,240,0.2)] h-20 flex items-center justify-around z-50">
        <div className="absolute -bottom-2 w-32 h-2 bg-[#7F5AF0] blur-2xl opacity-40"></div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="relative flex flex-col items-center justify-center w-16 group"
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#7F5AF0]/20 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div
                className={`relative z-10 p-2 rounded-xl transition-all duration-300
                ${isActive 
                  ? "text-[#7F5AF0] scale-125 drop-shadow-[0_0_10px_#7F5AF0]" 
                  : "text-white/60 group-hover:text-white"}`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>

              <span
                className={`text-[9px] font-bold tracking-widest mt-1 transition-all duration-300 uppercase
                ${isActive ? "text-white opacity-100" : "text-white/50 opacity-0 group-hover:opacity-100"}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// --- APP CONTENT ---
const AppContent = () => {
  const { currentPage, isLoading, showInterstitial, setShowInterstitial } = useAppContext();
  
  const loadingMessages = ["Menghubungkan energi...", "Membaca pesan semesta...", "Menyingkap takdir...", "Menerjemahkan mimpi..."];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => setMsgIdx(p => (p + 1) % loadingMessages.length), 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME: return <HomePage />;
      case Page.DETAIL: return <DetailPage />;
      case Page.ZODIAC: return <ZodiacPage />;
      case Page.NUMEROLOGY: return <NumerologyPage />;
      case Page.TRENDING: return <TrendingPage />;
      case Page.FAVORITE: return <FavoritePage />;
      case Page.JAVA_HOROSCOPE: return <JavaHoroscopePage />;
      default: return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="text-8xl filter drop-shadow-[0_0_20px_rgba(127,90,240,0.4)]">🔮</motion.div>
          <h2 className="text-3xl font-cinzel font-bold tracking-widest uppercase text-[#7F5AF0]">MEMBUKA ENERGI</h2>
          <p className="text-gray-500 max-w-[250px] text-sm italic font-poppins leading-relaxed">Ruang mistis ini sedang disiapkan oleh para ahli numerologi kami.</p>
          <button onClick={() => window.location.reload()} className="text-[10px] font-bold uppercase text-white/30 tracking-widest hover:text-[#7F5AF0]">Muat Ulang</button>
        </div>
      );
    }
  };

  return (
    <Layout>
      <AnimatePresence>
        {showInterstitial && <AdBanner type="interstitial" onClose={() => setShowInterstitial(false)} />}
      </AnimatePresence>
      
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-[#0F0F1A]/95 backdrop-blur-md flex flex-col items-center justify-center"
        >
          <div className="relative">
             <div className="w-24 h-24 border-4 border-[#7F5AF0]/10 border-t-[#7F5AF0] rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-3xl">✨</div>
          </div>
          <p className="font-cinzel text-xl tracking-[0.3em] text-[#7F5AF0] mt-10 animate-pulse uppercase">{loadingMessages[msgIdx]}</p>
        </motion.div>
      )}
      
      <AnimatePresence mode="wait">
        <motion.div key={currentPage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

// --- RENDER ---
const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </React.StrictMode>
    );
}
