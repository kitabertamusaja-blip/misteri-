import React from 'react';
import { motion } from 'framer-motion';
import { ICONS, MOCK_DREAMS, ZODIAC_LIST } from '../constants.tsx';
import { Page } from '../types.ts';
import { useAppContext } from '../context/AppContext.tsx';
import SectionTitle from '../components/ui/SectionTitle.tsx';
import AdBanner from '../components/AdBanner.tsx';

const Home: React.FC = () => {
  const { setCurrentPage, setSelectedDream, setShowInterstitial } = useAppContext();

  const navigateToDetail = (dream: any) => {
    setSelectedDream(dream);
    setShowInterstitial(true);
    setCurrentPage(Page.DETAIL);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-6"
    >
      <section className="space-y-6">
        <h2 className="text-4xl font-cinzel font-bold glow-text leading-tight">
          Apa pesan <br/>
          <span className="text-[#7F5AF0]">Semesta</span> bagimu?
        </h2>
        <div 
          onClick={() => setCurrentPage(Page.SEARCH)}
          className="w-full bg-[#1A1A2E] border border-white/10 rounded-2xl py-4 px-12 flex items-center gap-3 cursor-pointer hover:border-[#7F5AF0]/30 transition-all glow-purple relative"
        >
          <ICONS.Search className="text-gray-500" size={20} />
          <span className="text-gray-500 text-sm">Cari arti mimpimu semalam...</span>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#7F5AF0]/10 p-1.5 rounded-lg">
             <ICONS.Next size={14} className="text-[#7F5AF0]" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-3">
        {[
            { label: 'Mimpi', id: Page.TRENDING, icon: '🔮' },
            { label: 'Zodiak', id: Page.ZODIAC, icon: '♈' },
            { label: 'Tes', id: Page.TEST, icon: '🧠' },
            { label: 'Populer', id: Page.TRENDING, icon: '🔥' }
        ].map((cat) => (
            <button 
                key={cat.label} 
                onClick={() => setCurrentPage(cat.id)}
                className="flex flex-col items-center gap-2 group"
            >
                <div className="w-14 h-14 bg-[#1A1A2E] rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-[#7F5AF0]/50 transition-all">
                    <span className="text-2xl">{cat.icon}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{cat.label}</span>
            </button>
        ))}
      </section>

      <section className="space-y-4">
        <SectionTitle 
          rightElement={<button onClick={() => setCurrentPage(Page.TRENDING)} className="text-[#7F5AF0] text-[10px] font-bold uppercase">Semua</button>}
        >
          Mimpi Populer
        </SectionTitle>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x">
            {MOCK_DREAMS.map(dream => (
                <div 
                    key={dream.id} 
                    onClick={() => navigateToDetail(dream)}
                    className="snap-center flex-shrink-0 w-44 bg-[#1A1A2E] p-4 rounded-2xl border border-white/5 space-y-3 cursor-pointer transition-transform"
                >
                    <div className="w-10 h-10 bg-[#7F5AF0]/10 rounded-xl flex items-center justify-center text-[#7F5AF0]">
                        <ICONS.Dream size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-sm line-clamp-2 leading-tight h-10">{dream.judul}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase">{dream.kategori}</p>
                    </div>
                </div>
            ))}
        </div>
      </section>

      <AdBanner type="banner" />

      <section 
        onClick={() => setCurrentPage(Page.ZODIAC)}
        className="bg-gradient-to-br from-[#1A1A2E] to-[#0F0F1A] p-6 rounded-3xl border border-[#7F5AF0]/20 space-y-5 relative overflow-hidden cursor-pointer"
      >
        <div className="absolute -top-4 -right-4 p-4 opacity-5">
            <ICONS.Zodiac size={120} />
        </div>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold font-cinzel">Zodiak Hari Ini</h3>
                <p className="text-xs text-gray-400">Intip keberuntungan bintangmu.</p>
            </div>
            <div className="bg-[#7F5AF0] p-2 rounded-xl shadow-lg shadow-[#7F5AF0]/30">
                <ICONS.Star size={16} className="text-white" />
            </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
            {ZODIAC_LIST.slice(0, 4).map(z => (
                <div key={z.id} className="text-center space-y-1 flex flex-col items-center">
                    <span className="text-2xl block">{z.icon}</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase">{z.nama}</span>
                </div>
            ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Home;