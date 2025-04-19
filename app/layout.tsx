// app/layout.tsx
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { ModalProvider } from "./context/ModalProvider";
import { defaultMetadata } from "./seo-config";

// Import Swiper styles globally
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const lato = Lato({
	subsets: ["latin"],
	weight: ["100", "300", "400", "700", "900"],
	variable: "--font-lato",
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
			<body
				className={`${lato.variable} font-sans antialiased`}
				suppressHydrationWarning={true}
			>
				<ModalProvider>
					{children}
					{/* Modal is handled by the ModalProvider */}
				</ModalProvider>
			</body>
		</html>
	);
}
