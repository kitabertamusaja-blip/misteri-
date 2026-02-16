
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES & ENUMS ---
export enum Page {
  HOME = 'home',
  DETAIL = 'detail',
  ZODIAC = 'zodiac',
  TRENDING = 'trending',
  FAVORITE = 'favorite'
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

// New Zodiac DB Services
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
    console.error("Gagal simpan zodiak ke DB");
  }
};

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
    return null;
  }
};

const getZodiacFortune = async (zodiac: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Berikan ramalan harian untuk zodiak ${zodiac}. Hari ini: ${new Date().toLocaleDateString('id-ID')}. Fokus pada keberuntungan hari ini.`,
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

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setIsLoading(true);
    
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
    setIsLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="py-6 space-y-10">
      <section className="space-y-6">
        <h2 className="text-5xl font-cinzel font-bold leading-[1.1] tracking-tight">
          Apa pesan <br/>
          <span className="text-[#7F5AF0] drop-shadow-[0_0_10px_rgba(127,90,240,0.5)]">Semesta</span> bagimu?
        </h2>
        <div className="relative group">
          <div className="absolute inset-0 bg-[#7F5AF0]/10 blur-2xl group-focus-within:bg-[#7F5AF0]/20 transition-all"></div>
          <input 
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
            placeholder="Ketik mimpimu semalam..." 
            className="relative w-full bg-[#1A1A2E]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] py-5 pl-14 pr-16 text-white focus:outline-none focus:border-[#7F5AF0]/50 transition-all font-poppins text-base" 
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
          { label: 'Numerik', id: Page.TRENDING, icon: <Zap size={24} />, color: '#2CB67D' }, 
          { label: 'Trens', id: Page.TRENDING, icon: <TrendingUp size={24} />, color: '#E53E3E' }
        ].map(cat => (
          <button key={cat.label} onClick={() => setCurrentPage(cat.id)} className="flex flex-col items-center gap-3 group">
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
              className="flex-shrink-0 w-52 bg-[#1A1A2E]/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-[#7F5AF0]/30 cursor-pointer transition-all shadow-2xl relative overflow-hidden group"
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

      <section 
        onClick={() => setCurrentPage(Page.ZODIAC)} 
        className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] p-8 rounded-[3rem] border border-[#7F5AF0]/20 hover:border-[#7F5AF0]/50 space-y-8 relative overflow-hidden cursor-pointer group transition-all shadow-2xl"
      >
        <div className="absolute -top-10 -right-10 text-[#7F5AF0] opacity-10 transition-transform group-hover:scale-110 duration-700">
          <Sparkles size={200} />
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-2xl font-cinzel font-bold uppercase tracking-wider">Bintang Hari Ini</h3>
            <p className="text-xs text-gray-400 font-poppins mt-1">Siklus keberuntungan sedang berputar.</p>
          </div>
          <div className="bg-[#7F5AF0] p-3 rounded-2xl text-white shadow-xl shadow-[#7F5AF0]/30 group-hover:scale-110 transition-transform">
            <Star size={20} fill="currentColor" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6 relative z-10">
          {['♈', '♉', '♊', '♋'].map((icon, i) => (
            <div key={i} className="text-center group-hover:translate-y-[-5px] transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>
              <span className="text-3xl block mb-2">{icon}</span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{['Aries', 'Taurus', 'Gemini', 'Cancer'][i]}</span>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

const DetailPage = () => {
  const { selectedDream, setCurrentPage, favorites, toggleFavorite } = useAppContext();
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
    
    // 1. Cek DB dulu
    const dbFortune = await fetchZodiacFromDB(nama);
    if (dbFortune) {
      setFortune(dbFortune);
      setIsLoading(false);
      return;
    }

    // 2. Jika tidak ada di DB, panggil Gemini
    const aiResult = await getZodiacFortune(nama);
    if (aiResult) {
      setFortune(aiResult);
      // 3. Simpan ke DB untuk hari ini
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
                <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 px-6 py-2 rounded-full">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFD700]">Ramalan Hari Ini</p>
                </div>
              </div>

              <section className="bg-gradient-to-br from-[#1A1A2E] to-transparent p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-[#FFD700]">
                  <Coffee size={20} />
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em]">Kondisi Umum</h4>
                </div>
                <p className="text-gray-300 leading-relaxed font-poppins italic">"{fortune.umum}"</p>
              </section>

              <div className="grid gap-6">
                <div className="bg-[#7F5AF0]/5 border border-[#7F5AF0]/20 p-7 rounded-[2.5rem] space-y-3">
                  <h4 className="text-[#7F5AF0] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                    <Heart size={16} fill="currentColor" /> Cinta
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-poppins">{fortune.cinta}</p>
                </div>
                <div className="bg-[#2CB67D]/5 border border-[#2CB67D]/20 p-7 rounded-[2.5rem] space-y-3">
                  <h4 className="text-[#2CB67D] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                    <Briefcase size={16} /> Karir
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-poppins">{fortune.karir}</p>
                </div>
                <div className="bg-[#E53E3E]/5 border border-[#E53E3E]/20 p-7 rounded-[2.5rem] space-y-3">
                  <h4 className="text-[#E53E3E] font-bold flex items-center gap-3 text-xs uppercase tracking-[0.2em]">
                    <Coins size={16} /> Keuangan
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-poppins">{fortune.keuangan}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                  <p className="text-[8px] font-bold uppercase text-gray-500 tracking-widest mb-2">Warna Hoki</p>
                  <p className="text-sm font-bold uppercase text-[#FFD700] tracking-widest">{fortune.warna_hoki}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
                  <p className="text-[8px] font-bold uppercase text-gray-500 tracking-widest mb-2">Angka Hoki</p>
                  <p className="text-sm font-bold uppercase text-[#FFD700] tracking-widest">{fortune.angka_hoki}</p>
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

// --- MAIN LAYOUT ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPage, setCurrentPage } = useAppContext();
  const navItems = [
    { id: Page.HOME, icon: Moon, label: 'Home' },
    { id: Page.TRENDING, icon: TrendingUp, label: 'Hits' },
    { id: Page.FAVORITE, icon: Heart, label: 'Favorit' }
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#0F0F1A] text-white selection:bg-[#7F5AF0]/30">
      <header className="px-6 py-5 flex items-center justify-between sticky top-0 z-40 bg-[#0F0F1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage(Page.HOME)}>
          <div className="w-11 h-11 bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] rounded-2xl flex items-center justify-center shadow-xl shadow-[#7F5AF0]/20 group-hover:scale-110 transition-transform">
            <Moon size={22} className="text-white" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold tracking-[0.2em] text-white uppercase">Misteri<span className="text-[#7F5AF0]">+</span></h1>
        </div>
        <button onClick={() => setCurrentPage(Page.ZODIAC)} className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${currentPage === Page.ZODIAC ? 'bg-[#FFD700]/10 border-[#FFD700]/50' : 'bg-[#1A1A2E] border-white/5'}`}>
          <Sparkles size={20} className={currentPage === Page.ZODIAC ? 'text-[#FFD700]' : 'text-[#7F5AF0]'} />
        </button>
      </header>
      
      <main className="flex-1 px-6 pb-28">
        {children}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[calc(28rem-3rem)] h-20 bg-[#1A1A2E]/80 backdrop-blur-2xl border border-white/10 flex items-center justify-around z-50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`flex flex-col items-center gap-1.5 transition-all w-16 relative ${isActive ? 'text-[#7F5AF0]' : 'text-gray-500 hover:text-gray-300'}`}>
              <div className={`p-1 transition-transform duration-300 ${isActive ? 'scale-125 -translate-y-1' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
              {isActive && (
                <motion.div layoutId="nav-glow" className="absolute -bottom-2 w-1 h-1 bg-[#7F5AF0] rounded-full shadow-[0_0_10px_#7F5AF0]" />
              )}
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
