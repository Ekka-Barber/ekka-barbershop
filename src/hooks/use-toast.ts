
import { toast as sonnerToast } from "sonner";

// Re-export toast function with our custom types
export const toast = sonnerToast;

// Re-export useToast for backwards compatibility
export const useToast = () => {
  return { toast };
};
