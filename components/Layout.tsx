
import React from 'react';
import { ICONS } from '../constants';
import { Page } from '../types';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const navItems = [
    { id: Page.HOME, icon: ICONS.Dream, label: 'Home' },
    { id: Page.SEARCH, icon: ICONS.Search, label: 'Cari' },
    { id: Page.TRENDING, icon: ICONS.Trending, label: 'Hits' },
    { id: Page.FAVORITE, icon: ICONS.Heart, label: 'Favorit' }
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-mystic-gradient shadow-[0_0_100px_rgba(0,0,0,1)]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-50 bg-[#0F0F1A]/80 backdrop-blur-md border-b border-white/5">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate(Page.HOME)}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-[#7F5AF0] to-[#6b48d1] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(127,90,240,0.6)]">
            <ICONS.Dream size={20} className="text-white" />
          </div>
          <h1 className="font-cinzel text-xl font-bold tracking-widest glow-text">MISTERI<span className="text-[#7F5AF0]">+</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate(Page.ZODIAC)}
            className="text-gray-400 hover:text-[#7F5AF0] transition-colors"
          >
            <ICONS.Zodiac size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-20">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 nav-blur border-t border-white/5 h-20 flex items-center justify-around z-50 max-w-md mx-auto rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all relative w-16 ${isActive ? 'text-[#7F5AF0]' : 'text-gray-500'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="nav-active"
                  className="absolute -top-3 w-8 h-1 bg-[#7F5AF0] rounded-full glow-purple"
                />
              )}
              <div className={`p-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
