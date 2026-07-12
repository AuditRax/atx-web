import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  theme?: 'light' | 'dark';
}

export const AuditRaxLogo: React.FC<LogoProps> = ({ 
  className = '', 
  iconOnly = false,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* The logo image - points to /logo.png which you can easily replace in public/logo.png */}
      <img 
        src="/logo.png" 
        alt="AuditRax Logo" 
        className="h-10 sm:h-12 w-auto object-contain max-w-[200px]"
        referrerPolicy="no-referrer"
      />


    </div>
  );
};
