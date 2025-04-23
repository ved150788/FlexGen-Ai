"use client";

import ServicesGrid from "../components/services/ServicesGrid";
import Link from "next/link";

export default function ServicesPage() {
	return (
		<>
			{/* HERO SECTION */}
			<section className="relative h-screen flex items-center justify-center text-white text-center overflow-hidden">
				<img
					src="/Images/services-hero.jpg"
					alt="Cybersecurity Services"
					className="absolute inset-0 w-full h-full object-cover z-0"
				/>
				<div className="absolute inset-0 bg-black bg-opacity-60 z-10" />

				<div className="relative z-20 px-6 max-w-3xl">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">
						Comprehensive Cybersecurity Services
					</h1>
					<p className="text-lg text-gray-200">
						From risk assessments to real-time threat detection, we secure your
						business with intelligence and integrity.
					</p>
				</div>
			</section>

			{/* SERVICES GRID */}
			<ServicesGrid />

			{/* CTA SECTION */}
			<section className="bg-primarySaffron text-black py-16 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl font-bold mb-4">
						Need Help Choosing a Service?
					</h2>
					<p className="text-lg mb-6">
						Get a free consultation with our experts. We'll guide you to the
						right solution for your cybersecurity challenges.
					</p>
					<Link
						href="/contact"
						className="inline-block bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
					>
						Talk to an Expert
					</Link>
				</div>
			</section>
		</>
	);
}
