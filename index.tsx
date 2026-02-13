import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Sparkles, Moon, Sun, Brain, TrendingUp, Search, 
  Heart, Share2, ChevronRight, User, Star 
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

/** --- CONFIG & TYPES --- **/
const COLORS = { primary: '#7F5AF0', bg: '#0F0F1A', card: '#1A1A2E' };
enum Page { HOME = 'home', SEARCH = 'search', DETAIL = 'detail', ZODIAC = 'zodiac', TEST = 'test', TRENDING = 'trending', FAVORITE = 'favorite' }

/** --- ICONS --- **/
const ICONS = {
  Dream: Moon, Zodiac: Sparkles, Test: Brain, Trending: TrendingUp, Search, 
  Heart, Share: Share2, Next: ChevronRight, User, Star, Moon, Sun
};

/** --- API & SERVICES --- **/
const API_BASE_URL = window.location.origin + '/api';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getDynamicDreamInterpretation = async (userPrompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Berikan tafsir mimpi untuk: "${userPrompt}". Format JSON: { "judul": "...", "ringkasan": "...", "tafsir_positif": "...", "tafsir_negatif": "...", "angka": "...", "kategori": "..." }`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judul: { type: Type.STRING }, ringkasan: { type: Type.STRING },
            tafsir_positif: { type: Type.STRING }, tafsir_negatif: { type: Type.STRING },
            angka: { type: Type.STRING }, kategori: { type: Type.STRING }
          },
          required: ["judul", "ringkasan", "tafsir_positif", "tafsir_negatif", "angka", "kategori"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) { return null; }
};

/** --- CONTEXT --- **/
const AppContext = createContext(undefined);
const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(Page.HOME);
  const [favorites, setFavorites] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('m_favs');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('m_favs', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage, favorites, toggleFavorite,
      selectedDream, setSelectedDream, isLoading, setIsLoading,
      showInterstitial, setShowInterstitial
    }}>{children}</AppContext.Provider>
  );
};
const useAppContext = () => useContext(AppContext);

/** --- UI COMPONENTS --- **/
const SectionTitle = ({ children, icon, rightElement }) => (
  <div className="flex justify-between items-center mb-4 px-1">
    <div className="flex items-center gap-3">
      <div className="w-1 h-6 bg-[#7F5AF0] rounded-full"></div>
      <h3 className="text-lg font-bold flex items-center gap-2">{icon}{children}</h3>
    </div>
    {rightElement}
  </div>
);

const AdBanner = ({ type, onClose }) => {
  if (type === 'interstitial') return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
      <div className="bg-[#1A1A2E] w-full max-w-sm rounded-2xl border border-[#7F5AF0]/30 overflow-hidden">
        <div className="bg-[#7F5AF0] p-2 text-[10px] text-center font-bold uppercase">Sponsored</div>
        <div className="p-8 text-center space-y-4">
          <div className="text-4xl">🎁</div>
          <h3 className="text-xl font-bold">Cek Keberuntunganmu!</h3>
          <p className="text-sm text-gray-400">Dapatkan prediksi eksklusif hari ini.</p>
          <button onClick={onClose} className="w-full bg-[#7F5AF0] py-3 rounded-xl font-bold">Lanjutkan</button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="w-full h-24 bg-[#1A1A2E] border border-white/5 rounded-2xl flex items-center justify-center my-4">
      <span className="text-xs text-gray-600">ADVERTISEMENT</span>
    </div>
  );
};

/** --- LAYOUT --- **/
const Layout = ({ children, currentPage, onNavigate }) => {
  const navItems = [
    { id: Page.HOME, icon: ICONS.Dream, label: 'Home' },
    { id: Page.SEARCH, icon: ICONS.Search, label: 'Cari' },
    { id: Page.TRENDING, icon: ICONS.Trending, label: 'Hits' },
    { id: Page.FAVORITE, icon: ICONS.Heart, label: 'Favorit' }
  ];
  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-mystic-gradient relative">
      <header className="p-4 flex items-center justify-between sticky top-0 z-50 bg-[#0F0F1A]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate(Page.HOME)}>
          <div className="w-9 h-9 bg-[#7F5AF0] rounded-xl flex items-center justify-center shadow-lg"><ICONS.Dream size={20}/></div>
          <h1 className="font-cinzel text-xl font-bold tracking-widest uppercase">Misteri<span className="text-[#7F5AF0]">+</span></h1>
        </div>
        <button onClick={() => onNavigate(Page.ZODIAC)}><ICONS.Zodiac className="text-gray-400" size={22}/></button>
      </header>
      <main className="flex-1 px-4 pb-24">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#1A1A2E]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-50 max-w-md mx-auto rounded-t-3xl">
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex flex-col items-center gap-1 ${currentPage === item.id ? 'text-[#7F5AF0]' : 'text-gray-500'}`}>
            <item.icon size={22} />
            <span className="text-[9px] font-bold uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

/** --- PAGES --- **/
const HomePage = () => {
  const { setCurrentPage, setSelectedDream, setShowInterstitial } = useAppContext();
  return (
    <div className="py-6 space-y-8 animate-in fade-in duration-500">
      <h2 className="text-4xl font-cinzel font-bold leading-tight">Apa pesan<br/><span className="text-[#7F5AF0]">Semesta</span> bagimu?</h2>
      <div onClick={() => setCurrentPage(Page.SEARCH)} className="bg-[#1A1A2E] p-4 rounded-2xl border border-white/10 flex items-center gap-3 text-gray-500 cursor-pointer">
        <ICONS.Search size={20}/> <span>Cari arti mimpimu...</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Mimpi', p:Page.TRENDING, i:'🔮'}, {l:'Zodiak', p:Page.ZODIAC, i:'♈'}, {l:'Tes', p:Page.TEST, i:'🧠'}, {l:'Hits', p:Page.TRENDING, i:'🔥'}].map(c=>(
          <button key={c.l} onClick={()=>setCurrentPage(c.p)} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#1A1A2E] rounded-2xl flex items-center justify-center text-2xl border border-white/5">{c.i}</div>
            <span className="text-[10px] font-bold uppercase text-gray-400">{c.l}</span>
          </button>
        ))}
      </div>
      <section className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] p-6 rounded-3xl border border-[#7F5AF0]/20 space-y-4" onClick={()=>setCurrentPage(Page.ZODIAC)}>
        <h3 className="text-xl font-bold font-cinzel">Zodiak Hari Ini</h3>
        <p className="text-xs text-gray-400">Keberuntungan menantimu di antara bintang.</p>
        <div className="flex gap-4 overflow-x-auto py-2">
          {['♈','♉','♊','♋','♌'].map(z => <span key={z} className="text-3xl">{z}</span>)}
        </div>
      </section>
    </div>
  );
};

const DetailMimpiPage = () => {
  const { selectedDream, setCurrentPage, toggleFavorite, favorites } = useAppContext();
  if (!selectedDream) return null;
  return (
    <div className="py-6 space-y-6 animate-in slide-in-from-right duration-500">
      <button onClick={() => setCurrentPage(Page.HOME)} className="text-gray-500 text-xs flex items-center gap-1"><ICONS.Next size={14} className="rotate-180"/> Kembali</button>
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-cinzel font-bold">{selectedDream.judul}</h1>
        <button onClick={() => toggleFavorite(selectedDream.id)}><ICONS.Heart className={favorites.includes(selectedDream.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'}/></button>
      </div>
      <div className="bg-[#1A1A2E] p-6 rounded-2xl border-l-4 border-[#7F5AF0] italic text-gray-300">"{selectedDream.ringkasan}"</div>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-green-500/5 p-5 rounded-2xl border border-green-500/20">
          <h4 className="text-green-400 text-xs font-bold uppercase mb-2">Tafsir Positif</h4>
          <p className="text-sm text-gray-400">{selectedDream.tafsir_positif}</p>
        </div>
        <div className="bg-red-500/5 p-5 rounded-2xl border border-red-500/20">
          <h4 className="text-red-400 text-xs font-bold uppercase mb-2">Peringatan</h4>
          <p className="text-sm text-gray-400">{selectedDream.tafsir_negatif}</p>
        </div>
      </div>
      <div className="bg-[#7F5AF0] p-8 rounded-3xl text-center shadow-xl">
        <p className="text-[10px] uppercase font-bold text-white/50">Angka Keberuntungan</p>
        <p className="text-5xl font-cinzel font-bold tracking-tighter">{selectedDream.angka}</p>
      </div>
    </div>
  );
};

/** --- APP MAIN --- **/
const AppContent = () => {
  const { currentPage, setCurrentPage, isLoading, setIsLoading, showInterstitial, setShowInterstitial, setSelectedDream } = useAppContext();
  const [q, setQ] = useState('');

  const doSearch = async (e) => {
    e.preventDefault();
    if(!q.trim()) return;
    setIsLoading(true);
    const res = await getDynamicDreamInterpretation(q);
    if(res) {
      setSelectedDream({...res, id: Date.now()});
      setCurrentPage(Page.DETAIL);
      setShowInterstitial(true);
    }
    setIsLoading(false);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#7F5AF0] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-cinzel text-xl animate-pulse">Menyingkap Takdir...</p>
          </motion.div>
        )}
      </AnimatePresence>
      {showInterstitial && <AdBanner type="interstitial" onClose={()=>setShowInterstitial(false)} />}
      
      {currentPage === Page.HOME && <HomePage />}
      {currentPage === Page.DETAIL && <DetailMimpiPage />}
      {currentPage === Page.SEARCH && (
        <div className="py-6 space-y-6">
          <form onSubmit={doSearch} className="relative">
            <input autoFocus type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Apa mimpimu?" className="w-full bg-[#1A1A2E] border border-white/10 p-4 rounded-xl focus:outline-none focus:border-[#7F5AF0]"/>
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2"><ICONS.Search size={20}/></button>
          </form>
          <div className="space-y-4 opacity-50 text-center py-20">
            <ICONS.Dream size={48} className="mx-auto mb-4"/>
            <p className="text-sm">Ketuk tombol cari untuk menafsirkan misteri malammu.</p>
          </div>
        </div>
      )}
      {currentPage === Page.TRENDING && <div className="py-10 text-center text-gray-500">Fitur Trending segera hadir...</div>}
      {currentPage === Page.ZODIAC && <div className="py-10 text-center text-gray-500">Fitur Zodiak segera hadir...</div>}
      {currentPage === Page.FAVORITE && <div className="py-10 text-center text-gray-500">Belum ada koleksi favorit.</div>}
    </Layout>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
