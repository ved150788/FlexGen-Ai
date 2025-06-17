"use client";

import type { Metadata } from "next";
import { FloatingFeedbackButton } from "@/components/feedback/FeedbackButton";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePathname } from "next/navigation";

// Note: metadata export doesn't work with "use client",
// so you may need to handle this differently in your app

function getModuleName(pathname: string): string {
	const segments = pathname.split("/");
	const toolSegment = segments[2]; // /tools/[tool-name]

	if (!toolSegment) return "Security Tools";

	// Convert kebab-case to Title Case
	return toolSegment
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

export default function ToolsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { user } = useAuth();
	const pathname = usePathname();
	const currentModule = getModuleName(pathname);

	return (
		<>
			{children}
			<FloatingFeedbackButton
				currentModule={currentModule}
				userId={user?.id}
				username={user?.username}
			/>
		</>
	);
}
