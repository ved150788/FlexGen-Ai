"use client";

import "./whychooseus.css";

// components/WhyChooseUs.tsx

const reasons = [
	{
		number: "01",
		title: "AI-Powered Threat Detection",
		description:
			"Our intelligent systems monitor and detect threats before they cause harm.",
	},
	{
		number: "02",
		title: "Automated Real-Time Defense",
		description:
			"Get instant alerts, smart triage, and automated countermeasures to protect your digital assets around the clock.",
	},
	{
		number: "03",
		title: "Custom Security Solutions",
		description:
			"We tailor our cybersecurity tools to fit your organization’s unique needs.",
	},
	{
		number: "04",
		title: "Global Threat Intelligence",
		description:
			"Access to the latest global threat data to stay one step ahead.",
	},
	{
		number: "05",
		title: "Scalable Infrastructure",
		description:
			"Our systems grow with your business, protecting small startups to large enterprises.",
	},
	{
		number: "06",
		title: "Expert Support Team",
		description:
			"Backed by certified professionals to assist you with every challenge.",
	},
];

export default function WhyChooseUs() {
	return (
		<section className="bg-gray-800 text-white ">
			<div className="max-w-6xl p-8 rounded-lg shadow-md mx-auto text-center ">
				<p className="text-sm font-semibold uppercase text-white text-opacity-80">
					Some Reasons
				</p>
				<h2 className="text-4xl font-bold mb-12">Why Choose Us</h2>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
					{reasons.map((reason, index) => (
						<div
							key={index}
							className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-black"
						>
							<h3
								className="text-lg font-bold flex items-center numbered-title border-b border-gray-200 pb-2"
								data-number={reason.number}
							>
								{reason.title}
							</h3>
							<p className="mt-3 text-sm">{reason.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
