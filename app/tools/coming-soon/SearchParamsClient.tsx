"use client";

import { useSearchParams } from "next/navigation";
import { toolInfo } from "./toolData";
import Link from "next/link";
import { useState } from "react";

// Simple inline NotifyMeForm component
const NotifyMeForm = ({
	toolName,
	buttonText,
}: {
	toolName: string;
	buttonText: string;
}) => {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Simulate form submission
		setSubmitted(true);
	};

	return (
		<>
			{!submitted ? (
				<form onSubmit={handleSubmit} className="space-y-3">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Your email address"
						className="w-full px-3 py-2 border border-gray-300 rounded-md"
						required
					/>
					<button
						type="submit"
						className="w-full bg-primarySaffron text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition"
					>
						{buttonText}
					</button>
				</form>
			) : (
				<div className="bg-green-50 text-green-800 p-3 rounded-md">
					Thank you! We'll notify you when {toolName} is available.
				</div>
			)}
		</>
	);
};

// Define the tool data structure
interface ToolData {
	description: string;
	features: string[];
}

export default function SearchParamsClient() {
	const searchParams = useSearchParams();
	const toolName = searchParams.get("tool") || "This tool";
	const toolData = toolInfo[toolName as keyof typeof toolInfo] || {
		description:
			"A powerful cybersecurity tool being developed by our expert team.",
		features: [
			"Advanced security features",
			"User-friendly interface",
			"Enterprise-grade protection",
		],
	};

	return (
		<>
			<div className="text-center mb-12">
				<span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-3">
					Under Development
				</span>
				<h1 className="text-4xl md:text-5xl font-bold mb-3 text-primarySaffron">
					{toolName}
				</h1>
				<p className="text-xl text-gray-600 max-w-3xl mx-auto">
					Coming soon to enhance your cybersecurity arsenal
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="md:col-span-2">
					<div className="bg-white p-8 rounded-lg shadow-md">
						<h2 className="text-2xl font-bold mb-4 text-gray-800">
							About this Tool
						</h2>
						<p className="text-gray-700 mb-6 leading-relaxed">
							{toolData.description}
						</p>

						<h3 className="font-semibold text-lg mb-3 text-gray-800">
							Key Features
						</h3>
						<ul className="space-y-2 mb-6">
							{toolData.features.map((feature: string, index: number) => (
								<li key={index} className="flex items-start">
									<span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primarySaffron text-black mr-2 flex-shrink-0">
										✓
									</span>
									<span className="text-gray-700">{feature}</span>
								</li>
							))}
						</ul>

						<div className="border-t border-gray-100 pt-6">
							<p className="text-gray-600 italic text-sm">
								This tool is currently under active development. Stay tuned for
								updates!
							</p>
						</div>
					</div>

					<div className="mt-8 bg-gray-50 p-8 rounded-lg border border-gray-200">
						<h2 className="text-2xl font-bold mb-4 text-gray-800">
							Development Timeline
						</h2>
						<div className="space-y-6">
							<div className="flex">
								<div className="flex flex-col items-center mr-4">
									<div className="w-4 h-4 bg-primarySaffron rounded-full"></div>
									<div className="w-1 h-full bg-primarySaffron"></div>
								</div>
								<div>
									<h3 className="font-bold text-gray-800">Planning Phase</h3>
									<p className="text-sm text-gray-600">Completed</p>
								</div>
							</div>
							<div className="flex">
								<div className="flex flex-col items-center mr-4">
									<div className="w-4 h-4 bg-primarySaffron rounded-full"></div>
									<div className="w-1 h-full bg-primarySaffron"></div>
								</div>
								<div>
									<h3 className="font-bold text-gray-800">Development</h3>
									<p className="text-sm text-gray-600">In Progress</p>
								</div>
							</div>
							<div className="flex">
								<div className="flex flex-col items-center mr-4">
									<div className="w-4 h-4 bg-gray-300 rounded-full"></div>
									<div className="w-1 h-full bg-gray-300"></div>
								</div>
								<div>
									<h3 className="font-bold text-gray-800">Testing</h3>
									<p className="text-sm text-gray-600">Coming Soon</p>
								</div>
							</div>
							<div className="flex">
								<div className="flex flex-col items-center mr-4">
									<div className="w-4 h-4 bg-gray-300 rounded-full"></div>
								</div>
								<div>
									<h3 className="font-bold text-gray-800">Launch</h3>
									<p className="text-sm text-gray-600">Estimated Q3 2024</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="md:col-span-1">
					<div className="bg-white p-6 rounded-lg shadow-md mb-6">
						<h3 className="font-semibold text-gray-800 mb-4">
							Get Notified on Launch
						</h3>
						<p className="text-gray-600 text-sm mb-4">
							Be the first to know when {toolName} is available for use.
						</p>
						<NotifyMeForm toolName={toolName} buttonText="Notify Me" />
					</div>

					<div className="bg-black p-6 rounded-lg shadow-md mb-6">
						<h3 className="font-semibold text-white mb-4">Join Beta Testing</h3>
						<p className="text-gray-400 text-sm mb-4">
							Interested in being a beta tester? Get early access and help shape
							the future of this tool.
						</p>
						<NotifyMeForm toolName={toolName} buttonText="Apply for Beta" />
					</div>

					<div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
						<h3 className="font-semibold text-gray-800 mb-4">
							Explore Other Tools
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/tools/coming-soon?tool=Network Monitor"
									className="text-blue-600 hover:underline"
								>
									Network Monitor
								</Link>
							</li>
							<li>
								<Link
									href="/tools/coming-soon?tool=Security Dashboard"
									className="text-blue-600 hover:underline"
								>
									Security Dashboard
								</Link>
							</li>
							<li>
								<Link
									href="/tools/coming-soon?tool=AI Misconfiguration Checker"
									className="text-blue-600 hover:underline"
								>
									AI Misconfiguration Checker
								</Link>
							</li>
							<li>
								<Link
									href="/tools"
									className="flex items-center text-gray-600 hover:text-primarySaffron transition mt-3"
								>
									<span>View all tools</span>
									<svg
										className="w-4 h-4 ml-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</Link>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</>
	);
}
