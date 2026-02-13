
import React from 'react';
import { motion } from 'framer-motion';
import { ICONS, MOCK_DREAMS } from '../constants';
import { Page } from '../types';
import { useAppContext } from '../context/AppContext';
import AdBanner from '../components/AdBanner';

const DetailMimpi: React.FC = () => {
  const { selectedDream, setCurrentPage, setSelectedDream, setShowInterstitial, favorites, toggleFavorite } = useAppContext();

  if (!selectedDream) return null;

  const navigateToDetail = (dream: any) => {
    setSelectedDream(dream);
    setShowInterstitial(true);
    setCurrentPage(Page.DETAIL);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="py-6 space-y-6"
    >
        <button 
            onClick={() => setCurrentPage(Page.HOME)}
            className="flex items-center gap-2 text-gray-400 text-xs mb-4"
        >
            <ICONS.Next size={16} className="rotate-180" /> Kembali ke Beranda
        </button>

        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7F5AF0] bg-[#7F5AF0]/10 px-3 py-1 rounded-full">
                    {selectedDream.kategori}
                </span>
                <div className="flex gap-3">
                    <button onClick={() => toggleFavorite(selectedDream.id)} className="p-2 bg-white/5 rounded-full">
                        <ICONS.Heart size={18} className={favorites.includes(selectedDream.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'} />
                    </button>
                    <button className="p-2 bg-white/5 rounded-full text-gray-500">
                        <ICONS.Share size={18} />
                    </button>
                </div>
            </div>
            <h1 className="text-4xl font-cinzel font-bold leading-tight">{selectedDream.judul}</h1>
        </div>

        <section className="space-y-4">
            <div className="bg-[#1A1A2E] p-6 rounded-2xl border border-white/5 shadow-inner">
                <p className="text-gray-300 leading-relaxed italic border-l-4 border-[#7F5AF0] pl-4 text-lg">
                    "{selectedDream.ringkasan}"
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl space-y-3">
                    <h4 className="text-green-400 font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                        <ICONS.Star size={16} /> Sisi Terang (Positif)
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{selectedDream.tafsir_positif}</p>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl space-y-3">
                    <h4 className="text-red-400 font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                        <ICONS.Moon size={16} /> Sisi Gelap (Peringatan)
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{selectedDream.tafsir_negatif}</p>
                </div>
            </div>
        </section>

        <div className="bg-gradient-to-r from-[#7F5AF0] to-[#6b48d1] p-8 rounded-3xl flex justify-between items-center shadow-xl shadow-[#7F5AF0]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="z-10">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-1">Angka Keberuntungan</h4>
                <p className="text-4xl font-cinzel font-bold text-white tracking-widest glow-text">{selectedDream.angka}</p>
            </div>
            <div className="text-5xl animate-bounce">🔮</div>
        </div>

        <AdBanner type="banner" />

        <section className="space-y-5">
            <h3 className="text-lg font-bold px-1">Mimpi yang Serupa</h3>
            <div className="space-y-3">
                {MOCK_DREAMS.filter(d => d.id !== selectedDream.id).map(dream => (
                    <div 
                        key={dream.id} 
                        onClick={() => navigateToDetail(dream)}
                        className="bg-[#1A1A2E]/40 p-5 rounded-2xl flex items-center justify-between cursor-pointer border border-white/5 hover:border-[#7F5AF0]/30 transition-all"
                    >
                        <span className="text-sm font-medium">{dream.judul}</span>
                        <ICONS.Next size={16} className="text-gray-600" />
                    </div>
                ))}
            </div>
        </section>
    </motion.div>
  );
};

export default DetailMimpi;
