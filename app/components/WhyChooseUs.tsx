"use client";

import "./whychooseus.css";

const reasons = [
	{
		number: "01 —",
		title: "High Quality Hardware",
		description:
			"We use top-notch hardware to develop the most efficient apps for our customers.",
	},
	{
		number: "02 —",
		title: "Dedicated 24/7 Support",
		description:
			"You can rely on our 24/7 tech support that will gladly solve any app issue you may have.",
	},
	{
		number: "03 —",
		title: "30-Day Money-back Guarantee",
		description:
			"If you are not satisfied with our apps, we will return your money in the first 30 days.",
	},
	{
		number: "04 —",
		title: "Agile and Fast Working Style",
		description:
			"This type of approach to our work helps our specialists to quickly develop better apps.",
	},
	{
		number: "05 —",
		title: "Some Apps are Free",
		description:
			"We also develop free apps that can be downloaded online without any payments.",
	},
	{
		number: "06 —",
		title: "High Level of Usability",
		description:
			"All our products have high usability allowing users to easily operate the apps.",
	},
];

export default function WhyChooseUs() {
	return (
		<section className="max-w-6xl mx-auto px-6 py-20 text-center text-white ">
			<p className="text-sm font-semibold  uppercase">Some Reasons</p>
			<h2 className="text-4xl font-bold text-900 mb-12">Why Choose Us</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-left ">
				{reasons.map((reason, index) => (
					<div key={index}>
						<h3
							className="text-lg font-bold flex items-center numbered-title border-b"
							data-number={reason.number}
						>
							{reason.title}
						</h3>
						<p className="mt-2 text-sm text-white-600">{reason.description}</p>
					</div>
				))}
			</div>
		</section>
	);
}
