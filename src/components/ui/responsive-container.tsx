
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  variant?: "page" | "section" | "card"
}

export function ResponsiveContainer({ 
  children, 
  className, 
  variant = "page" 
}: ResponsiveContainerProps) {
  const baseClasses = {
    page: "container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6",
    section: "px-4 sm:px-6 py-4 sm:py-6",
    card: "p-4 sm:p-6"
  }

  return (
    <div className={cn(baseClasses[variant], className)}>
      {children}
    </div>
  )
}
