
import { useToast } from "@shared/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@shared/ui/components/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="group flex items-center gap-2">
            <div className="grid gap-1 flex-1 max-w-[90%]">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription className="break-words">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
