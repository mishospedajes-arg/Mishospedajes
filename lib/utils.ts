import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const slugify = (text: string) =>
  text
    .toString()
    .normalize('NFD') // Normalize to separate diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text

/**
 * Formats a Date object into a 'YYYY-MM-DD' string based on the user's local date.
 * This avoids all timezone-related issues by formatting the date as the user sees it.
 * @param date The date to format.
 * @returns The formatted date string.
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;

};

export const getCategoryColor = (category: string | undefined | null) => {
  switch (category) {
    case 'Verde':
      return 'text-[rgb(168,207,69)] fill-[rgb(168,207,69)]';
    case 'Celeste':
      return 'text-[rgb(0,158,189)] fill-[rgb(0,158,189)]';
    case 'Azul':
      return 'text-[rgb(20,100,161)] fill-[rgb(20,100,161)]';
    default:
      return 'text-primary fill-primary';
  }
};
