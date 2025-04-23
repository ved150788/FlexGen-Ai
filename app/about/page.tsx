// app/about/page.tsx

"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Script from "next/script";

// Components
import TeamCarousel from "../components/common/TeamCarousel";
import CompanyOverview from "../components/common/CompanyOverview";

// Team members data - would ideally come from a content management system
const teamMembers = [
	{
		name: "Sarah Johnson",
		jobTitle: "Chief Executive Officer",
		description:
			"Cybersecurity veteran with over 15 years of experience in enterprise security.",
	},
	{
		name: "Michael Chen",
		jobTitle: "Chief Technology Officer",
		description:
			"AI and machine learning expert specializing in threat detection algorithms.",
	},
	{
		name: "Alex Rodriguez",
		jobTitle: "Head of Security Research",
		description:
			"Former intelligence officer with deep expertise in emerging cyber threats.",
	},
];

export default function AboutPage() {
	useEffect(() => {
		AOS.init({ duration: 800, once: true });
	}, []);

	// Create Organization structured data
	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "FlexGen.ai",
		url: "https://flexgen.ai",
		logo: "https://flexgen.ai/logo.png",
		foundingDate: "2021",
		description:
			"FlexGen.ai provides AI-powered cybersecurity solutions to protect organizations from evolving cyber threats.",
		address: {
			"@type": "PostalAddress",
			streetAddress: "123 Cyber Street",
			addressLocality: "San Francisco",
			addressRegion: "CA",
			postalCode: "94105",
			addressCountry: "US",
		},
		founders: teamMembers.map((member) => ({
			"@type": "Person",
			name: member.name,
			jobTitle: member.jobTitle,
		})),
	};

	return (
		<>
			<Script id="about-schema" type="application/ld+json">
				{JSON.stringify(organizationSchema)}
			</Script>

			<section className="text-center py-20 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white">
				<h1 className="text-5xl font-bold mb-4">About Us</h1>
				<p className="text-lg max-w-2xl mx-auto">
					We're a team of cybersecurity experts on a mission to predict,
					prevent, and protect.
				</p>
			</section>

			{/* 👥 Meet Our Team */}
			<div data-aos="fade-up">
				<TeamCarousel />
			</div>

			{/* 📄 Vision / Mission / Company Info */}
			<div data-aos="fade-up" data-aos-delay="200">
				<CompanyOverview />
			</div>
		</>
	);
}
