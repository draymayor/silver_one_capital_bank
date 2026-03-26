import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUserId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `SUC-${year}-${random}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    deactivated: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    suspended: 'Suspended',
    deactivated: 'Deactivated',
  }
  return map[status] ?? status
}
