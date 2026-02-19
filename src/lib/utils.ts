import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, options: { compact?: boolean } = {}) {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: options.compact ? 'compact' : 'standard',
    maximumFractionDigits: options.compact ? 2 : 2,
  })

  return formatter.format(amount)
}
