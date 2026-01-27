
import { useEffect, useState, RefObject } from 'react';

import { useToast } from '@shared/hooks/use-toast';

import { WebkitDocument, WebkitHTMLElement } from '@/features/manager/types/fullscreen';

export const useFullscreen = (elementRef: RefObject<WebkitHTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as WebkitDocument;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      const doc = document as WebkitDocument;
      if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
        if (elementRef.current) {
          if (elementRef.current.requestFullscreen) {
            await elementRef.current.requestFullscreen();
          } else if (elementRef.current.webkitRequestFullscreen) {
            await elementRef.current.webkitRequestFullscreen();
          }
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير وضع ملء الشاشة",
      });
    }
  };

  return { isFullscreen, toggleFullscreen };
};
