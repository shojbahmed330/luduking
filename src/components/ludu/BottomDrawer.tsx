import * as React from "react"
import { Drawer } from "vaul"
import { cn } from "@/lib/utils"

interface BottomDrawerProps {
  trigger: React.ReactNode
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

export function BottomDrawer({ trigger, children, title, description, className }: BottomDrawerProps) {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Drawer.Content className={cn("fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-auto max-h-[96%] flex-col rounded-t-[32px] bg-card shadow-2xl outline-none ring-0", className)}>
          <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted" />
          <div className="flex flex-col gap-6 p-6 pb-12 overflow-y-auto">
            {(title || description) && (
              <div className="space-y-1.5">
                {title && <Drawer.Title className="text-xl font-black text-foreground">{title}</Drawer.Title>}
                {description && <Drawer.Description className="text-sm font-bold text-muted-foreground">{description}</Drawer.Description>}
              </div>
            )}
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
