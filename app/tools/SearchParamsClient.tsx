"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Define tool categories
const categories = [
	"All Tools",
	"Scanning & Assessment",
	"Monitoring",
	"Protection",
	"Intelligence",
	"Reporting",
];

// Define tools with their details
const tools = [
	{
		id: "vulnerability-scanner",
		name: "Vulnerability Scanner",
		description:
			"Comprehensive scanner for identifying security vulnerabilities across your infrastructure",
		category: "Scanning & Assessment",
		status: "available",
		icon: "🔍",
		beta: true,
	},
	{
		id: "password-manager",
		name: "Password Manager",
		description:
			"Secure password management solution for teams and enterprises",
		category: "Protection",
		status: "coming-soon",
		icon: "🔐",
	},
	{
		id: "threat-intelligence",
		name: "Threat Intelligence",
		description:
			"Real-time intelligence platform for emerging security threats",
		category: "Intelligence",
		status: "available",
		icon: "🛡️",
		beta: true,
	},
	{
		id: "security-dashboard",
		name: "Security Dashboard",
		description:
			"Real-time aggregated view of your security posture from all tools",
		category: "Monitoring",
		status: "available",
		icon: "📊",
		beta: true,
	},
	{
		id: "network-monitor",
		name: "Network Monitor",
		description:
			"Advanced traffic analysis tool that detects anomalies in real-time",
		category: "Monitoring",
		status: "coming-soon",
		icon: "📡",
	},
	{
		id: "ai-recon-bot",
		name: "AI Recon Bot",
		description:
			"Cybersecurity tool that scans domains for surface-level risks with auto-tagged risk levels",
		category: "Scanning & Assessment",
		status: "available",
		icon: "🤖",
		beta: true,
	},
	{
		id: "smart-waf-tester",
		name: "Smart WAF and Firewall Bypass Tester",
		description:
			"Tests web application firewalls against common bypass techniques",
		category: "Scanning & Assessment",
		status: "available",
		icon: "🧪",
		beta: true,
	},
	{
		id: "form-input-scanner",
		name: "Form Input Vulnerability Scanner",
		description: "Automatically tests web forms for common vulnerabilities",
		category: "Scanning & Assessment",
		status: "available",
		icon: "📝",
		beta: true,
	},
	{
		id: "ai-misconfiguration-checker",
		name: "AI Misconfiguration Checker",
		description:
			"Identifies server and application misconfigurations that could lead to vulnerabilities",
		category: "Scanning & Assessment",
		status: "coming-soon",
		icon: "⚙️",
	},
	{
		id: "web-app-pentester-pro",
		name: "Flexgen Web App Pentester Pro",
		description: "Enterprise-grade web application penetration testing suite",
		category: "Scanning & Assessment",
		status: "available",
		icon: "🕸️",
		beta: true,
	},
	{
		id: "api-fuzzer",
		name: "AI-Powered API Fuzzer",
		description: "Deep fuzzing tool for REST APIs and GraphQL endpoints",
		category: "Scanning & Assessment",
		status: "available",
		icon: "🧠",
		beta: true,
	},
	{
		id: "cloud-exposure-analyzer",
		name: "Cloud Exposure Analyzer",
		description: "Scans for exposed cloud resources and misconfigurations",
		category: "Scanning & Assessment",
		status: "coming-soon",
		icon: "☁️",
	},
	{
		id: "automated-report-generator",
		name: "Automated Report Generator",
		description: "Consolidates security findings into comprehensive reports",
		category: "Reporting",
		status: "coming-soon",
		icon: "📄",
	},
];

export default function SearchParamsClient() {
	const searchParams = useSearchParams();
	const categoryParam = searchParams.get("category");

	const [selectedCategory, setSelectedCategory] = useState("All Tools");

	// Set the category based on URL parameter if present
	useEffect(() => {
		if (categoryParam && categories.includes(categoryParam)) {
			setSelectedCategory(categoryParam);
		}
	}, [categoryParam]);

	// Filter tools based on selected category
	const filteredTools =
		selectedCategory === "All Tools"
			? tools
			: tools.filter((tool) => tool.category === selectedCategory);

	return (
		<>
			{/* Category Filter */}
			<div className="flex flex-wrap justify-center gap-3 mb-8">
				{categories.map((category) => (
					<button
						key={category}
						onClick={() => setSelectedCategory(category)}
						className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
							selectedCategory === category
								? "bg-gray-800 text-white"
								: "bg-gray-100 hover:bg-gray-200 text-black"
						}`}
					>
						{category}
					</button>
				))}
			</div>

			{/* Tools Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{filteredTools.map((tool) => (
					<div
						key={tool.id}
						className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
					>
						<div className="p-6">
							<div className="flex items-start justify-between mb-4">
								<div className="bg-gray-100 rounded-full p-3 text-2xl">
									{tool.icon}
								</div>
								<div className="flex items-center">
									{tool.status === "coming-soon" ? (
										<span className="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
											Coming Soon
										</span>
									) : tool.beta ? (
										<span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
											Beta
										</span>
									) : (
										<span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
											Available
										</span>
									)}
								</div>
							</div>

							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								{tool.name}
							</h3>
							<p className="text-gray-600 text-sm mb-4">{tool.description}</p>

							<div className="flex items-center justify-between">
								<span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
									{tool.category}
								</span>

								{tool.status === "available" ? (
									<Link
										href={
											tool.id === "security-dashboard"
												? "/security-dashboard"
												: `/tools/${tool.id}`
										}
										className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
									>
										Launch Tool
									</Link>
								) : (
									<Link
										href={`/tools/coming-soon?tool=${encodeURIComponent(
											tool.name
										)}`}
										className="inline-flex items-center px-3 py-1.5 bg-gray-300 text-gray-600 text-sm font-medium rounded cursor-not-allowed"
									>
										Coming Soon
									</Link>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* No tools found message */}
			{filteredTools.length === 0 && (
				<div className="text-center py-12">
					<div className="text-gray-400 text-6xl mb-4">🔍</div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						No tools found
					</h3>
					<p className="text-gray-600">
						Try selecting a different category or check back later for new
						tools.
					</p>
				</div>
			)}
		</>
	);
}
