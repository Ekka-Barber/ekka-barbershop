
import { toast as sonnerToast, ToastT } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Create a wrapper that converts our app's toast format to Sonner's format
const toast = (props: ToastProps | string) => {
  if (typeof props === 'string') {
    return sonnerToast(props);
  }
  
  const { title, description, variant } = props;
  if (variant === "destructive") {
    return sonnerToast.error(description || title, {
      description: description ? title : undefined
    });
  }
  
  return sonnerToast(title, {
    description
  });
};

// Re-export useToast for backwards compatibility
export const useToast = () => {
  return {
    toast,
  };
};

export { toast };
