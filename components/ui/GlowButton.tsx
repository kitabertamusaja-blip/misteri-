
import React from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

const GlowButton: React.FC<GlowButtonProps> = ({ children, variant = 'primary', fullWidth, className, ...props }) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#7F5AF0] text-white shadow-xl shadow-[#7F5AF0]/30 hover:bg-[#6b48d1] glow-purple",
    outline: "bg-transparent border border-[#7F5AF0]/30 text-[#7F5AF0] hover:bg-[#7F5AF0]/5",
    ghost: "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default GlowButton;
