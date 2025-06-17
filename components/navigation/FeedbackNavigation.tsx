"use client";

import Link from "next/link";
import { MessageSquare, Settings } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

interface FeedbackNavigationProps {
	className?: string;
	variant?: "sidebar" | "header" | "dropdown";
}

export default function FeedbackNavigation({
	className = "",
	variant = "sidebar",
}: FeedbackNavigationProps) {
	const { user, isAdmin, loading } = useAuth();

	if (loading || !user) {
		return null; // Don't show navigation if not authenticated
	}

	const getNavigationContent = () => {
		if (isAdmin) {
			return {
				href: "/feedback-dashboard",
				icon: Settings,
				text: "Feedback Dashboard",
				description: "Manage all feedback submissions",
			};
		} else {
			return {
				href: "/my-feedback",
				icon: MessageSquare,
				text: "My Feedback",
				description: "View your submitted feedback",
			};
		}
	};

	const navContent = getNavigationContent();
	const Icon = navContent.icon;

	const getStylesByVariant = () => {
		switch (variant) {
			case "header":
				return `
					inline-flex items-center px-3 py-2 border border-transparent text-sm 
					leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900 
					hover:bg-gray-100 transition-colors duration-200
					${className}
				`;
			case "dropdown":
				return `
					flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 
					hover:text-gray-900 transition-colors duration-200
					${className}
				`;
			case "sidebar":
			default:
				return `
					flex items-center w-full px-3 py-2 text-left text-sm font-medium text-gray-700 
					rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200
					${className}
				`;
		}
	};

	return (
		<Link href={navContent.href} className={getStylesByVariant()}>
			<Icon size={16} className="mr-2 flex-shrink-0" />
			<span className="truncate">{navContent.text}</span>
			{variant === "sidebar" && (
				<span className="ml-auto text-xs text-gray-500">
					{isAdmin ? "Admin" : "User"}
				</span>
			)}
		</Link>
	);
}

// Preset components for different navigation contexts
export function HeaderFeedbackNavigation(
	props: Omit<FeedbackNavigationProps, "variant">
) {
	return <FeedbackNavigation {...props} variant="header" />;
}

export function SidebarFeedbackNavigation(
	props: Omit<FeedbackNavigationProps, "variant">
) {
	return <FeedbackNavigation {...props} variant="sidebar" />;
}

export function DropdownFeedbackNavigation(
	props: Omit<FeedbackNavigationProps, "variant">
) {
	return <FeedbackNavigation {...props} variant="dropdown" />;
}
