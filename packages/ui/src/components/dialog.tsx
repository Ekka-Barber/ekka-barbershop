import * as DialogPrimitive from "@radix-ui/react-dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { X } from "lucide-react"
import * as React from "react"

import { cn } from "@shared/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[1200] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg sm:text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const contentProps =
    props as React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
      "aria-describedby"?: string;
      "aria-label"?: string;
    }

  const {
    "aria-describedby": ariaDescribedByFromProps,
    "aria-label": ariaLabelFromProps,
    ...restProps
  } = contentProps

  const childElements = React.Children.toArray(children)
  const hasTitle = childElements.some(
    (child) => React.isValidElement(child) && child.type === DialogTitle
  )
  const hasDescription = childElements.some(
    (child) => React.isValidElement(child) && child.type === DialogDescription
  )

  const fallbackTitleText = ariaLabelFromProps ?? "Dialog"
  const fallbackDescriptionText = ariaLabelFromProps ?? "Dialog content"
  const fallbackTitle = !hasTitle ? (
    <VisuallyHidden>
      <DialogTitle>{fallbackTitleText}</DialogTitle>
    </VisuallyHidden>
  ) : null

  const descriptionId = React.useId()
  const fallbackDescription = !hasDescription ? (
    <VisuallyHidden>
      <DialogDescription id={descriptionId}>
        {fallbackDescriptionText}
      </DialogDescription>
    </VisuallyHidden>
  ) : null

  const ariaDescribedBy = hasDescription
    ? ariaDescribedByFromProps
    : ariaDescribedByFromProps ?? (fallbackDescription ? descriptionId : undefined)

  const isRTL =
    typeof document !== "undefined" && document.documentElement.dir === "rtl"

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[1210] grid w-[calc(100%-2rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg sm:rounded-lg",
          className
        )}
        style={{
          maxHeight: "calc(100vh - 2rem - var(--sat, 0px) - var(--sab, 0px))",
          marginTop: "var(--sat, 0px)",
          marginBottom: "var(--sab, 0px)"
        }}
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabelFromProps}
        {...restProps}
      >
        {fallbackTitle}
        {fallbackDescription}
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              "absolute top-3 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center",
              isRTL ? "left-3 sm:left-4" : "right-3 sm:right-4"
            )}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
}
