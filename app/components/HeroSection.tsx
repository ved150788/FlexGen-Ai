"use client";

import { useState, useEffect } from "react";
import ModalContactForm from "./ModalContactForm";

export default function HeroSection() {
	const [isMounted, setIsMounted] = useState(false);
	const [isOpen, setIsOpen] = useState(false); // ⬅️ local modal state

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<div className="relative w-full h-screen overflow-hidden">
			{/* Background Video */}
			{isMounted && (
				<video
					autoPlay
					muted
					loop
					playsInline
					className="absolute top-0 left-0 w-full h-full object-cover"
				>
					<source src="/videos/hero1.mp4" type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			)}

			<div className="absolute top-0 left-0 w-full h-full bg-black opacity-85 z-10" />

			{/* Hero Content */}
			<div className="relative top-14 z-20 flex items-start justify-start min-h-screen text-white px-4">
				<div className="text-center max-w-3xl p-8">
					<h1 className="text-5xl font-bold mb-4 text-left text-primarySaffron">
						Cybersecurity Solutions Built to Predict, Prevent & Protect
					</h1>
					{/* <p className="mb-4 text-lg text-left">
						Cybersecurity made smarter —{" "}
						<strong>Predict. Prevent. Protect.</strong>
					</p> */}
					<p className="mb-6 text-md text-gray-300 text-left">
						Safeguard your business with enterprise-grade cybersecurity
						services—from real-time threat detection to compliance audits and
						penetration testing. Stay secure, stay ahead.
					</p>

					<button
						onClick={() => setIsOpen(true)}
						className="px-6 py-3 font-semibold border border-white rounded-lg transition bg-white text-black hover:bg-black hover:text-white"
					>
						Get a Free Security Audit
					</button>
				</div>
			</div>

			{/* Modal Triggered from Local State */}
			<ModalContactForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</div>
	);
}
