import React, { useMemo } from 'react';
import { getCountryCode, getFlagUrl } from '@/components/admin/employee-management/utils/country-flags';

interface CountryFlagProps {
  country: string | null | undefined; // Allow null or undefined
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string; // Allow passing additional Tailwind classes
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ 
  country,
  size = 'md',
  showName = false,
  className = ''
}) => {
  const countryCode = useMemo(() => getCountryCode(country || ''), [country]);
  const flagUrl = useMemo(() => getFlagUrl(countryCode), [countryCode]);
  
  const sizeClasses = {
    sm: 'w-4 h-3', // Adjusted aspect ratio slightly for typical flags
    md: 'w-5 h-[15px]',
    lg: 'w-6 h-[18px]'
  };
  
  if (!country) {
    return showName ? <span className={`text-sm text-muted-foreground ${className}`}>Unknown</span> : null;
  }
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`} title={country}>
      {flagUrl ? (
        <img 
          src={flagUrl} 
          alt={`${country} flag`} 
          className={`object-cover rounded-sm ${sizeClasses[size]}`}
          loading="lazy"
          width={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
          height={size === 'sm' ? 12 : size === 'md' ? 15 : 18}
        />
      ) : (
        <div className={`bg-muted rounded-sm ${sizeClasses[size]}`} /> // Fallback placeholder
      )}
      
      {showName && <span className="text-sm leading-none">{country}</span>}
    </div>
  );
}; 