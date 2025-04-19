// app/layout.tsx
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "./context/ModalProvider";
import { defaultMetadata } from "./seo-config";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-poppins",
	display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="apple-touch-icon" href="/apple-icon.png" />
				<meta name="theme-color" content="#111111" />
			</head>
			<body className={`${poppins.variable} font-sans antialiased`}>
				<ModalProvider>
					{children}
					{/* Modal is handled by the ModalProvider */}
				</ModalProvider>
			</body>
		</html>
	);
}
