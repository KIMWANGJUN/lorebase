
import { Timestamp } from 'firebase/firestore';

/**
 * Converts various date representations to a JavaScript Date object.
 * Handles Firestore Timestamps, ISO strings, and existing Date objects.
 * @param date - The date to convert (Timestamp, string, or Date).
 * @returns A Date object, or null if the input is invalid.
 */
export function toDate(date: any): Date | null {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  if (typeof date === 'string' || typeof date === 'number') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  if (date instanceof Date) {
    return date;
  }
  return null;
}

/**
 * Formats a date into a "YYYY. MM. DD." string.
 * @param date - The date to format (Timestamp, string, or Date).
 * @returns The formatted date string, or an empty string if invalid.
 */
export function formatLocaleDate(date: any): string {
  const dateObj = toDate(date);
  if (!dateObj) return '';
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).replace(/\.$/, ''); // Remove trailing dot
}

/**
 * Formats a date for display, showing relative time for recent dates
 * and a specific format for older dates.
 * e.g., "5분 전", "3시간 전", "2023. 12. 25."
 * @param date - The date to format (Timestamp, string, or Date).
 * @returns The formatted, human-readable date string.
 */
export function formatRelativeDate(date: any): string {
    const dateObj = toDate(date);
    if (!dateObj) return '유효하지 않은 날짜';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;

    return formatLocaleDate(dateObj);
}
