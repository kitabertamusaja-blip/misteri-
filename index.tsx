
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
  X
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

// --- CONSTANTS ---
const COLORS = {
  bg: '#0F0F1A',
  card: '#1A1A2E',
  cardHover: '#24243E',
  accent: '#7F5AF0',
  accentDark: '#6b48d1',
  highlight: '#2D284D',
  border: '#2A2A3E'
};

const ICONS = {
  Dream: Moon,
  Zodiac: Sparkles,
  Search: Search,
  Heart: Heart,
  Share: Share2,
  Next: ChevronRight,
  Star: Star
};

// --- SERVICES ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const PROD_API_URL = 'https://www.misteri.faciltrix.com/api'; 
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost/misteri-api' : PROD_API_URL; 

const fetchFromDB = async (query: string = '') => {
  try {
    const response = await fetch(`${API_BASE_URL}/search.php?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("DB Error:", e);
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

const getAIInterpretation = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan tafsir mimpi untuk: "${userPrompt}". Bahasa: Indonesia. Nuansa: Mistis, Bijak.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
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
    const saved = localStorage.getItem('misteri_favs_solid');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (slug: string) => {
    setFavorites(prev => {
      const next = prev.includes(slug) ? prev.filter(f => f !== slug) : [...prev, slug];
      localStorage.setItem('misteri_favs_solid', JSON.stringify(next));
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
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6">
        <div className="bg-[#1A1A2E] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[#7F5AF0] relative">
           <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
          <div className="bg-[#7F5AF0] p-2 text-[10px] font-bold text-center tracking-widest text-white uppercase">Sponsor</div>
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#2D284D] rounded-2xl mx-auto flex items-center justify-center text-3xl">🔮</div>
            <h3 className="text-xl font-bold font-cinzel text-white">Buka Tabir Masa Depan</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Dapatkan akses eksklusif ke ramalan bintang harian dan konsultasi spiritual Premium.</p>
            <button onClick={onClose} className="w-full bg-[#7F5AF0] hover:bg-[#6b48d1] py-3 rounded-xl font-bold text-white shadow-lg shadow-[#7F5AF0]/20">Lanjutkan ke Tafsir</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-24 bg-[#1A1A2E] border border-[#2A2A3E] rounded-2xl flex items-center justify-center my-4 overflow-hidden relative group cursor-pointer">
      <div className="absolute top-2 left-2 text-[8px] text-gray-500 font-bold uppercase tracking-widest">Ad</div>
      <div className="text-gray-400 font-bold text-sm tracking-[0.2em] group-hover:text-[#7F5AF0] transition-colors uppercase">Misteri+ Premium</div>
    </div>
  );
};

// --- LAYOUT ---
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPage, setCurrentPage } = useAppContext();
  const navItems = [
    { id: Page.HOME, icon: ICONS.Dream, label: 'Home' },
    { id: Page.TRENDING, icon: TrendingUp, label: 'Hits' },
    { id: Page.FAVORITE, icon: Heart, label: 'Favorit' }
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#0F0F1A] text-white shadow-2xl">
      <header className="p-4 flex items-center justify-between sticky top-0 z-40 bg-[#0F0F1A] border-b border-[#1A1A2E]">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage(Page.HOME)}>
          <div className="w-10 h-10 bg-[#7F5AF0] rounded-2xl flex items-center justify-center shadow-lg">
            <ICONS.Dream size={22} className="text-white" />
          </div>
          <h1 className="font-cinzel text-xl font-bold tracking-widest text-white">MISTERI<span className="text-[#7F5AF0]">+</span></h1>
        </div>
        <button onClick={() => setCurrentPage(Page.ZODIAC)} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1A1A2E] border border-[#2A2A3E] hover:border-[#7F5AF0] transition-colors">
          <Sparkles size={20} className="text-[#7F5AF0]" />
        </button>
      </header>
      <main className="flex-1 px-5 pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0F0F1A] border-t border-[#1A1A2E] flex items-center justify-around z-50 max-w-md mx-auto px-4 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} className={`flex flex-col items-center gap-1.5 transition-all w-14 ${isActive ? 'text-[#7F5AF0]' : 'text-gray-500'}`}>
              <div className={`p-1 ${isActive ? 'scale-110' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

// --- PAGES ---
const Home = () => {
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 space-y-8">
      <div className="space-y-4">
        <h2 className="text-4xl font-cinzel font-bold leading-tight">Apa pesan <br/><span className="text-[#7F5AF0]">Semesta</span> bagimu?</h2>
        <div className="relative">
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Ketik mimpimu semalam..." className="w-full bg-[#1A1A2E] border border-[#2A2A3E] rounded-2xl py-4 pl-12 pr-12 text-white focus:outline-none focus:border-[#7F5AF0] transition-all" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#7F5AF0] rounded-xl text-white"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[{ label: 'Tafsir', id: Page.HOME, icon: '🔮' }, { label: 'Zodiak', id: Page.ZODIAC, icon: '♈' }, { label: 'Ramal', id: Page.TRENDING, icon: '🧠' }, { label: 'Hits', id: Page.TRENDING, icon: '🔥' }].map(cat => (
          <button key={cat.label} onClick={() => setCurrentPage(cat.id)} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#1A1A2E] rounded-2xl flex items-center justify-center border border-[#2A2A3E] hover:border-[#7F5AF0] transition-all"><span className="text-2xl">{cat.icon}</span></div>
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">{cat.label}</span>
          </button>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#7F5AF0] rounded-full"></div>
            <h3 className="text-lg font-bold font-cinzel tracking-wider uppercase">Mimpi Populer</h3>
          </div>
          <button onClick={() => setCurrentPage(Page.TRENDING)} className="text-[#7F5AF0] text-[10px] font-bold uppercase tracking-widest">Semua</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {trendingDreams.length > 0 ? trendingDreams.map(dream => (
            <div key={dream.slug} onClick={() => { setSelectedDream(dream); saveMimpiToDB(dream); setShowInterstitial(true); setCurrentPage(Page.DETAIL); }} className="flex-shrink-0 w-44 bg-[#1A1A2E] p-5 rounded-3xl border border-[#2A2A3E] space-y-4 hover:border-[#7F5AF0] cursor-pointer transition-all active:scale-95">
              <div className="w-10 h-10 bg-[#2D284D] rounded-xl flex items-center justify-center text-[#7F5AF0]"><ICONS.Dream size={20} /></div>
              <p className="font-bold text-sm leading-tight h-10 line-clamp-2">{dream.judul}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{dream.kategori}</p>
            </div>
          )) : (
            <div className="w-full py-10 text-center text-gray-500 text-xs italic">Memanggil energi mistis...</div>
          )}
        </div>
      </div>

      <AdBanner type="banner" />

      <div onClick={() => setCurrentPage(Page.ZODIAC)} className="bg-[#1A1A2E] p-6 rounded-3xl border border-[#2A2A3E] hover:border-[#7F5AF0] space-y-6 relative overflow-hidden cursor-pointer group transition-all">
        <div className="absolute -top-6 -right-6 text-[#7F5AF0] opacity-5 transition-transform group-hover:scale-110 duration-500"><Sparkles size={140} /></div>
        <div className="flex justify-between items-start relative z-10">
          <div><h3 className="text-xl font-bold font-cinzel">Bintangmu Hari Ini</h3><p className="text-xs text-gray-400">Cek keberuntungan zodiakmu.</p></div>
          <div className="bg-[#7F5AF0] p-2 rounded-xl text-white"><Star size={16} /></div>
        </div>
        <div className="grid grid-cols-4 gap-4 relative z-10">
          {[{ id: 1, nama: 'Aries', icon: '♈' }, { id: 2, nama: 'Taurus', icon: '♉' }, { id: 3, nama: 'Gemini', icon: '♊' }, { id: 4, nama: 'Cancer', icon: '♋' }].map(z => <div key={z.id} className="text-center"><span className="text-2xl block mb-1">{z.icon}</span><span className="text-[8px] text-gray-400 font-bold uppercase">{z.nama}</span></div>)}
        </div>
      </div>
    </motion.div>
  );
};

const DetailMimpi = () => {
  const { selectedDream, setCurrentPage, favorites, toggleFavorite } = useAppContext();
  if (!selectedDream) return null;

  return (
    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="py-6 space-y-8">
      <button onClick={() => setCurrentPage(Page.HOME)} className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest"><ChevronRight size={16} className="rotate-180" /> Kembali</button>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F5AF0] bg-[#2D284D] px-4 py-1.5 rounded-full border border-[#7F5AF0]">{selectedDream.kategori}</span>
          <div className="flex gap-2">
            <button onClick={() => toggleFavorite(selectedDream.slug)} className="p-2.5 bg-[#1A1A2E] rounded-full border border-[#2A2A3E] active:scale-90 transition-transform"><Heart size={18} className={favorites.includes(selectedDream.slug) ? 'text-red-500 fill-red-500' : 'text-gray-500'} /></button>
            <button className="p-2.5 bg-[#1A1A2E] rounded-full border border-[#2A2A3E] text-gray-500"><Share2 size={18} /></button>
          </div>
        </div>
        <h1 className="text-4xl font-cinzel font-bold leading-tight tracking-wide">{selectedDream.judul}</h1>
      </div>
      <div className="bg-[#1A1A2E] p-7 rounded-3xl border border-[#2A2A3E]"><p className="text-gray-200 italic border-l-4 border-[#7F5AF0] pl-5 text-lg leading-relaxed font-poppins">"{selectedDream.ringkasan}"</p></div>
      <div className="grid gap-5">
        <div className="bg-[#1A2E1A] border border-green-900/50 p-7 rounded-3xl space-y-4">
          <h4 className="text-green-400 font-bold flex items-center gap-2 text-sm uppercase tracking-widest"><Star size={16} /> Sisi Terang</h4>
          <p className="text-sm text-gray-300 leading-relaxed font-light">{selectedDream.tafsir_positif}</p>
        </div>
        <div className="bg-[#2E1A1A] border border-red-900/50 p-7 rounded-3xl space-y-4">
          <h4 className="text-red-400 font-bold flex items-center gap-2 text-sm uppercase tracking-widest"><Moon size={16} /> Peringatan</h4>
          <p className="text-sm text-gray-300 leading-relaxed font-light">{selectedDream.tafsir_negatif}</p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#7F5AF0] to-[#6b48d1] p-10 rounded-[3rem] flex justify-between items-center shadow-xl relative overflow-hidden">
        <div className="z-10 text-white"><h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 mb-2">Angka Mistis</h4><p className="text-5xl font-cinzel font-bold tracking-[0.1em]">{selectedDream.angka}</p></div>
        <div className="text-6xl z-10">🔮</div>
      </div>
      <AdBanner type="banner" />
    </motion.div>
  );
};

// --- APP CONTENT ---
const AppContent = () => {
  const { currentPage, isLoading, showInterstitial, setShowInterstitial } = useAppContext();
  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME: return <Home />;
      case Page.DETAIL: return <DetailMimpi />;
      default: return (<div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5"><div className="text-7xl">🔮</div><h2 className="text-2xl font-cinzel font-bold tracking-widest uppercase text-[#7F5AF0]">MEMBUKA ENERGI...</h2><p className="text-gray-500 max-w-[200px] text-sm italic">Ruang mistis ini sedang dipersiapkan untuk Anda.</p></div>);
    }
  };
  return (
    <Layout>
      <AnimatePresence mode="wait">{showInterstitial && <AdBanner type="interstitial" onClose={() => setShowInterstitial(false)} />}</AnimatePresence>
      {isLoading && (<div className="fixed inset-0 z-[60] bg-[#0F0F1A] flex flex-col items-center justify-center"><Loader2 className="w-12 h-12 text-[#7F5AF0] animate-spin mb-4" /><p className="font-cinzel text-lg tracking-widest text-[#7F5AF0] animate-pulse">MENYINGKAP TAKDIR...</p></div>)}
      <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
    </Layout>
  );
};

// --- RENDER ---
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<AppProvider><AppContent /></AppProvider>);
