
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
            judul: { type: Type.STRING },
            umum: { type: Type.STRING },
            cinta: { type: Type.STRING },
            karir: { type: Type.STRING },
            keuangan: { type: Type.STRING },
            warna_hoki: { type: Type.STRING },
            angka_hoki: { type: Type.STRING }
          },
          required: ["judul", "umum", "cinta", "karir", "keuangan", "warna_hoki", "angka_hoki"]
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
      contents: `Berikan pembacaan numerologi untuk Angka Jalur Hidup (Life Path Number) ${number} berdasarkan tanggal lahir ${dob}. Nuansa: Mistis and mendalam.`,
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
      3. Berikan makna filosofis hari tersebut.
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
            makna_hari: { type: Type.STRING },
            watak: { type: Type.STRING },
            keberuntungan: { type: Type.STRING },
            rejeki: { type: Type.STRING },
            pekerjaan: { type: Type.STRING },
            bisnis: { type: Type.STRING },
            jodoh: { type: Type.STRING },
            warna: { type: Type.STRING },
            hari_baik: { type: Type.STRING },
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
          <div className="bg-[#7F5AF0] p-3 text-[10px] font-bold text-center tracking-widest text-white uppercase font-poppins relative z-10">Pesan Mistis</div>
          
          <div className="p-10 text-center space-y-8 relative z-20">
            <div className="w-28 h-28 bg-[#2D284D]/50 rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-lg shadow-[#7F5AF0]/20 animate-floating">🌟</div>
            
            <div className="space-y-4">
              <h3 className="text-3xl font-bold font-cinzel text-white tracking-wider glow-text uppercase">Pesan Gaib</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-poppins px-2">Lihat detail pesan mistis untuk menyingkap tabir masa depan Anda.</p>
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
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }} 
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
      exit={{ opacity: 0, filter: 'blur(10px)' }} 
      className="py-6 space-y-12"
    >
      <section className="space-y-10 text-center pt-8">
        <h2 className="text-5xl font-cinzel font-bold leading-[1.1] tracking-tight text-white">
          Pesan <br/>
          <span className="text-[#7F5AF0] glow-text">Semesta</span>
        </h2>
        
        <div className="relative group max-w-lg mx-auto">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#7F5AF0]/20 to-[#6b48d1]/20 blur-2xl opacity-40 group-focus-within:opacity-80 transition-all"></div>
          <div className="relative">
            <input 
              ref={inputRef}
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
              placeholder="Apa yang Anda mimpikan?" 
              className="w-full oracle-input rounded-full py-6 pl-14 pr-16 text-white focus:outline-none font-poppins text-lg transition-all placeholder:text-gray-600" 
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#7F5AF0] transition-colors" size={24} />
            <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#7F5AF0] rounded-full text-white shadow-lg shadow-[#7F5AF0]/30 hover:bg-[#6b48d1] flex items-center justify-center">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4 px-2">
        {[
          { label: 'Tafsir', id: Page.HOME, icon: <Moon size={24} />, color: '#7F5AF0' }, 
          { label: 'Zodiak', id: Page.ZODIAC, icon: <Sparkles size={24} />, color: '#FFD700' }, 
          { label: 'Numerik', id: Page.NUMEROLOGY, icon: <Zap size={24} />, color: '#2CB67D' }, 
          { label: 'Primbon', id: Page.JAVA_HOROSCOPE, icon: <Sun size={24} />, color: '#FF7E33' }
        ].map(cat => (
          <button key={cat.label} onClick={() => setCurrentPage(cat.id)} className="flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 bg-[#1A1A2E]/50 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-[#7F5AF0]/40 group-hover:bg-[#7F5AF0]/10 transition-all shadow-xl">
              <span style={{ color: cat.color }} className="group-hover:scale-110 transition-transform">{cat.icon}</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.3em]">{cat.label}</span>
          </button>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div>
            <h3 className="text-xl font-cinzel font-bold tracking-wider uppercase flex items-center gap-3 text-white">
              <Flame size={20} className="text-[#7F5AF0]" />
              Hits
            </h3>
            <div className="w-14 h-1.5 bg-gradient-to-r from-[#7F5AF0] to-transparent rounded-full mt-2"></div>
          </div>
          <button onClick={() => setCurrentPage(Page.TRENDING)} className="text-[#7F5AF0] text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">Lihat Semua</button>
        </div>
        
        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 pt-2 -mx-2 px-4 snap-x">
          {trendingDreams.map(dream => (
            <motion.div 
              key={dream.slug} 
              onClick={() => { setSelectedDream(dream); setShowInterstitial(true); setCurrentPage(Page.DETAIL); }} 
              className="flex-shrink-0 w-56 mystic-card p-6 rounded-[2.5rem] space-y-5 cursor-pointer relative group snap-center border-none"
            >
              <div className="absolute -top-4 -right-4 p-3 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
                <Moon size={100} />
              </div>
              <div className="w-12 h-12 bg-[#7F5AF0]/10 rounded-2xl flex items-center justify-center text-[#7F5AF0] shadow-inner">
                <Sparkles size={22} />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-lg leading-tight h-14 line-clamp-2 font-poppins text-white">{dream.judul}</p>
                <p className="text-[10px] text-[#7F5AF0] font-bold uppercase tracking-widest">{dream.kategori}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AdBanner type="banner" />
    </motion.div>
  );
};

const DetailPage = () => {
  const { selectedDream, setCurrentPage, favorites, toggleFavorite } = useAppContext();
  
  if (!selectedDream) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, filter: 'blur(15px)' }} 
      animate={{ opacity: 1, filter: 'blur(0px)' }} 
      className="py-6 space-y-10"
    >
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentPage(Page.HOME)} className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-white bg-white/5 px-5 py-2.5 rounded-full">
          <ChevronRight size={14} className="rotate-180" /> Kembali
        </button>
        <div className="flex gap-4">
          <button onClick={() => toggleFavorite(selectedDream.slug)} className="w-12 h-12 mystic-card rounded-full flex items-center justify-center border-none">
            <Heart size={20} className={favorites.includes(selectedDream.slug) ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-gray-500'} />
          </button>
          <button className="w-12 h-12 mystic-card rounded-full flex items-center justify-center text-gray-500 border-none">
            <Share2 size={20} />
          </button>
        </div>
      </header>
      
      <div className="space-y-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#7F5AF0] bg-[#7F5AF0]/10 px-6 py-2.5 rounded-full border border-[#7F5AF0]/20 inline-block">{selectedDream.kategori}</span>
        <h1 className="text-5xl font-cinzel font-bold leading-tight tracking-wide text-white glow-text">{selectedDream.judul}</h1>
      </div>

      <section className="mystic-card p-10 rounded-[3.5rem] relative border-none">
        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#7F5AF0] to-transparent rounded-full"></div>
        <p className="text-gray-200 italic text-2xl leading-relaxed font-poppins font-light">"{selectedDream.ringkasan}"</p>
      </section>

      <div className="grid gap-8">
        <div className="mystic-card bg-[#2CB67D]/5 border-none p-8 rounded-[2.5rem] space-y-4">
          <h4 className="text-[#2CB67D] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
            <div className="w-2.5 h-2.5 bg-[#2CB67D] rounded-full animate-pulse"></div>
            Pesan Cahaya
          </h4>
          <p className="text-base text-gray-300 leading-relaxed font-poppins">{selectedDream.tafsir_positif}</p>
        </div>
        <div className="mystic-card bg-[#E53E3E]/5 border-none p-8 rounded-[2.5rem] space-y-4">
          <h4 className="text-[#E53E3E] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
            <div className="w-2.5 h-2.5 bg-[#E53E3E] rounded-full animate-pulse"></div>
            Pesan Kegelapan
          </h4>
          <p className="text-base text-gray-300 leading-relaxed font-poppins">{selectedDream.tafsir_negatif}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] p-12 rounded-[4rem] flex justify-between items-center shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15"></div>
        <div className="z-10">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/70 mb-4 font-poppins">Angka Takdir</h4>
          <p className="text-7xl font-cinzel font-bold tracking-[0.1em] text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{selectedDream.angka}</p>
        </div>
        <div className="text-8xl z-10 animate-floating drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">🔮</div>
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
    } else {
      const aiResult = await getZodiacFortune(nama);
      if (aiResult) {
        setFortune(aiResult);
        await saveZodiacToDB(nama, aiResult);
      }
    }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      {!selectedZodiac ? (
        <>
          <header className="space-y-4 text-center">
            <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Garis <span className="gold-glow-text">Bintang</span></h2>
            <p className="text-sm text-gray-500 font-poppins px-8">Sentuh rasi bintangmu untuk menyingkap nasib yang tertulis di langit.</p>
          </header>

          <div className="grid grid-cols-3 gap-5">
            {ZODIAC_LIST.map((z, idx) => (
              <motion.button
                key={z.nama}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                onClick={() => handleZodiacClick(z.nama)}
                className="mystic-card p-6 rounded-[2.5rem] flex flex-col items-center gap-4 group border-none"
              >
                <span className="text-5xl group-hover:scale-115 transition-transform group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">{z.icon}</span>
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white">{z.nama}</p>
                  <p className="text-[9px] text-gray-600 font-medium mt-1 uppercase tracking-tighter">{z.tanggal}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, filter: 'blur(10px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} className="space-y-10">
          <button onClick={() => { setSelectedZodiac(null); setFortune(null); }} className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-5 py-2.5 rounded-full">
            <ChevronRight size={14} className="rotate-180" /> Kembali
          </button>

          {fortune && (
            <>
              <div className="flex flex-col items-center text-center space-y-8">
                <span className="text-9xl drop-shadow-[0_0_30px_rgba(255,215,0,0.4)] animate-floating">
                  {ZODIAC_LIST.find(z => z.nama === selectedZodiac)?.icon}
                </span>
                <h1 className="text-6xl font-cinzel font-bold tracking-widest uppercase gold-glow-text">{selectedZodiac}</h1>
              </div>

              <section className="mystic-card p-10 rounded-[3.5rem] relative overflow-hidden border-none">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFD700]/5 rounded-full blur-[80px]"></div>
                <h4 className="text-[#FFD700] text-xs font-bold uppercase tracking-[0.3em] mb-5">Ramalan Semesta</h4>
                <p className="text-gray-200 leading-relaxed font-poppins italic text-xl">"{fortune.umum}"</p>
              </section>

              <div className="grid gap-8">
                <div className="mystic-card bg-[#7F5AF0]/5 p-8 rounded-[3rem] border-none">
                  <h4 className="text-[#7F5AF0] font-bold flex items-center gap-4 text-xs uppercase tracking-[0.3em] mb-5"><Heart size={20} /> Cinta</h4>
                  <p className="text-base text-gray-300 font-poppins leading-relaxed">{fortune.cinta}</p>
                </div>
                <div className="mystic-card bg-[#2CB67D]/5 p-8 rounded-[3rem] border-none">
                  <h4 className="text-[#2CB67D] font-bold flex items-center gap-4 text-xs uppercase tracking-[0.3em] mb-5"><Briefcase size={20} /> Karir</h4>
                  <p className="text-base text-gray-300 font-poppins leading-relaxed">{fortune.karir}</p>
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
  const [lifePath, setLifePath] = useState<number | null>(null);

  const calculateLifePath = (dateStr: string) => {
    const digits = dateStr.replace(/\D/g, '');
    let sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
    }
    return sum;
  };

  const handleCalculate = async () => {
    if (!dob) return;
    setIsLoading(true);
    const lp = calculateLifePath(dob);
    setLifePath(lp);

    const dbReading = await fetchNumerologyFromDB(dob);
    if (dbReading) {
      setReading(dbReading);
    } else {
      const result = await getNumerologyReading(lp, dob);
      if (result) {
        setReading(result);
        await saveNumerologyToDB(dob, lp, result);
      }
    }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Takdir <span className="text-[#2CB67D] drop-shadow-[0_0_10px_rgba(44,182,125,0.4)]">Numerik</span></h2>
        <p className="text-sm text-gray-500 font-poppins px-6">Singkap kode rahasia yang tersembunyi dalam angka kelahiran Anda.</p>
      </header>

      {!reading ? (
        <section className="mystic-card p-12 rounded-[4rem] space-y-10 border-none shadow-2xl">
          <div className="space-y-6 text-center">
            <label className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-600 block">Kala Kelahiran</label>
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#0F0F1A]/80 border border-[#7F5AF0]/30 rounded-[2rem] py-7 px-8 text-[#A78BFA] focus:outline-none focus:border-[#7F5AF0] transition-all font-poppins text-center text-2xl shadow-inner" 
              style={{ color: '#A78BFA', colorScheme: 'dark' }}
            />
          </div>
          <button 
            onClick={handleCalculate}
            disabled={!dob}
            className="w-full bg-[#2CB67D] hover:bg-[#249e6b] disabled:opacity-50 py-6 rounded-[2.5rem] font-bold text-white shadow-xl shadow-[#2CB67D]/20 transition-all uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center justify-center gap-4"
          >
            <Zap size={24} /> Hitung Angka Takdir
          </button>
        </section>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
           <div className="text-center space-y-10">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-[#2CB67D] blur-[100px] opacity-25 animate-pulse"></div>
               <div className="relative w-72 h-40 bg-gradient-to-br from-[#2CB67D] to-[#1A1A2E] rounded-[3.5rem] flex flex-col items-center justify-center border-4 border-[#2CB67D]/30 shadow-2xl px-8">
                 <span className="text-7xl font-cinzel font-bold text-white tracking-widest glow-text">{lifePath}</span>
                 <div className="w-full h-[1px] bg-white/10 my-4"></div>
                 <span className="text-[12px] text-white/90 font-bold uppercase tracking-[0.4em]">Life Path Number</span>
               </div>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="mystic-card p-12 rounded-[3.5rem] relative border-none">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#2CB67D] to-transparent rounded-full"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 mb-6">Kepribadian Utama</h4>
              <p className="text-gray-200 leading-relaxed font-poppins italic text-xl text-white">"{reading.kepribadian}"</p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-[#2CB67D] tracking-[0.3em] flex items-center gap-3"><Briefcase size={18}/> Karir</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.karir}</p>
              </div>
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-[#7F5AF0] tracking-[0.3em] flex items-center gap-3"><Heart size={18}/> Asmara</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.asmara}</p>
              </div>
            </div>

            <div className="mystic-card bg-[#2CB67D]/5 p-12 rounded-[4rem] space-y-6 border-none shadow-2xl">
              <h4 className="text-[#2CB67D] text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-4">
                <Sparkles size={22} /> Batu Permata Hoki
              </h4>
              <p className="text-xl text-gray-300 font-poppins leading-relaxed italic text-white">"{reading.batu_permata}"</p>
            </div>

             <div className="mystic-card p-12 rounded-[3.5rem] relative border-none">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 mb-6">Saran Semesta</h4>
              <p className="text-gray-200 leading-relaxed font-poppins text-lg text-white">{reading.saran}</p>
            </div>
          </div>

          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all">Hitung Ulang</button>
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
    } else {
      const result = await getPrimbonReading(dob);
      if (result) {
        setReading(result);
        await savePrimbonToDB(dob, result.weton, result.neptu, result);
      }
    }
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Primbon <span className="text-[#FF7E33] drop-shadow-[0_0_10px_rgba(255,126,51,0.4)]">Jawa</span></h2>
        <p className="text-sm text-gray-500 font-poppins px-6">Menyingkap serat kehidupan melalui hitungan weton leluhur nusantara.</p>
      </header>

      {!reading ? (
        <section className="mystic-card p-12 rounded-[4rem] space-y-10 border-none shadow-2xl">
          <div className="space-y-6 text-center">
            <label className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-600 block">Kala Kelahiran</label>
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-[#0F0F1A]/80 border border-[#7F5AF0]/30 rounded-[2rem] py-7 px-8 text-[#A78BFA] focus:outline-none focus:border-[#7F5AF0] transition-all font-poppins text-center text-2xl shadow-inner" 
              style={{ color: '#A78BFA', colorScheme: 'dark' }}
            />
          </div>
          <button 
            onClick={handleCalculate}
            disabled={!dob}
            className="w-full bg-[#FF7E33] hover:bg-[#e66a22] disabled:opacity-50 py-6 rounded-[2.5rem] font-bold text-white shadow-xl shadow-[#FF7E33]/20 transition-all uppercase tracking-[0.3em] text-xs active:scale-95 flex items-center justify-center gap-4"
          >
            <Sun size={24} /> Singkap Weton
          </button>
        </section>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12">
          <div className="text-center space-y-10">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-[#FF7E33] blur-[100px] opacity-25 animate-pulse"></div>
               <div className="relative w-72 h-40 bg-gradient-to-br from-[#FF7E33] to-[#1A1A2E] rounded-[3.5rem] flex flex-col items-center justify-center border-4 border-[#FF7E33]/30 shadow-2xl px-8">
                 <span className="text-4xl font-cinzel font-bold text-white uppercase tracking-widest glow-text">{reading.weton}</span>
                 <div className="w-full h-[1px] bg-white/10 my-4"></div>
                 <span className="text-[12px] text-white/90 font-bold uppercase tracking-[0.4em]">Neptu: {reading.neptu}</span>
               </div>
            </div>
            <div className="px-6">
              <h3 className="text-base font-poppins font-semibold text-white italic bg-[#FF7E33]/10 py-7 px-8 rounded-[2.5rem] border border-[#FF7E33]/20 shadow-2xl leading-relaxed">
                "{reading.makna_hari}"
              </h3>
            </div>
          </div>

          <div className="grid gap-8">
            <div className="mystic-card p-12 rounded-[3.5rem] relative border-none text-white">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#FF7E33] to-transparent rounded-full"></div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 mb-6">Watak Bawaan</h4>
              <p className="text-gray-200 leading-relaxed font-poppins italic text-xl">"{reading.watak}"</p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-[#FF7E33] tracking-[0.3em] flex items-center gap-3"><Briefcase size={18}/> Pekerjaan</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.pekerjaan}</p>
              </div>
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-amber-500 tracking-[0.3em] flex items-center gap-3"><Store size={18}/> Bisnis</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.bisnis}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-[#7F5AF0] tracking-[0.3em] flex items-center gap-3"><Users size={18}/> Jodoh</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.jodoh}</p>
              </div>
              <div className="mystic-card p-8 rounded-[3rem] space-y-4 border-none">
                <h4 className="text-[10px] font-bold uppercase text-yellow-500 tracking-[0.3em] flex items-center gap-3"><Clock size={18}/> Hari Baik</h4>
                <p className="text-[13px] text-gray-300 leading-relaxed font-poppins">{reading.hari_baik}</p>
              </div>
            </div>

            <div className="mystic-card bg-[#FF7E33]/5 p-12 rounded-[4rem] space-y-6 border-none shadow-2xl">
              <h4 className="text-[#FF7E33] text-xs font-bold uppercase tracking-[0.4em] flex items-center gap-4">
                <Coins size={22} /> Rejeki
              </h4>
              <p className="text-xl text-gray-200 font-poppins leading-relaxed italic">"{reading.rejeki}"</p>
            </div>
          </div>

          <button onClick={() => { setReading(null); setDob(''); }} className="w-full bg-white/5 py-5 rounded-[2rem] text-[10px] font-bold uppercase tracking-[0.4em] text-gray-600 hover:text-white transition-all">Coba Kala Lain</button>
        </motion.div>
      )}

      <AdBanner type="banner" />
    </motion.div>
  );
};

// --- MAIN LAYOUT ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPage, setCurrentPage } = useAppContext();
  
  const runes = ['ꦀ', 'ꦁ', 'ꦂ', 'ꦃ', 'ꦄ', 'ꦅ', 'ꦆ', 'ꦇ', 'ꦈ', 'ꦉ', 'ꦊ', 'ꦋ', 'ꦌ', 'ꦍ', 'ꦎ'];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#0F0F1A] text-white selection:bg-[#7F5AF0]/30 overflow-hidden">
      {/* Background Runes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.08]">
        {[...Array(18)].map((_, i) => (
          <div 
            key={i} 
            className="mystic-rune"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`, 
              fontSize: `${25 + Math.random() * 70}px`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${18 + Math.random() * 25}s`
            }}
          >
            {runes[Math.floor(Math.random() * runes.length)]}
          </div>
        ))}
      </div>

      <header className="px-8 py-7 flex items-center justify-between sticky top-0 z-40 bg-[#0F0F1A]/85 backdrop-blur-2xl border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setCurrentPage(Page.HOME)}>
          <div className="w-12 h-12 bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] rounded-2xl flex items-center justify-center shadow-xl shadow-[#7F5AF0]/25 group-hover:rotate-[15deg] transition-all">
            <Moon size={26} className="text-white" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold tracking-[0.4em] text-white uppercase glow-text">Misteri<span className="text-[#7F5AF0]">+</span></h1>
        </div>
        <button onClick={() => setCurrentPage(Page.NUMEROLOGY)} className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 bg-[#1A1A2E]/60 active:scale-90 transition-all hover:border-[#7F5AF0]/40">
          <Zap size={24} className="text-[#7F5AF0]" />
        </button>
      </header>
      
      <main className="flex-1 px-6 pb-40">
        {children}
      </main>
    </div>
  );
};

// --- NAVIGATION COMPONENT ---
const PremiumBottomNav = () => {
  const { currentPage, setCurrentPage } = useAppContext();
  
  const navItems = [
    { id: Page.HOME, icon: Moon, label: 'Ritual' },
    { id: Page.TRENDING, icon: TrendingUp, label: 'Trens' },
    { id: Page.FAVORITE, icon: Heart, label: 'Favorit' }
  ];

  return (
    <div className="fixed bottom-8 inset-x-0 flex justify-center z-[9000] pointer-events-none">
      <nav className="mystic-card w-[92%] max-w-[420px] pointer-events-auto h-[88px] flex items-center justify-around overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] border-white/10 bg-[#1A1A2E]/80 backdrop-blur-3xl">
        
        {/* Mystic Aura Glow */}
        <div className="absolute -bottom-6 w-48 h-16 bg-[#7F5AF0] blur-3xl opacity-20 mystic-aura"></div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`relative flex flex-col items-center justify-center w-20 group transition-all duration-500 pointer-events-auto`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-x-2 inset-y-1 bg-[#7F5AF0]/15 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                />
              )}
              <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
                isActive ? "text-[#7F5AF0] scale-110 drop-shadow-[0_0_12px_#7F5AF0]" : "text-gray-400 group-hover:text-white"
              }`}>
                <Icon 
                  size={26} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className="transition-all duration-500 group-hover:scale-110"
                />
                <span className={`text-[9px] font-bold tracking-[0.3em] mt-2 uppercase transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                }`}>
                  {item.label}
                </span>
              </div>
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
      case Page.TRENDING: return (
        <div className="py-6 space-y-12">
          <header className="space-y-4 text-center">
            <h2 className="text-4xl font-cinzel font-bold leading-tight text-white">Mimpi <span className="text-[#E53E3E] drop-shadow-[0_0_10px_rgba(229,62,62,0.4)]">Hits</span></h2>
            <p className="text-sm text-gray-500 font-poppins px-8 text-white/60">Tafsir yang paling sering menembus tabir kesadaran kolektif.</p>
          </header>
          <div className="space-y-5 px-2">
            {[1,2,3,4,5,6].map(i => (
               <div key={i} className="mystic-card p-8 rounded-[2.5rem] border-none flex items-center justify-between group cursor-pointer shadow-xl">
                  <div className="flex items-center gap-6">
                    <span className="text-3xl font-cinzel font-bold text-gray-800 group-hover:text-[#7F5AF0] transition-all">{i}</span>
                    <div className="h-12 w-[1px] bg-white/10"></div>
                    <div>
                      <h4 className="font-bold font-poppins text-lg text-white group-hover:text-[#7F5AF0] transition-colors">Visi Kolektif #{i}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1.5">Manifestasi Spiritual</p>
                    </div>
                  </div>
                  <div className="bg-[#7F5AF0]/10 p-2.5 rounded-xl group-hover:bg-[#7F5AF0]/20 transition-all">
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-[#7F5AF0]" />
                  </div>
               </div>
            ))}
          </div>
        </div>
      );
      default: return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="text-[10rem] filter drop-shadow-[0_0_40px_rgba(127,90,240,0.6)]">🔮</motion.div>
          <div className="space-y-6">
            <h2 className="text-5xl font-cinzel font-bold tracking-[0.4em] uppercase text-[#7F5AF0] glow-text">RITUAL</h2>
            <p className="text-gray-500 max-w-[320px] text-base italic font-poppins leading-relaxed mx-auto text-white/60">Ruang mistis ini sedang disiapkan oleh para oracle kami. Harap menunggu hingga energi terkumpul sempurna.</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-[11px] font-bold uppercase text-white/20 tracking-[0.5em] hover:text-[#7F5AF0] transition-all">Muat Ulang Dimensi</button>
        </div>
      );
    }
  };

  return (
    <>
      <Layout>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            style={{ zIndex: 80000 }} 
            className="fixed inset-0 bg-[#050508]/98 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="relative">
               <div className="w-40 h-40 border-[1px] border-[#7F5AF0]/10 border-t-[#7F5AF0] rounded-full animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse">✨</div>
            </div>
            <p className="font-cinzel text-2xl tracking-[0.5em] text-[#7F5AF0] mt-16 animate-pulse uppercase glow-text">{loadingMessages[msgIdx]}</p>
          </motion.div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage} 
            initial={{ opacity: 0, filter: 'blur(15px)', scale: 1.03 }} 
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} 
            exit={{ opacity: 0, filter: 'blur(15px)', scale: 0.97 }} 
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </Layout>

      <PremiumBottomNav />

      <AnimatePresence>
        {showInterstitial && (
          <AdBanner 
            type="interstitial" 
            onClose={() => setShowInterstitial(false)} 
          />
        )}
      </AnimatePresence>
    </>
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
