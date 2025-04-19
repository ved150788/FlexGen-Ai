"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AOSProvider() {
	useEffect(() => {
		AOS.init({
			duration: 800, // smoother visible animation
			once: true,
			offset: 100,
		});
		console.log("✅ AOS initialized"); // debug
	}, []);

	return null;
}
