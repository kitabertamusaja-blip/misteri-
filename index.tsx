import React, { useState, useEffect, createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Sparkles, Moon, Sun, Brain, TrendingUp, Search, 
  Heart, Share2, ChevronRight, User, Star, ArrowLeft, 
  Zap, Wallet, Briefcase, HeartPulse
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

/** --- CONSTANTS & MOCK DATA --- **/
const Page = {
  HOME: 'home',
  SEARCH: 'search',
  DETAIL: 'detail',
  ZODIAC: 'zodiac',
  ZODIAC_DETAIL: 'zodiac_detail',
  TEST: 'test',
  TEST_DETAIL: 'test_detail',
  TRENDING: 'trending',
  FAVORITE: 'favorite'
};

const ZODIAC_LIST = [
  { n: 'Aries', t: '21 Mar - 19 Apr', i: '♈' }, { n: 'Taurus', t: '20 Apr - 20 Mei', i: '♉' },
  { n: 'Gemini', t: '21 Mei - 20 Jun', i: '♊' }, { n: 'Cancer', t: '21 Jun - 22 Jul', i: '♋' },
  { n: 'Leo', t: '23 Jul - 22 Agu', i: '♌' }, { n: 'Virgo', t: '23 Agu - 22 Sep', i: '♍' },
  { n: 'Libra', t: '23 Sep - 22 Okt', i: '♎' }, { n: 'Scorpio', t: '23 Okt - 21 Nov', i: '♏' },
  { n: 'Sagittarius', t: '22 Nov - 21 Des', i: '♐' }, { n: 'Capricorn', t: '22 Des - 19 Jan', i: '♑' },
  { n: 'Aquarius', t: '20 Jan - 18 Feb', i: '♒' }, { n: 'Pisces', t: '19 Feb - 20 Mar', i: '♓' }
];

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/** --- CONTEXT --- **/
const AppContext = createContext(undefined);
const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(Page.HOME);
  const [favorites, setFavorites] = useState([]);
  const [selectedDream, setSelectedDream] = useState(null);
  const [selectedZodiac, setSelectedZodiac] = useState(null);
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

  const navigate = (page, data = null) => {
    if (page === Page.DETAIL) {
      setSelectedDream(data);
      setShowInterstitial(true);
    }
    if (page === Page.ZODIAC_DETAIL) setSelectedZodiac(data);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <AppContext.Provider value={{
      currentPage, navigate, favorites, toggleFavorite,
      selectedDream, selectedZodiac, isLoading, setIsLoading,
      showInterstitial, setShowInterstitial
    }}>{children}</AppContext.Provider>
  );
};
const useAppContext = () => useContext(AppContext);

/** --- SHARED UI COMPONENTS --- **/
// Fix: Added default values for 'type' and 'onClose' to satisfy property requirements in component usage.
const AdBanner = ({ type = 'banner', onClose = () => {} }) => {
  if (type === 'interstitial') return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-md">
      <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} className="bg-[#1A1A2E] w-full max-w-sm rounded-3xl border border-[#7F5AF0]/30 overflow-hidden shadow-2xl">
        <div className="bg-[#7F5AF0] p-2 text-[10px] text-center font-bold uppercase tracking-[0.3em]">SPONSORED</div>
        <div className="p-8 text-center space-y-5">
          <div className="text-5xl animate-bounce">💎</div>
          <h3 className="text-2xl font-cinzel font-bold">Rahasia Keberuntungan</h3>
          <p className="text-sm text-gray-400">Buka potensi tersembunyimu hari ini dengan panduan khusus.</p>
          <button onClick={onClose} className="w-full bg-[#7F5AF0] py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(127,90,240,0.4)]">Lanjutkan ke Konten</button>
        </div>
      </motion.div>
    </div>
  );
  return (
    <div className="w-full p-4 bg-[#1A1A2E]/50 border-2 border-dashed border-[#7F5AF0]/10 rounded-2xl flex items-center justify-center my-6">
      <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase italic">Advertisement Space</span>
    </div>
  );
};

// Fix: Provided default values for 'icon' and 'onMore' to prevent 'missing property' errors when they are not passed.
const SectionHeader = ({ title, subtitle, icon: Icon = null, onMore = null }) => (
  <div className="flex justify-between items-end mb-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={18} className="text-[#7F5AF0]" />}
        <h3 className="font-cinzel text-lg font-bold uppercase tracking-wider">{title}</h3>
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{subtitle}</p>
    </div>
    {onMore && <button onClick={onMore} className="text-[#7F5AF0] text-[10px] font-bold uppercase border-b border-[#7F5AF0]/20">Lihat Semua</button>}
  </div>
);

/** --- PAGE COMPONENTS --- **/
const HomePage = () => {
  const { navigate } = useAppContext();
  const trending = [
    { judul: 'Dikejar Ular Besar', id: 1, cat: 'Mistis' },
    { judul: 'Menemukan Emas', id: 2, cat: 'Rezeki' },
    { judul: 'Terbang di Awan', id: 3, cat: 'Kebebasan' }
  ];

  return (
    <div className="py-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <div className="space-y-4">
        <h2 className="text-4xl font-cinzel font-bold leading-[1.1]">Takdir Menanti <br/><span className="text-[#7F5AF0] glow-text">Di Balik Mimpi</span></h2>
        <div onClick={() => navigate(Page.SEARCH)} className="bg-[#1A1A2E] p-5 rounded-2xl border border-white/5 flex items-center gap-4 text-gray-500 cursor-pointer shadow-xl hover:border-[#7F5AF0]/30 transition-all">
          <Search size={22} className="text-[#7F5AF0]" />
          <span className="text-sm">Apa yang kamu mimpikan semalam?</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'Mimpi', p: Page.TRENDING, i: '🔮', c: 'from-purple-500/20' },
          { l: 'Zodiak', p: Page.ZODIAC, i: '♈', c: 'from-blue-500/20' },
          { l: 'Tes', p: Page.TEST, i: '🧠', c: 'from-pink-500/20' },
          { l: 'Hits', p: Page.TRENDING, i: '🔥', c: 'from-orange-500/20' }
        ].map(cat => (
          <button key={cat.l} onClick={() => navigate(cat.p)} className="flex flex-col items-center gap-2 group">
            <div className={`w-16 h-16 bg-[#1A1A2E] bg-gradient-to-t ${cat.c} to-transparent rounded-2xl flex items-center justify-center text-3xl border border-white/5 group-hover:border-[#7F5AF0]/40 transition-all shadow-lg`}>{cat.i}</div>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">{cat.l}</span>
          </button>
        ))}
      </div>

      {/* Trending Mimpi */}
      <section>
        <SectionHeader title="Mimpi Populer" subtitle="Paling banyak dicari hari ini" onMore={() => navigate(Page.TRENDING)} />
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {trending.map((t, idx) => (
            <div key={idx} className="flex-shrink-0 w-40 bg-[#1A1A2E] p-4 rounded-3xl border border-white/5 space-y-3 cursor-pointer" onClick={() => navigate(Page.SEARCH)}>
              <div className="w-10 h-10 bg-[#7F5AF0]/10 rounded-xl flex items-center justify-center text-[#7F5AF0]"><Moon size={20}/></div>
              <h4 className="font-bold text-sm leading-snug line-clamp-2 h-10">{t.judul}</h4>
              <span className="text-[8px] bg-white/5 px-2 py-1 rounded-full text-gray-500 uppercase font-bold tracking-widest">{t.cat}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Zodiak Preview */}
      <section className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] p-6 rounded-[2.5rem] border border-[#7F5AF0]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><Sparkles size={100} /></div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-cinzel font-bold mb-1">Zodiak Hari Ini</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ramalan Bintang 24 Jam</p>
          </div>
          <button onClick={() => navigate(Page.ZODIAC)} className="w-10 h-10 bg-[#7F5AF0] rounded-full flex items-center justify-center shadow-lg shadow-[#7F5AF0]/30"><ChevronRight size={20}/></button>
        </div>
        <div className="flex justify-between items-center px-2">
          {ZODIAC_LIST.slice(0, 5).map(z => (
            <div key={z.n} className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-all cursor-pointer" onClick={() => navigate(Page.ZODIAC)}>
              <span className="text-3xl">{z.i}</span>
              <span className="text-[8px] font-bold uppercase text-gray-500">{z.n}</span>
            </div>
          ))}
          <div className="text-gray-600 text-xs font-bold">+7</div>
        </div>
      </section>
      
      <AdBanner />
    </div>
  );
};

const ZodiacPage = () => {
  const { navigate } = useAppContext();
  return (
    <div className="py-6 space-y-8 animate-in slide-in-from-right duration-500">
      <SectionHeader title="Lingkaran Zodiak" subtitle="Pilih tanda bintangmu" icon={Sparkles} />
      <div className="grid grid-cols-3 gap-4">
        {ZODIAC_LIST.map(z => (
          <button key={z.n} onClick={() => navigate(Page.ZODIAC_DETAIL, z)} className="bg-[#1A1A2E] p-6 rounded-[2rem] border border-white/5 hover:border-[#7F5AF0]/40 transition-all flex flex-col items-center gap-2 group">
            <span className="text-4xl group-hover:scale-110 transition-transform">{z.i}</span>
            <div className="text-center">
              <p className="font-bold text-sm tracking-tight">{z.n}</p>
              <p className="text-[8px] text-gray-500">{z.t}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const ZodiacDetailPage = () => {
  const { selectedZodiac, navigate } = useAppContext();
  if (!selectedZodiac) return null;
  return (
    <div className="py-6 space-y-8 animate-in fade-in duration-500">
      <button onClick={() => navigate(Page.ZODIAC)} className="text-[#7F5AF0] flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16}/> Kembali</button>
      <div className="text-center space-y-2">
        <span className="text-7xl block animate-pulse-glow">{selectedZodiac.i}</span>
        <h2 className="text-4xl font-cinzel font-bold">{selectedZodiac.n}</h2>
        <p className="text-sm text-[#7F5AF0] font-bold uppercase tracking-[0.3em]">{selectedZodiac.t}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {[
          { l: 'Cinta', v: 'Harmoni menyelimuti hubunganmu hari ini. Berikan kejutan kecil.', i: HeartPulse, c: 'text-pink-400' },
          { l: 'Karir', v: 'Fokus pada target jangka panjang, jangan tergoda jalan pintas.', i: Briefcase, c: 'text-blue-400' },
          { l: 'Keuangan', v: 'Rezeki tak terduga mungkin datang melalui relasi lama.', i: Wallet, c: 'text-green-400' }
        ].map(item => (
          <div key={item.l} className="bg-[#1A1A2E] p-6 rounded-3xl border border-white/5 flex gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${item.c}`}><item.i size={24}/></div>
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase mb-1">{item.l}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{item.v}</p>
            </div>
          </div>
        ))}
      </div>
      <AdBanner />
    </div>
  );
};

const TestPage = () => {
  const { navigate } = useAppContext();
  const tests = [
    { n: 'Elemen Jiwa', d: 'Temukan elemen dasar yang menggerakkan batinmu.', i: '🔥' },
    { n: 'Aura Keberuntungan', d: 'Warna aura apa yang menyertaimu hari ini?', i: '🌈' }
  ];
  return (
    <div className="py-6 space-y-6 animate-in slide-in-from-right duration-500">
      <SectionHeader title="Tes Kepribadian" subtitle="Kenali dirimu lebih dalam" icon={Brain} />
      {tests.map(t => (
        <div key={t.n} onClick={() => navigate(Page.TEST_DETAIL, t)} className="bg-[#1A1A2E] p-6 rounded-3xl border border-white/5 flex items-center gap-5 cursor-pointer hover:border-[#7F5AF0]/30 transition-all">
          <div className="text-4xl">{t.i}</div>
          <div className="flex-1">
            <h4 className="font-bold text-lg">{t.n}</h4>
            <p className="text-xs text-gray-500">{t.d}</p>
          </div>
          <ChevronRight className="text-gray-600" />
        </div>
      ))}
    </div>
  );
};

const TestDetailPage = () => {
  const { navigate } = useAppContext();
  const [step, setStep] = useState(0);
  const questions = [
    { q: 'Warna apa yang paling menarik perhatianmu saat ini?', a: ['Ungu Deep', 'Biru Laut', 'Merah Api'] },
    { q: 'Suara alam mana yang paling menenangkanmu?', a: ['Hujan Gerimis', 'Angin Gunung', 'Ombak Pantai'] }
  ];

  if (step >= questions.length) {
    return (
      <div className="py-20 text-center space-y-6 animate-in zoom-in duration-500">
        <div className="text-6xl">✨</div>
        <h2 className="text-3xl font-cinzel font-bold">Analisis Selesai</h2>
        <p className="text-gray-400">Tingkat intuisi spiritualmu berada di level tinggi (85%).</p>
        <button onClick={() => navigate(Page.HOME)} className="bg-[#7F5AF0] px-8 py-4 rounded-2xl font-bold shadow-lg shadow-[#7F5AF0]/30">Kembali ke Beranda</button>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-10 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
          <span>Pertanyaan {step + 1} / {questions.length}</span>
          <span>{Math.round(((step+1)/questions.length)*100)}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#7F5AF0] shadow-[0_0_10px_#7F5AF0]" initial={{width:0}} animate={{width: `${((step+1)/questions.length)*100}%`}} />
        </div>
      </div>
      <h3 className="text-2xl font-cinzel font-bold leading-relaxed">{questions[step].q}</h3>
      <div className="space-y-4">
        {questions[step].a.map((ans, i) => (
          <button key={i} onClick={() => setStep(step + 1)} className="w-full bg-[#1A1A2E] p-5 rounded-2xl border border-white/5 text-left hover:border-[#7F5AF0]/50 hover:bg-[#7F5AF0]/5 transition-all flex justify-between items-center group">
            <span className="font-bold">{ans}</span>
            <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-[#7F5AF0] group-hover:bg-[#7F5AF0]/20" />
          </button>
        ))}
      </div>
    </div>
  );
};

const DetailMimpiPage = () => {
  const { selectedDream, navigate, toggleFavorite, favorites } = useAppContext();
  if (!selectedDream) return null;
  return (
    <div className="py-6 space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(Page.HOME)} className="text-gray-500 hover:text-white transition-all"><ArrowLeft size={24}/></button>
        <div className="flex gap-4">
          <button onClick={() => toggleFavorite(selectedDream.id)}><Heart className={favorites.includes(selectedDream.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'} size={24}/></button>
          <button className="text-gray-500"><Share2 size={24}/></button>
        </div>
      </div>
      
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#7F5AF0] bg-[#7F5AF0]/10 px-4 py-1.5 rounded-full inline-block">{selectedDream.kategori}</span>
        <h1 className="text-4xl font-cinzel font-bold leading-tight">{selectedDream.judul}</h1>
      </div>

      <div className="bg-[#1A1A2E] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative">
        <div className="absolute top-0 left-0 p-4 opacity-10"><Moon size={40}/></div>
        <p className="text-lg italic text-gray-300 border-l-4 border-[#7F5AF0] pl-6 py-2 leading-relaxed">"{selectedDream.ringkasan}"</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-green-500/5 p-6 rounded-3xl border border-green-500/10 space-y-3">
          <h4 className="text-green-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Zap size={14}/> Sisi Terang</h4>
          <p className="text-sm text-gray-400 leading-relaxed">{selectedDream.tafsir_positif}</p>
        </div>
        <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10 space-y-3">
          <h4 className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Moon size={14}/> Peringatan</h4>
          <p className="text-sm text-gray-400 leading-relaxed">{selectedDream.tafsir_negatif}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#7F5AF0] to-[#6b48d1] p-10 rounded-[3rem] text-center shadow-2xl shadow-[#7F5AF0]/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-[10px] uppercase font-bold text-white/60 tracking-[0.4em] mb-2">Angka Keberuntungan</p>
        <p className="text-6xl font-cinzel font-bold tracking-tighter text-white glow-text">{selectedDream.angka}</p>
      </div>
      <AdBanner />
    </div>
  );
};

const SearchPage = () => {
  const { navigate, setIsLoading } = useAppContext();
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setIsLoading(true);
    const res = await (async (prompt) => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Tafsir mimpi: "${prompt}". JSON: { "judul": "...", "ringkasan": "...", "tafsir_positif": "...", "tafsir_negatif": "...", "angka": "...", "kategori": "..." }`,
          config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
      } catch (e) { return null; }
    })(q);
    
    if (res) {
      setResults([ { ...res, id: Date.now() } ]);
    }
    setIsLoading(false);
  };

  return (
    <div className="py-6 space-y-6 animate-in fade-in duration-300">
      <form onSubmit={handleSearch} className="relative group">
        <input autoFocus type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="Tulis mimpimu di sini..." className="w-full bg-[#1A1A2E] border border-white/10 p-6 rounded-[2rem] focus:outline-none focus:border-[#7F5AF0] transition-all text-lg shadow-xl"/>
        <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7F5AF0] p-3 bg-[#7F5AF0]/10 rounded-2xl hover:bg-[#7F5AF0]/20 transition-all"><Search size={24}/></button>
      </form>
      
      {results.length > 0 ? (
        <div className="space-y-4">
          <SectionHeader title="Hasil Analisis" subtitle={`Ditemukan ${results.length} makna`} />
          {results.map(r => (
            <div key={r.id} onClick={() => navigate(Page.DETAIL, r)} className="bg-[#1A1A2E] p-6 rounded-3xl border border-white/5 flex items-center gap-5 hover:border-[#7F5AF0]/40 transition-all cursor-pointer">
              <div className="w-14 h-14 bg-[#7F5AF0]/10 rounded-2xl flex items-center justify-center text-[#7F5AF0]"><Moon size={28}/></div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">{r.judul}</h4>
                <p className="text-xs text-gray-500 line-clamp-2">{r.ringkasan}</p>
              </div>
              <ChevronRight className="text-gray-700" />
            </div>
          ))}
          <AdBanner />
        </div>
      ) : (
        <div className="py-32 text-center opacity-20 grayscale flex flex-col items-center gap-4">
          <Moon size={80} />
          <p className="font-cinzel text-xl uppercase tracking-[0.2em]">Menanti Rahasia Tidurmu</p>
        </div>
      )}
    </div>
  );
};

/** --- APP WRAPPER --- **/
const AppContent = () => {
  const { currentPage, navigate, isLoading, showInterstitial, setShowInterstitial } = useAppContext();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#0F0F1A] text-white relative overflow-hidden font-poppins">
      <header className="p-6 flex items-center justify-between sticky top-0 z-50 bg-[#0F0F1A]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(Page.HOME)}>
          <div className="w-10 h-10 bg-[#7F5AF0] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(127,90,240,0.5)] group-hover:scale-110 transition-transform"><Moon size={22}/></div>
          <h1 className="font-cinzel text-2xl font-bold tracking-widest uppercase">Misteri<span className="text-[#7F5AF0] animate-pulse">++</span></h1>
        </div>
        <button onClick={() => navigate(Page.ZODIAC)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"><User size={20} className="text-gray-400"/></button>
      </header>

      <main className="flex-1 px-6 pb-28">
        {currentPage === Page.HOME && <HomePage />}
        {currentPage === Page.SEARCH && <SearchPage />}
        {currentPage === Page.DETAIL && <DetailMimpiPage />}
        {currentPage === Page.ZODIAC && <ZodiacPage />}
        {currentPage === Page.ZODIAC_DETAIL && <ZodiacDetailPage />}
        {currentPage === Page.TEST && <TestPage />}
        {currentPage === Page.TEST_DETAIL && <TestDetailPage />}
        {currentPage === Page.TRENDING && <div className="py-20 text-center opacity-50 font-cinzel text-xl">Konten Populer Segera Hadir</div>}
        {currentPage === Page.FAVORITE && <div className="py-20 text-center opacity-50 font-cinzel text-xl">Mimpi Tersimpan Belum Tersedia</div>}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-[#1A1A2E]/90 backdrop-blur-2xl border border-white/10 flex items-center justify-around z-50 max-w-md mx-auto rounded-[2.5rem] shadow-2xl">
        {[
          { id: Page.HOME, i: Moon, l: 'Home' },
          { id: Page.SEARCH, i: Search, l: 'Cari' },
          { id: Page.TRENDING, i: TrendingUp, l: 'Trending' },
          { id: Page.FAVORITE, i: Heart, l: 'Favorit' }
        ].map(item => (
          <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center gap-1.5 transition-all ${currentPage === item.id ? 'text-[#7F5AF0] scale-110' : 'text-gray-600'}`}>
            <item.i size={24} strokeWidth={currentPage === item.id ? 2.5 : 2} />
            <span className="text-[8px] font-bold uppercase tracking-widest">{item.l}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-2 border-[#7F5AF0]/20 rounded-full animate-ping" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-[#7F5AF0] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-cinzel text-xl animate-pulse tracking-[0.3em] uppercase">Menyingkap Takdir</p>
          </motion.div>
        )}
      </AnimatePresence>

      {showInterstitial && <AdBanner type="interstitial" onClose={() => setShowInterstitial(false)} />}
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);