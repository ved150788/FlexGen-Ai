"use client";

import TopBar from "./TopBar";
import Navbar from "./Navbar";
import NewsTicker from "./NewsTicker";
import Footer from "./Footer";

interface SharedLayoutProps {
	children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
	return (
		<>
			<TopBar />
			<Navbar />
			<NewsTicker />
			<main>{children}</main>
			<Footer />
		</>
	);
}
