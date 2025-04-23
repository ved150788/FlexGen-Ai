"use client";

import React from "react";
import TopBar from "./layout/TopBar";
import Navbar from "./layout/Navbar";
import NewsTicker from "./layout/NewsTicker";
import Footer from "./layout/Footer";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
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
