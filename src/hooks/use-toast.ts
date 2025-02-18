
import { toast as sonnerToast } from "sonner";

export const toast = sonnerToast;

// Re-export useToast for backwards compatibility
export const useToast = () => {
  return {
    toast: sonnerToast,
  };
};
