import { cn } from "@/lib/utils"
import { type HTMLAttributes } from "react"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger"
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  }

  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium", variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}
