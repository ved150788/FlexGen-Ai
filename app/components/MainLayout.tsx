"use client";

import React from "react";
import TopBar from "./TopBar";
import NewsTicker from "./NewsTicker";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<TopBar />
			<NewsTicker />
			<Navbar />
			<main>{children}</main>
			<Footer />
		</>
	);
}
