import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

/**
 * Combines multiple class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date in a human-readable format
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, "MMM d, yyyy");
}

/**
 * Formats a date and time in a human-readable format
 */
export function formatDateTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return format(dateObj, "MMM d, yyyy, h:mm a");
}

/**
 * Formats a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Formats a currency value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Truncates text to a specific length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Generates a status badge color based on status value
 */
export function getStatusColor(status: string): {bg: string, text: string} {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'approved':
    case 'won':
    case 'on track':
    case 'active':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'pending':
    case 'in_progress':
    case 'in progress':
    case 'evaluation':
    case 'submitted':
    case 'qualified':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'at risk':
    case 'delayed':
    case 'proposal':
    case 'negotiation':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    case 'lost':
    case 'rejected':
    case 'cancelled':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

/**
 * Generate a project code with prefix and year
 */
export function generateProjectCode(id: number): string {
  const year = new Date().getFullYear();
  return `PRJ-${year}-${id.toString().padStart(2, '0')}`;
}

/**
 * Parse a file size in bytes to a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type icon based on mime type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'file-pdf';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-spreadsheet';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-presentation';
  return 'file';
}

/**
 * Create a download URL for a file (simplified for demo)
 */
export function getFileUrl(filePath: string): string {
  // In a real app, this would point to an actual file URL
  return `/api/files/${encodeURIComponent(filePath)}`;
}
