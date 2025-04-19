"use client";

import { useEffect, useState } from "react";

const stats = [
	{
		label: "Attack Prevention Rate",
		value: 99.9,
		suffix: "%",
		icon: "🛡️",
	},
	{
		label: "Systems Secured",
		value: 500,
		suffix: "+",
		icon: "💻",
	},
	{
		label: "Threats Neutralized",
		value: 12000,
		suffix: "+",
		icon: "🚨",
	},
	{
		label: "Uptime Guarantee",
		value: 99.99,
		suffix: "%",
		icon: "⚙️",
	},
];

export default function ClientStats() {
	const [counters, setCounters] = useState(stats.map(() => 0));

	useEffect(() => {
		const interval = setInterval(() => {
			setCounters((prev) =>
				prev.map((val, i) =>
					val < stats[i].value
						? Math.min(val + Math.ceil(stats[i].value / 50), stats[i].value)
						: val
				)
			);
		}, 30);
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="py-16 px-6 bg-gray-100">
			<div className="max-w-6xl mx-auto text-center mb-10">
				<h2 className="text-3xl font-bold mb-4">FlexGen.ai by the Numbers</h2>
				<p className="text-gray-600 max-w-2xl mx-auto">
					We're proud of the impact we've made in securing global businesses.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
				{stats.map((stat, i) => (
					<div
						key={i}
						className="bg-white rounded-xl shadow-md p-6 text-center"
						data-aos="fade-up"
						data-aos-delay={i * 100}
					>
						<div className="text-4xl mb-2">{stat.icon}</div>
						<h3 className="text-3xl font-bold text-primarySaffron">
							{counters[i]}
							{stat.suffix}
						</h3>
						<p className="text-gray-700 mt-2">{stat.label}</p>
					</div>
				))}
			</div>
		</section>
	);
}
