"use client";

import React from "react";

const comparisons = [
	{
		feature: "Real-time Monitoring",
		flexgen: true,
		traditional: false,
	},
	{
		feature: "AI-Powered Threat Detection",
		flexgen: true,
		traditional: false,
	},
	{
		feature: "24/7 Incident Response",
		flexgen: true,
		traditional: true,
	},
	{
		feature: "Customizable Security Stack",
		flexgen: true,
		traditional: false,
	},
	{
		feature: "Manual Audit Processes",
		flexgen: false,
		traditional: true,
	},
];

export default function ValueComparison() {
	return (
		<section className="py-16 px-6 bg-gray-100">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-3xl font-bold text-center mb-12">
					Why Choose FlexGen.ai?
				</h2>

				<div className="overflow-x-auto">
					<table
						className="min-w-full border border-gray-300 rounded-xl bg-white shadow-md"
						data-aos="fade-up"
					>
						<thead className="bg-primarySaffron text-black">
							<tr>
								<th className="py-3 px-4 text-left text-sm font-semibold">
									Feature
								</th>
								<th className="py-3 px-4 text-center text-sm font-semibold">
									FlexGen.ai
								</th>
								<th className="py-3 px-4 text-center text-sm font-semibold">
									Traditional Providers
								</th>
							</tr>
						</thead>
						<tbody>
							{comparisons.map((item, idx) => (
								<tr key={idx} className="border-t border-gray-200">
									<td className="py-4 px-4 text-sm text-gray-700">
										{item.feature}
									</td>
									<td className="py-4 px-4 text-center">
										{item.flexgen ? (
											<span className="text-green-600 text-xl">✅</span>
										) : (
											<span className="text-red-500 text-xl">❌</span>
										)}
									</td>
									<td className="py-4 px-4 text-center">
										{item.traditional ? (
											<span className="text-green-600 text-xl">✅</span>
										) : (
											<span className="text-red-500 text-xl">❌</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="text-center mt-10">
					<p className="text-gray-700 text-sm max-w-2xl mx-auto">
						FlexGen.ai provides cutting-edge, adaptive, and AI-augmented
						cybersecurity — not legacy solutions.
					</p>
				</div>
			</div>
		</section>
	);
}
