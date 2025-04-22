// For custom app metadata
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "./components/MainLayout";

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
	viewport: "width=device-width, initial-scale=1",
	robots: "index, follow",
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
			<body className={inter.className}>
				<MainLayout>{children}</MainLayout>
			</body>
		</html>
	);
}
