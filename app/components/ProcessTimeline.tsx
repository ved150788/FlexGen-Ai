// app/components/ProcessTimeline.tsx
"use client";

const steps = [
	{
		title: "Discovery",
		description: "Understand your systems and define your cybersecurity goals.",
	},
	{
		title: "Audit & Assessment",
		description: "Analyze your existing posture, gaps, and risks.",
	},
	{
		title: "Implementation",
		description: "Deploy tailored security solutions and configure protection.",
	},
	{
		title: "Ongoing Support",
		description: "Continual monitoring, reporting, and expert assistance.",
	},
];

export default function ProcessTimeline() {
	return (
		<section className="py-16 px-6 bg-white">
			<div className="max-w-4xl mx-auto">
				<h2 className="text-3xl font-bold text-center mb-12">
					Our Engagement Process
				</h2>

				<ol className="relative border-l border-gray-300">
					{steps.map((step, index) => (
						<li key={index} className="mb-10 ml-6">
							<span className="absolute -left-3 flex items-center justify-center w-8 h-8 bg-primarySaffron rounded-full ring-4 ring-white">
								{index + 1}
							</span>
							<h3 className="text-lg font-semibold text-gray-900">
								{step.title}
							</h3>
							<p className="text-gray-700 text-sm mt-1">{step.description}</p>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}
