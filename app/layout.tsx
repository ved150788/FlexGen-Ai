// For custom app metadata
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/MainLayout";
import { Analytics } from "@vercel/analytics/react";

// Load the Inter font
const inter = Inter({ subsets: ["latin"] });

// Generate metadata for the app
export const metadata: Metadata = {
	title: "FlexGen.ai | Enterprise-Grade AI Cybersecurity",
	description:
		"Our proprietary AI technologies provide predictive and proactive security solutions to protect your digital assets from emerging threats.",
	keywords: [
		"cybersecurity",
		"AI security",
		"enterprise security",
		"threat detection",
	],
	authors: [{ name: "FlexGen.ai Team" }],
	robots: "index, follow",
};

// Define viewport export separately
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

// Root layout component
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className="scroll-smooth">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
			</head>
			<body className={inter.className} suppressHydrationWarning>
				<MainLayout>{children}</MainLayout>
			</body>
		</html>
	);
}
