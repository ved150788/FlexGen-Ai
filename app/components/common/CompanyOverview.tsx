"use client";

import { useState } from "react";
import Image from "next/image";

export default function CompanyOverview() {
	const [activeTab, setActiveTab] = useState("vision");

	return (
		<section className="py-16 px-4">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-3xl font-bold text-center mb-10">Our Company</h2>

				{/* Tabs */}
				<div className="flex justify-center mb-8">
					<div className="inline-flex rounded-md shadow-sm" role="group">
						<button
							type="button"
							className={`px-5 py-2.5 text-sm font-medium ${
								activeTab === "vision"
									? "bg-primarySaffron text-black"
									: "bg-white text-gray-700 hover:bg-gray-100"
							} border border-gray-200 rounded-l-lg`}
							onClick={() => setActiveTab("vision")}
						>
							Our Vision
						</button>
						<button
							type="button"
							className={`px-5 py-2.5 text-sm font-medium ${
								activeTab === "mission"
									? "bg-primarySaffron text-black"
									: "bg-white text-gray-700 hover:bg-gray-100"
							} border-t border-b border-gray-200`}
							onClick={() => setActiveTab("mission")}
						>
							Our Mission
						</button>
						<button
							type="button"
							className={`px-5 py-2.5 text-sm font-medium ${
								activeTab === "company"
									? "bg-primarySaffron text-black"
									: "bg-white text-gray-700 hover:bg-gray-100"
							} border border-gray-200 rounded-r-lg`}
							onClick={() => setActiveTab("company")}
						>
							Company History
						</button>
					</div>
				</div>

				{/* Tab Content */}
				<div className="grid md:grid-cols-2 gap-10 items-center">
					{/* Text Content */}
					<div className="order-2 md:order-1">
						{activeTab === "vision" && (
							<div data-aos="fade-right">
								<h3 className="text-2xl font-bold mb-4">Our Vision</h3>
								<p className="text-gray-700 mb-4">
									At FlexGen.ai, we envision a world where organizations can
									harness the power of AI to defend against evolving cyber
									threats in real-time, staying ahead of attackers and ensuring
									digital safety for all.
								</p>
								<p className="text-gray-700">
									We believe that by combining cutting-edge AI technologies with
									deep cybersecurity expertise, we can create a safer digital
									ecosystem where businesses can thrive without fear of cyber
									attacks.
								</p>
							</div>
						)}

						{activeTab === "mission" && (
							<div data-aos="fade-right">
								<h3 className="text-2xl font-bold mb-4">Our Mission</h3>
								<p className="text-gray-700 mb-4">
									Our mission is to democratize advanced cybersecurity
									capabilities through AI-powered tools that are accessible,
									effective, and easy to implement for organizations of all
									sizes.
								</p>
								<p className="text-gray-700">
									We are committed to continuously innovating our security
									solutions to stay ahead of emerging threats, while educating
									our clients and the broader community about best practices in
									cybersecurity.
								</p>
							</div>
						)}

						{activeTab === "company" && (
							<div data-aos="fade-right">
								<h3 className="text-2xl font-bold mb-4">Company History</h3>
								<p className="text-gray-700 mb-4">
									Founded in 2021, FlexGen.ai was born from the recognition that
									traditional cybersecurity approaches were failing to keep pace
									with the sophistication of modern cyber threats.
								</p>
								<p className="text-gray-700 mb-4">
									Our founders, with decades of combined experience in
									cybersecurity and artificial intelligence, set out to create a
									new paradigm of security solutions that leverage the latest
									advancements in AI to provide proactive rather than reactive
									protection.
								</p>
								<p className="text-gray-700">
									Since then, we've grown from a small team of experts to a
									trusted security partner for organizations across multiple
									industries, continuously evolving our platform to address the
									most critical security challenges of our time.
								</p>
							</div>
						)}
					</div>

					{/* Image */}
					<div className="order-1 md:order-2 flex justify-center">
						{activeTab === "vision" && (
							<div
								data-aos="fade-left"
								className="relative h-64 w-full max-w-md"
							>
								<Image
									src="/Images/vision-illustration.svg"
									alt="Company Vision"
									fill
									className="object-contain"
									onError={(e) => {
										// Fallback if image doesn't exist
										const target = e.target as HTMLImageElement;
										target.src = "/Images/flexgenlogo.png";
									}}
								/>
							</div>
						)}

						{activeTab === "mission" && (
							<div
								data-aos="fade-left"
								className="relative h-64 w-full max-w-md"
							>
								<Image
									src="/Images/mission-illustration.svg"
									alt="Company Mission"
									fill
									className="object-contain"
									onError={(e) => {
										// Fallback if image doesn't exist
										const target = e.target as HTMLImageElement;
										target.src = "/Images/flexgenlogo.png";
									}}
								/>
							</div>
						)}

						{activeTab === "company" && (
							<div
								data-aos="fade-left"
								className="relative h-64 w-full max-w-md"
							>
								<Image
									src="/Images/company-illustration.svg"
									alt="Company History"
									fill
									className="object-contain"
									onError={(e) => {
										// Fallback if image doesn't exist
										const target = e.target as HTMLImageElement;
										target.src = "/Images/flexgenlogo.png";
									}}
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
