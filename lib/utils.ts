import { format, parseISO } from "date-fns";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names with tailwind-merge
 * @param inputs Class names to combine
 * @returns Combined class names
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format a date string to a more readable format
 * @param dateString The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
	try {
		const date =
			typeof dateString === "string"
				? parseISO(dateString)
				: new Date(dateString);
		return format(date, "MMMM dd, yyyy");
	} catch (error) {
		console.error("Error formatting date:", error);
		return dateString; // Return original string if parsing fails
	}
}
