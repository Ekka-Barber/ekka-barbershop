
import { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface LazyLoadComponentProps {
  children: React.ReactNode;
  threshold?: number;
  placeholder?: React.ReactNode;
  className?: string;
}

export const LazyLoadComponent = ({
  children,
  threshold = 100,
  placeholder,
  className
}: LazyLoadComponentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={componentRef} className={cn("min-h-[100px]", className)}>
      {isVisible ? children : placeholder}
    </div>
  );
};
