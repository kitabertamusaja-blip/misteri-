
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppProvider, useAppContext } from './context/AppContext.tsx';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import DetailMimpi from './pages/DetailMimpi.tsx';
import { Page } from './types.ts';
import AdBanner from './components/AdBanner.tsx';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Komponen Page Wrapper untuk animasi transisi antar halaman
 */
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

/**
 * Placeholder untuk halaman yang sedang dikembangkan
 */
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
    <div className="text-6xl animate-bounce">🔮</div>
    <h2 className="text-2xl font-cinzel font-bold">{title}</h2>
    <p className="text-gray-500 max-w-xs">Energi mistis sedang dikumpulkan untuk halaman ini. Kembali lagi nanti.</p>
  </div>
);

const AppContent = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    showInterstitial, 
    setShowInterstitial 
  } = useAppContext();

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME:
        return <Home />;
      case Page.DETAIL:
        return <DetailMimpi />;
      case Page.SEARCH:
        return <PlaceholderPage title="Pencarian Tafsir" />;
      case Page.ZODIAC:
        return <PlaceholderPage title="Ramalan Zodiak" />;
      case Page.TRENDING:
        return <PlaceholderPage title="Tafsir Populer" />;
      case Page.FAVORITE:
        return <PlaceholderPage title="Favorit Saya" />;
      case Page.TEST:
        return <PlaceholderPage title="Tes Kepribadian" />;
      default:
        return <Home />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      <AnimatePresence mode="wait">
        {showInterstitial && (
          <AdBanner 
            type="interstitial" 
            onClose={() => setShowInterstitial(false)} 
          />
        )}
      </AnimatePresence>
      
      <main className="pb-10">
        {renderPage()}
      </main>
    </Layout>
  );
};

// Mount aplikasi
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
