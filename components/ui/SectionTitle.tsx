
import React from 'react';

interface SectionTitleProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, icon, rightElement }) => {
  return (
    <div className="flex justify-between items-center mb-4 px-1">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-[#7F5AF0] rounded-full shadow-[0_0_8px_#7F5AF0]"></div>
        <h3 className="text-lg font-bold flex items-center gap-2">
          {icon && <span className="text-[#7F5AF0]">{icon}</span>}
          {children}
        </h3>
      </div>
      {rightElement}
    </div>
  );
};

export default SectionTitle;
