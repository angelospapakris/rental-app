import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const toArray = <T,>(res: any): T[] =>
         Array.isArray(res)
           ? res
           : Array.isArray(res?.data)
           ? res.data
           : Array.isArray(res?.content)
           ? res.content
           : [];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
