
import React, { useState } from 'react';
import Layout from './components/Layout';
import AdBanner from './components/AdBanner';
import { Page } from './types';
import { AppProvider, useAppContext } from './context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';
import { ICONS, MOCK_DREAMS, ZODIAC_LIST, TEST_LIST } from './constants';
import { getDynamicDreamInterpretation } from './services/geminiService';
import { fetchMimpiFromDB, saveMimpiToDB } from './services/api';

// Import Pages
import Home from './pages/Home';
import DetailMimpi from './pages/DetailMimpi';

const AppContent: React.FC = () => {
  const { 
    currentPage, setCurrentPage, 
    isLoading, setIsLoading, 
    showInterstitial, setShowInterstitial,
    setSelectedDream,
    favorites
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState<any>(null);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testStep, setTestStep] = useState(0);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);

    try {
      // 1. Cek MySQL dulu via API
      // fetchMimpiFromDB sekarang mengembalikan [] jika gagal (bukan null)
      const dbResult = await fetchMimpiFromDB(searchQuery);
      
      if (dbResult && dbResult.length > 0) {
          // Jika ada di DB, gunakan data DB (Hemat kuota AI)
          setSelectedDream(dbResult[0]);
          setCurrentPage(Page.DETAIL);
          setShowInterstitial(true);
      } else {
          // 2. Jika tidak ada di DB (atau fetch gagal), panggil Gemini AI
          const aiResult = await getDynamicDreamInterpretation(searchQuery);
          if (aiResult) {
              const newDream = { 
                ...aiResult, 
                id: Date.now(), 
                slug: 'dynamic-' + Date.now(), 
                view_count: 1 
              };
              setSelectedDream(newDream);
              
              // 3. Simpan hasil AI ke MySQL secara background (jangan ditunggu/await)
              saveMimpiToDB(aiResult).catch(err => console.error("Silently failed to sync AI result to DB:", err));
              
              setCurrentPage(Page.DETAIL);
              setShowInterstitial(true);
          }
      }
    } catch (error) {
      console.error("Search logic error:", error);
      // Fallback terakhir: Coba AI jika semuanya gagal
      const aiResult = await getDynamicDreamInterpretation(searchQuery);
      if (aiResult) {
          setSelectedDream({ ...aiResult, id: Date.now(), slug: 'fallback-' + Date.now(), view_count: 1 });
          setCurrentPage(Page.DETAIL);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToDetail = (dream: any) => {
    setSelectedDream(dream);
    setShowInterstitial(true);
    setCurrentPage(Page.DETAIL);
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center p-8 text-center space-y-6"
          >
               <div className="relative">
                  <div className="w-20 h-20 border-t-2 border-[#7F5AF0] rounded-full animate-spin"></div>
                  <ICONS.Dream className="absolute inset-0 m-auto text-[#7F5AF0] animate-pulse" size={32} />
               </div>
               <div className="space-y-2">
                  <p className="font-cinzel text-2xl text-white glow-text">Menyingkap Misteri...</p>
                  <p className="text-sm text-gray-500 leading-relaxed italic max-w-xs mx-auto">Mencari jawaban di dimensi bintang, harap bersabar pencari takdir.</p>
               </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showInterstitial && <AdBanner type="interstitial" onClose={() => setShowInterstitial(false)} />}

      {currentPage === Page.HOME && <Home />}
      {currentPage === Page.DETAIL && <DetailMimpi />}
      
      {currentPage === Page.SEARCH && (
        <div className="py-6 space-y-6">
            <header className="flex items-center gap-4">
                <button onClick={() => setCurrentPage(Page.HOME)} className="text-gray-400">
                    <ICONS.Next size={24} className="rotate-180" />
                </button>
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <input 
                        autoFocus
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Apa mimpimu semalam?"
                        className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#7F5AF0]/50"
                    />
                    <ICONS.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </form>
            </header>
            <div className="space-y-4">
                {MOCK_DREAMS.map((dream, idx) => (
                    <motion.div 
                        key={dream.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigateToDetail(dream)}
                        className="bg-[#1A1A2E] p-4 rounded-2xl border border-white/5 flex gap-4 items-center group cursor-pointer active:scale-95"
                    >
                        <div className="w-14 h-14 bg-mystic-gradient rounded-xl flex items-center justify-center flex-shrink-0 group-hover:glow-purple transition-all">
                            <span className="text-xl">🔮</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">{dream.judul}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{dream.ringkasan}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] text-[#7F5AF0] font-bold uppercase">{dream.kategori}</span>
                                <span className="text-[10px] text-gray-600 flex items-center gap-1"><ICONS.User size={8} /> {dream.view_count} views</span>
                            </div>
                        </div>
                        <ICONS.Next size={14} className="text-gray-700" />
                    </motion.div>
                ))}
            </div>
        </div>
      )}

      {currentPage === Page.ZODIAC && (
        <div className="py-6 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2">
                <h2 className="text-4xl font-cinzel font-bold glow-text">Ramalan <br/><span className="text-[#7F5AF0]">Bintangmu</span></h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Update Hari Ini</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {ZODIAC_LIST.map(z => (
                    <button 
                        key={z.id}
                        onClick={() => setSelectedZodiac(z)}
                        className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 active:scale-90 ${selectedZodiac?.id === z.id ? 'bg-[#7F5AF0] border-[#7F5AF0] shadow-lg shadow-[#7F5AF0]/30' : 'bg-[#1A1A2E] border-white/5 hover:border-white/20'}`}
                    >
                        <span className="text-2xl">{z.icon}</span>
                        <span className="text-[9px] font-bold uppercase">{z.nama}</span>
                    </button>
                ))}
            </div>
            {selectedZodiac && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1A1A2E] p-8 rounded-3xl border border-[#7F5AF0]/30 space-y-8 shadow-2xl"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-6xl">{selectedZodiac.icon}</span>
                        <div>
                            <h3 className="text-3xl font-cinzel font-bold">{selectedZodiac.nama}</h3>
                            <p className="text-[10px] text-[#7F5AF0] font-bold uppercase tracking-widest">{selectedZodiac.tanggal}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-5">
                        {[
                            { label: 'Umum', text: selectedZodiac.deskripsi, icon: <ICONS.Star size={18}/> },
                            { label: 'Cinta', text: selectedZodiac.cinta, icon: <ICONS.Heart size={18}/> },
                            { label: 'Karir', text: selectedZodiac.karir, icon: <ICONS.User size={18}/> },
                            { label: 'Keuangan', text: selectedZodiac.keuangan, icon: '💰' }
                        ].map(item => (
                            <div key={item.label} className="bg-[#0F0F1A] p-5 rounded-2xl border border-white/5 space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#7F5AF0]">{item.label}</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
            <AdBanner type="banner" />
        </div>
      )}

      {currentPage === Page.TEST && (
        <div className="py-6 space-y-8">
            <h2 className="text-4xl font-cinzel font-bold glow-text leading-tight">Tes <br/><span className="text-[#7F5AF0]">Karakter Jiwa</span></h2>
            <div className="space-y-4">
                {TEST_LIST.map(test => (
                    <div key={test.id} className="bg-[#1A1A2E] p-8 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden group">
                        <h3 className="text-2xl font-bold">{test.nama_tes}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{test.deskripsi}</p>
                        <button 
                            onClick={() => { setActiveTest(test); setTestStep(0); }}
                            className="bg-[#7F5AF0] px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-[#7F5AF0]/30"
                        >
                            Mulai
                        </button>
                    </div>
                ))}
            </div>
            {activeTest && (
                <div className="fixed inset-0 z-[100] bg-mystic-gradient p-8 flex flex-col">
                    <header className="flex justify-between items-center mb-16">
                         <h3 className="font-cinzel font-bold text-lg">{activeTest.nama_tes}</h3>
                         <button onClick={() => setActiveTest(null)} className="text-gray-500">Tutup</button>
                    </header>
                    <div className="flex-1 flex flex-col justify-center space-y-12">
                        <div className="space-y-4 text-center">
                            <h4 className="text-2xl font-bold leading-tight font-cinzel">{activeTest.questions[testStep].pertanyaan}</h4>
                        </div>
                        <div className="space-y-4">
                            {activeTest.questions[testStep].opsi.map(opsi => (
                                <button 
                                    key={opsi.label}
                                    onClick={() => {
                                        if (testStep < activeTest.questions.length - 1) setTestStep(testStep + 1);
                                        else setActiveTest(null);
                                    }}
                                    className="w-full bg-[#1A1A2E] border border-white/5 p-6 rounded-3xl text-left hover:border-[#7F5AF0] hover:bg-[#7F5AF0]/5 transition-all flex items-center gap-5"
                                >
                                    <div className="w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center font-cinzel font-bold">{opsi.label}</div>
                                    <span className="font-medium text-gray-300 flex-1">{opsi.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {currentPage === Page.TRENDING && (
          <div className="py-6 space-y-6">
              <h2 className="text-3xl font-cinzel font-bold glow-text">Mimpi <br/><span className="text-[#7F5AF0]">Paling Dicari</span></h2>
              <div className="space-y-4">
                {MOCK_DREAMS.map((dream, idx) => (
                    <div 
                        key={dream.id}
                        onClick={() => navigateToDetail(dream)}
                        className="bg-[#1A1A2E] p-5 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-gray-800 font-cinzel italic">#{idx + 1}</span>
                            <div>
                                <p className="font-bold text-sm">{dream.judul}</p>
                                <p className="text-[10px] text-[#7F5AF0] font-bold uppercase tracking-widest">{dream.view_count} Interaksi</p>
                            </div>
                        </div>
                        <ICONS.Next size={16} className="text-gray-700" />
                    </div>
                ))}
              </div>
          </div>
      )}

      {currentPage === Page.FAVORITE && (
          <div className="py-6 space-y-8">
              <h2 className="text-4xl font-cinzel font-bold glow-text">Koleksi <br/><span className="text-red-500">Misterimu</span></h2>
              {favorites.length === 0 ? (
                  <div className="text-center py-24 space-y-6 opacity-40">
                      <ICONS.Heart size={48} className="mx-auto" />
                      <p className="text-sm font-bold uppercase tracking-widest">Belum ada misteri tersimpan</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                    {MOCK_DREAMS.filter(d => favorites.includes(d.id)).map(dream => (
                        <div 
                            key={dream.id} 
                            onClick={() => navigateToDetail(dream)}
                            className="bg-[#1A1A2E] p-5 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer"
                        >
                            <span className="text-sm font-bold">{dream.judul}</span>
                            <ICONS.Heart size={18} className="text-red-500 fill-red-500" />
                        </div>
                    ))}
                  </div>
              )}
          </div>
      )}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
