
import React from 'react';

interface AdBannerProps {
  type: 'banner' | 'native' | 'interstitial';
  onClose?: () => void;
}

const AdBanner: React.FC<AdBannerProps> = ({ type, onClose }) => {
  if (type === 'interstitial') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="bg-[#1A1A2E] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-[#7F5AF0]/30">
          <div className="bg-[#7F5AF0] p-2 text-xs font-bold text-center tracking-widest">SPONSORED</div>
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-700 rounded-xl mx-auto flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
            <h3 className="text-xl font-bold">Dapatkan Rezeki Nomplok!</h3>
            <p className="text-sm text-gray-400">Unduh aplikasi keberuntungan hari ini dan menangkan hadiah menarik.</p>
            <button 
              onClick={onClose}
              className="w-full bg-[#7F5AF0] hover:bg-[#6b48d1] py-3 rounded-lg font-bold transition-colors"
            >
              Lanjutkan ke Tafsir
            </button>
            <button onClick={onClose} className="text-xs text-gray-500 underline mt-2">Lewati Iklan</button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'native') {
    return (
      <div className="my-6 p-4 bg-[#1A1A2E]/50 border-2 border-dashed border-[#7F5AF0]/20 rounded-xl flex gap-4 items-center">
        <div className="w-16 h-16 bg-gray-800 rounded-lg flex-shrink-0 animate-pulse"></div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between">
             <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase">Ads</span>
          </div>
          <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse"></div>
          <div className="h-3 w-1/2 bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-24 bg-[#1A1A2E] border border-[#7F5AF0]/20 rounded-lg flex items-center justify-center my-4 overflow-hidden relative">
      <span className="text-xs text-gray-600 absolute top-1 left-2 uppercase tracking-tighter">Advertisement</span>
      <div className="text-gray-500 font-bold text-lg animate-pulse">MISTERI+ PREMIUM ADS</div>
    </div>
  );
};

export default AdBanner;
