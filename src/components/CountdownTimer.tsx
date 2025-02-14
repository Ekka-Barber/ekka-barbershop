
import { useEffect, useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

interface CountdownTimerProps {
  endDate: string;
}

const CountdownTimer = ({ endDate }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  
  const { language } = useLanguage();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft(null);
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className="mt-4 text-red-600 font-semibold text-lg">
        {language === 'ar' ? 'العرض انتهى' : 'Offer Ended'}
      </div>
    );
  }

  if (!timeLeft) return null;

  const formatNumber = (num: number): string => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mt-4 text-sm font-medium">
      {timeLeft.days > 0 && (
        <div className="text-center">
          <span className="text-lg font-bold">{timeLeft.days}</span>
          <span className="ml-1">{language === 'ar' ? 'يوم' : 'days'}</span>
        </div>
      )}
      <div className="text-center">
        <span className="text-lg font-bold">{formatNumber(timeLeft.hours)}</span>
        <span className="ml-1">{language === 'ar' ? 'ساعة' : 'hrs'}</span>
      </div>
      <div className="text-center">
        <span className="text-lg font-bold">{formatNumber(timeLeft.minutes)}</span>
        <span className="ml-1">{language === 'ar' ? 'دقيقة' : 'min'}</span>
      </div>
      <div className="text-center">
        <span className="text-lg font-bold">{formatNumber(timeLeft.seconds)}</span>
        <span className="ml-1">{language === 'ar' ? 'ثانية' : 'sec'}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
