
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Sparkles, Moon, Sun, Brain, TrendingUp, Search, 
  Heart, Share2, ChevronRight, User, Star, ArrowLeft, 
  Zap, Wallet, Briefcase, HeartPulse
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { saveMimpiToDB, fetchMimpiFromDB } from './services/api';

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

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/** --- CONTEXT --- **/
const AppContext = createContext<any>(undefined);

const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState(Page.HOME);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedDream, setSelectedDream] = useState<any>(null);
  const [selectedZodiac, setSelectedZodiac] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('m_favs');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('m_favs', JSON.stringify(next));
      return next;
    });
  };

  const navigate = (page: string, data: any = null) => {
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
const AdBanner = ({ type = 'banner', onClose = () => {} }: { type?: string, onClose?: () => void }) => {
  if (type === 'interstitial') return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6">
      <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-[#1A1A2E] w-full max-sm rounded-3xl border border-[#7F5AF0]/50 overflow-hidden shadow-2xl">
        <div className="bg-[#7F5AF0] p-2 text-[10px] text-center font-bold uppercase tracking-[0.3em]">SPONSORED CONTENT</div>
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-[#7F5AF0]/10 rounded-full mx-auto flex items-center justify-center border border-[#7F5AF0]/30">
            <Sparkles size={40} className="text-[#7F5AF0]" />
          </div>
          <div>
            <h3 className="text-2xl font-cinzel font-bold mb-2">Buka Aura Positif</h3>
            <p className="text-sm text-gray-400">Dapatkan panduan spiritual eksklusif untuk membuka jalan rezekimu hari ini.</p>
          </div>
          <button onClick={onClose} className="w-full bg-[#7F5AF0] py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(127,90,240,0.5)] active:scale-95 transition-transform">Lanjutkan Membaca</button>
        </div>
      </motion.div>
    </div>
  );
  return (
    <div className="w-full p-4 bg-[#1A1A2E] border border-white/5 rounded-2xl flex items-center justify-center my-8 shadow-lg">
      <div className="flex flex-col items-center">
        <span className="text-[9px] text-gray-600 font-bold tracking-widest uppercase mb-1">Advertisement</span>
        <div className="text-gray-500 font-cinzel text-sm tracking-widest opacity-40">MISTERI+ PRO ADS</div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, icon: Icon = null, onMore = null }: { title: string, subtitle: string, icon?: any, onMore?: any }) => (
  <div className="flex justify-between items-end mb-5">
    <div>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={20} className="text-[#7F5AF0]" />}
        <h3 className="font-cinzel text-xl font-bold uppercase tracking-wider glow-text">{title}</h3>
      </div>
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{subtitle}</p>
    </div>
    {onMore && <button onClick={onMore} className="text-[#7F5AF0] text-[10px] font-bold uppercase tracking-widest bg-[#7F5AF0]/10 px-3 py-1 rounded-full border border-[#7F5AF0]/20">Semua</button>}
  </div>
);

/** --- PAGE COMPONENTS --- **/
const HomePage = () => {
  const { navigate } = useAppContext();
  const trending = [
    { judul: 'Dikejar Ular Besar', id: 1, cat: 'Mistis' },
    { judul: 'Menemukan Emas', id: 2, cat: 'Rezeki' },
    { judul: 'Terbang Tinggi', id: 3, cat: 'Kebebasan' }
  ];

  return (
    <div className="py-6 space-y-10">
      <div className="space-y-6">
        <h2 className="text-5xl font-cinzel font-bold leading-tight tracking-tight">
          Ungkap <br/>
          <span className="text-[#7F5AF0] glow-text">Rahasia</span> <br/>
          Takdirmu.
        </h2>
        
        <div 
          onClick={() => navigate(Page.SEARCH)} 
          className="bg-[#1A1A2E] p-6 rounded-3xl border border-white/10 flex items-center gap-5 text-gray-500 cursor-pointer shadow-[0_15px_30px_rgba(0,0,0,0.5)] hover:border-[#7F5AF0]/50 transition-all group"
        >
          <div className="bg-[#7F5AF0]/20 p-3 rounded-2xl group-hover:bg-[#7F5AF0] group-hover:text-white transition-all">
            <Search size={24} className="text-[#7F5AF0] group-hover:text-white" />
          </div>
          <span className="text-lg font-medium">Apa mimpimu semalam?</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { l: 'Mimpi', p: Page.TRENDING, i: '🔮', color: '#7F5AF0' },
          { l: 'Zodiak', p: Page.ZODIAC, i: '♈', color: '#3B82F6' },
          { l: 'Tes', p: Page.TEST, i: '🧠', color: '#EC4899' },
          { l: 'Hits', p: Page.TRENDING, i: '🔥', color: '#F59E0B' }
        ].map(cat => (
          <button key={cat.l} onClick={() => navigate(cat.p)} className="flex flex-col items-center gap-3 group">
            <div className="w-16 h-16 bg-[#1A1A2E] rounded-2xl flex items-center justify-center text-3xl border border-white/5 group-hover:scale-110 transition-all shadow-xl group-active:scale-95">
              {cat.i}
            </div>
            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{cat.l}</span>
          </button>
        ))}
      </div>

      <section>
        <SectionHeader title="Mimpi Populer" subtitle="Paling sering dicari" onMore={() => navigate(Page.TRENDING)} />
        <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
          {trending.map((t, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 w-48 bg-[#1A1A2E] p-5 rounded-[2rem] border border-white/5 space-y-4 cursor-pointer shadow-lg active:scale-95 transition-all"
              onClick={() => navigate(Page.SEARCH)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] rounded-2xl flex items-center justify-center text-white shadow-[0_5px_15px_rgba(127,90,240,0.4)]">
                <Moon size={24}/>
              </div>
              <h4 className="font-bold text-base leading-tight h-10 line-clamp-2">{t.judul}</h4>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7F5AF0]"></span>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">{t.cat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section 
        className="bg-[#1A1A2E] p-8 rounded-[2.5rem] border border-[#7F5AF0]/30 relative overflow-hidden shadow-2xl cursor-pointer active:scale-[0.98] transition-all"
        onClick={() => navigate(Page.ZODIAC)}
      >
        <div className="absolute -top-6 -right-6 opacity-5 rotate-12">
          <Sparkles size={120} className="text-[#7F5AF0]" />
        </div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-cinzel font-bold glow-text">Ramalan Zodiak</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Nasibmu hari ini</p>
          </div>
          <div className="w-12 h-12 bg-[#7F5AF0] rounded-full flex items-center justify-center text-white shadow-lg">
            <ChevronRight size={24}/>
          </div>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {ZODIAC_LIST.slice(0, 6).map(z => (
            <div key={z.n} className="flex flex-col items-center gap-2 opacity-40">
              <span className="text-2xl">{z.i}</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter">{z.n}</span>
            </div>
          ))}
        </div>
      </section>
      
      <AdBanner />
    </div>
  );
};

const ZodiacPage = () => {
  const { navigate } = useAppContext();
  return (
    <div className="py-6 space-y-8">
      <SectionHeader title="Lingkaran Nasib" subtitle="Pilih Zodiakmu" icon={Sparkles} />
      <div className="grid grid-cols-3 gap-4">
        {ZODIAC_LIST.map(z => (
          <button 
            key={z.n} 
            onClick={() => navigate(Page.ZODIAC_DETAIL, z)} 
            className="bg-[#1A1A2E] p-6 rounded-[2rem] border border-white/5 hover:border-[#7F5AF0]/50 transition-all flex flex-col items-center gap-3 shadow-lg active:scale-90"
          >
            <span className="text-5xl">{z.i}</span>
            <div className="text-center">
              <p className="font-bold text-sm tracking-tighter">{z.n}</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">{z.t}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const ZodiacDetailPage = () => {
  const { selectedZodiac, navigate } = useAppContext();
  const [fortune, setFortune] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (selectedZodiac) {
      fetchFortune();
    }
  }, [selectedZodiac]);

  const fetchFortune = async () => {
    setLocalLoading(true);
    try {
      const prompt = `Berikan ramalan zodiak harian untuk ${selectedZodiac.n}. 
      Berikan tafsir untuk aspek Cinta, Karir, dan Keuangan. 
      Bahasa: Indonesia. Gaya bahasa: Mistis, inspiratif, dan bijak.
      Kembalikan dalam format JSON murni.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cinta: { type: Type.STRING },
              karir: { type: Type.STRING },
              keuangan: { type: Type.STRING }
            },
            required: ["cinta", "karir", "keuangan"]
          }
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      setFortune(data);
    } catch (e) {
      console.error("Gagal menjemput ramalan:", e);
      setFortune({
        cinta: "Energi kosmik sedang tertutup awan gelap, cobalah kembali nanti.",
        karir: "Fokuslah pada apa yang ada di depan mata.",
        keuangan: "Hemat adalah kunci keselamatan hari ini."
      });
    } finally {
      setLocalLoading(false);
    }
  };

  if (!selectedZodiac) return null;

  return (
    <div className="py-6 space-y-10">
      <button onClick={() => navigate(Page.ZODIAC)} className="text-[#7F5AF0] bg-[#7F5AF0]/10 px-5 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-[#7F5AF0]/20"><ArrowLeft size={16}/> Kembali</button>
      
      <div className="text-center space-y-4">
        <span className="text-8xl block animate-pulse-glow drop-shadow-[0_0_30px_rgba(127,90,240,0.4)]">{selectedZodiac.i}</span>
        <div>
          <h2 className="text-5xl font-cinzel font-bold">{selectedZodiac.n}</h2>
          <p className="text-sm text-[#7F5AF0] font-bold uppercase tracking-[0.5em] mt-2">{selectedZodiac.t}</p>
        </div>
      </div>
      
      {localLoading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#7F5AF0]/20 border-t-[#7F5AF0] rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">Membaca Rasi Bintang...</p>
        </div>
      ) : (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-4">
          {[
            { l: 'Cinta', v: fortune?.cinta, i: HeartPulse, color: '#FF4D94', bg: 'bg-[#FF4D94]/10' },
            { l: 'Karir', v: fortune?.karir, i: Briefcase, color: '#4D94FF', bg: 'bg-[#4D94FF]/10' },
            { l: 'Keuangan', v: fortune?.keuangan, i: Wallet, color: '#4DFF94', bg: 'bg-[#4DFF94]/10' }
          ].map(item => (
            <div key={item.l} className="bg-[#1A1A2E] p-6 rounded-3xl border border-white/5 flex gap-5 items-center shadow-lg">
              <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`} style={{ color: item.color }}>
                <item.i size={28}/>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-1" style={{ color: item.color }}>{item.l}</h4>
                <p className="text-sm text-gray-400 leading-relaxed font-medium">{item.v}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
      <AdBanner />
    </div>
  );
};

const DetailMimpiPage = () => {
  const { selectedDream, navigate, toggleFavorite, favorites } = useAppContext();
  if (!selectedDream) return null;
  return (
    <div className="py-6 space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(Page.HOME)} className="bg-[#1A1A2E] w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 border border-white/10 active:scale-90 transition-all"><ArrowLeft size={24}/></button>
        <div className="flex gap-4">
          <button onClick={() => toggleFavorite(selectedDream.id)} className="bg-[#1A1A2E] w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 transition-all">
            <Heart className={favorites.includes(selectedDream.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'} size={24}/>
          </button>
          <button className="bg-[#1A1A2E] w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 active:scale-90 transition-all"><Share2 size={24}/></button>
        </div>
      </div>
      
      <div className="space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#7F5AF0] bg-[#7F5AF0]/10 px-6 py-2 rounded-full border border-[#7F5AF0]/20 inline-block shadow-sm">{selectedDream.kategori}</span>
        <h1 className="text-5xl font-cinzel font-bold leading-tight glow-text">{selectedDream.judul}</h1>
      </div>

      <div className="bg-[#1A1A2E] p-8 rounded-[3rem] border border-white/5 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-6 opacity-10"><Moon size={60} className="text-[#7F5AF0]" /></div>
        <div className="relative z-10">
          <p className="text-xl font-medium italic text-gray-300 leading-relaxed pl-6 border-l-4 border-[#7F5AF0]">
            "{selectedDream.ringkasan}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#102A20] p-8 rounded-[2rem] border border-green-500/20 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500/20 p-2 rounded-lg text-green-400"><Zap size={18}/></div>
            <h4 className="text-green-400 text-xs font-bold uppercase tracking-[0.3em]">Makna Baik</h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed font-medium">{selectedDream.tafsir_positif}</p>
        </div>

        <div className="bg-[#2A1010] p-8 rounded-[2rem] border border-red-500/20 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400"><Moon size={18}/></div>
            <h4 className="text-red-400 text-xs font-bold uppercase tracking-[0.3em]">Peringatan</h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed font-medium">{selectedDream.tafsir_negatif}</p>
        </div>
      </div>

      <div className="bg-[#7F5AF0] p-10 rounded-[3rem] text-center shadow-[0_20px_40px_rgba(127,90,240,0.4)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
        <p className="text-xs uppercase font-bold text-white/70 tracking-[0.5em] mb-4">Angka Keberuntungan</p>
        <p className="text-7xl font-cinzel font-bold tracking-tighter text-white drop-shadow-xl">{selectedDream.angka}</p>
      </div>

      <AdBanner />
    </div>
  );
};

const SearchPage = () => {
  const { navigate, setIsLoading } = useAppContext();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setIsLoading(true);
    
    // LANGKAH 1: Cari di Database MySQL terlebih dahulu
    console.log("Mencari di database lokal...");
    const dbResults = await fetchMimpiFromDB(q);
    
    if (dbResults && dbResults.length > 0) {
        console.log("Data ditemukan di database!");
        setResults(dbResults);
        setIsLoading(false);
        return;
    }

    // LANGKAH 2: Jika tidak ada di DB, baru tanya Gemini AI
    console.log("Data tidak ada di DB, memanggil Gemini AI...");
    const res = await (async (prompt) => {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Tafsir mimpi: "${prompt}".`,
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
        const dreamData = JSON.parse(response.text || '{}');
        
        // Simpan hasil generate AI ke MySQL untuk pencarian berikutnya
        if (dreamData && dreamData.judul) {
           await saveMimpiToDB(dreamData);
        }
        
        return dreamData;
      } catch (e) { 
        console.error("Search Error:", e);
        return null; 
      }
    })(q);
    
    if (res) {
      setResults([ { ...res, id: Date.now() } ]);
    }
    setIsLoading(false);
  };

  return (
    <div className="py-6 space-y-8">
      <form onSubmit={handleSearch} className="relative">
        <input 
          autoFocus 
          type="text" 
          value={q} 
          onChange={e=>setQ(e.target.value)} 
          placeholder="Tulis mimpimu..." 
          className="w-full bg-[#1A1A2E] border-2 border-white/5 p-7 rounded-[2rem] focus:outline-none focus:border-[#7F5AF0] transition-all text-xl shadow-2xl font-medium"
        />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#7F5AF0] text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-all">
          <Search size={24}/>
        </button>
      </form>
      
      {results.length > 0 ? (
        <div className="space-y-6">
          <SectionHeader title="Analisis Takdir" subtitle={`${results.length} Makna Ditemukan`} />
          {results.map(r => (
            <div 
              key={r.id || r.slug} 
              onClick={() => navigate(Page.DETAIL, r)} 
              className="bg-[#1A1A2E] p-7 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-xl active:scale-95 transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] rounded-[1.2rem] flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Moon size={32}/>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xl mb-1">{r.judul}</h4>
                <p className="text-xs text-gray-500 font-medium line-clamp-1">{r.ringkasan}</p>
              </div>
              <ChevronRight className="text-gray-700" size={24} />
            </div>
          ))}
          <AdBanner />
        </div>
      ) : (
        <div className="py-40 text-center opacity-30 flex flex-col items-center gap-6">
          <Moon size={100} className="text-[#7F5AF0]" />
          <p className="font-cinzel text-2xl uppercase tracking-[0.3em] font-bold">Menanti Rahasia...</p>
        </div>
      )}
    </div>
  );
};

const TestPage = () => {
  const { navigate } = useAppContext();
  const tests = [
    { n: 'Elemen Jiwa', d: 'Ketahui elemen dasar batinmu.', i: '🔥' },
    { n: 'Aura Keberuntungan', d: 'Warna aura penyertamu.', i: '🌈' }
  ];
  return (
    <div className="py-6 space-y-8">
      <SectionHeader title="Cek Kepribadian" subtitle="Kenali Dirimu Lebih Dalam" icon={Brain} />
      <div className="space-y-4">
        {tests.map(t => (
          <div 
            key={t.n} 
            onClick={() => navigate(Page.TEST_DETAIL, t)} 
            className="bg-[#1A1A2E] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 cursor-pointer shadow-xl active:scale-[0.98] transition-all"
          >
            <div className="text-5xl">{t.i}</div>
            <div className="flex-1">
              <h4 className="font-bold text-2xl mb-1">{t.n}</h4>
              <p className="text-sm text-gray-500 font-medium">{t.d}</p>
            </div>
            <ChevronRight className="text-gray-700" size={28} />
          </div>
        ))}
      </div>
    </div>
  );
};

const TestDetailPage = () => {
  const { navigate } = useAppContext();
  const [step, setStep] = useState(0);
  const questions = [
    { q: 'Pilih warna yang paling menenangkanmu:', a: ['Ungu Deep', 'Biru Gelap', 'Merah Marun'] },
    { q: 'Pilih elemen alam favoritmu:', a: ['Angin Kencang', 'Hujan Lebat', 'Tanah Basah'] }
  ];

  if (step >= questions.length) {
    return (
      <div className="py-32 text-center space-y-10">
        <div className="text-8xl drop-shadow-[0_0_20px_#7F5AF0]">✨</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-cinzel font-bold glow-text">Analisis Tuntas</h2>
          <p className="text-gray-400 font-medium text-lg px-10">Intuisi spiritualmu sangat tajam. Kamu memiliki bakat terpendam dalam memahami tanda-tanda alam.</p>
        </div>
        <button onClick={() => navigate(Page.HOME)} className="bg-[#7F5AF0] px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-[#7F5AF0]/40 active:scale-90 transition-all">Selesai</button>
      </div>
    );
  }

  return (
    <div className="py-10 space-y-12 animate-in fade-in duration-300">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold uppercase tracking-widest text-[#7F5AF0]">Progress</span>
          <span className="text-2xl font-cinzel font-bold text-[#7F5AF0]">{Math.round(((step+1)/questions.length)*100)}%</span>
        </div>
        <div className="h-4 w-full bg-[#1A1A2E] rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div className="h-full bg-[#7F5AF0] shadow-[0_0_15px_#7F5AF0]" initial={{width:0}} animate={{width: `${((step+1)/questions.length)*100}%`}} />
        </div>
      </div>
      
      <div className="space-y-10">
        <h3 className="text-3xl font-cinzel font-bold leading-snug">{questions[step].q}</h3>
        <div className="space-y-5">
          {questions[step].a.map((ans, i) => (
            <button 
              key={i} 
              onClick={() => setStep(step + 1)} 
              className="w-full bg-[#1A1A2E] p-7 rounded-[2rem] border border-white/5 text-left active:border-[#7F5AF0] active:bg-[#7F5AF0]/5 transition-all flex justify-between items-center group shadow-xl"
            >
              <span className="text-lg font-bold">{ans}</span>
              <div className="w-8 h-8 rounded-full border-2 border-white/10 group-active:border-[#7F5AF0] group-active:bg-[#7F5AF0]/20" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/** --- APP WRAPPER --- **/
const AppContent = () => {
  const { currentPage, navigate, isLoading, showInterstitial, setShowInterstitial } = useAppContext();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#0F0F1A] text-white relative overflow-hidden font-poppins selection:bg-[#7F5AF0]/30">
      {/* SOLID HEADER */}
      <header className="p-6 flex items-center justify-between sticky top-0 z-50 bg-[#0F0F1A] border-b border-white/5">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(Page.HOME)}>
          <div className="w-12 h-12 bg-[#7F5AF0] rounded-[1rem] flex items-center justify-center shadow-[0_0_20px_rgba(127,90,240,0.4)] transition-transform group-hover:scale-105">
            <Moon size={28} className="text-white"/>
          </div>
          <h1 className="font-cinzel text-2xl font-bold tracking-[0.2em] uppercase">Misteri<span className="text-[#7F5AF0]">++</span></h1>
        </div>
        <button onClick={() => navigate(Page.ZODIAC)} className="w-12 h-12 bg-[#1A1A2E] rounded-2xl flex items-center justify-center border border-white/5 shadow-lg active:scale-90 transition-all">
          <User size={24} className="text-[#7F5AF0]"/>
        </button>
      </header>

      <main className="flex-1 px-6 pb-32">
        {currentPage === Page.HOME && <HomePage />}
        {currentPage === Page.SEARCH && <SearchPage />}
        {currentPage === Page.DETAIL && <DetailMimpiPage />}
        {currentPage === Page.ZODIAC && <ZodiacPage />}
        {currentPage === Page.ZODIAC_DETAIL && <ZodiacDetailPage />}
        {currentPage === Page.TEST && <TestPage />}
        {currentPage === Page.TEST_DETAIL && <TestDetailPage />}
        {currentPage === Page.TRENDING && <div className="py-40 text-center font-cinzel text-2xl opacity-20 uppercase tracking-[0.3em]">Trending Segera Hadir</div>}
        {currentPage === Page.FAVORITE && <div className="py-40 text-center font-cinzel text-2xl opacity-20 uppercase tracking-[0.3em]">Favorit Belum Tersedia</div>}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#1A1A2E] border-t border-white/5 flex items-center justify-around z-50 max-w-md mx-auto rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        {[
          { id: Page.HOME, i: Moon, l: 'Home' },
          { id: Page.SEARCH, i: Search, l: 'Cari' },
          { id: Page.TRENDING, i: TrendingUp, l: 'Hits' },
          { id: Page.FAVORITE, i: Heart, l: 'Simpan' }
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => navigate(item.id)} 
            className={`flex flex-col items-center gap-2 transition-all w-16 ${currentPage === item.id ? 'text-[#7F5AF0] -translate-y-1' : 'text-gray-600'}`}
          >
            <div className={`p-2 rounded-xl ${currentPage === item.id ? 'bg-[#7F5AF0]/10' : ''}`}>
              <item.i size={26} strokeWidth={currentPage === item.id ? 3 : 2} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{item.l}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {isLoading && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center gap-10">
            <div className="relative">
              <div className="w-24 h-24 border-[6px] border-[#7F5AF0]/10 rounded-full" />
              <div className="absolute inset-0 w-24 h-24 border-[6px] border-[#7F5AF0] border-t-transparent rounded-full animate-spin shadow-[0_0_30px_#7F5AF0]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Moon size={32} className="text-[#7F5AF0] animate-pulse" />
              </div>
            </div>
            <p className="font-cinzel text-2xl animate-pulse tracking-[0.5em] uppercase font-bold glow-text">Menerjemah Takdir...</p>
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

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
