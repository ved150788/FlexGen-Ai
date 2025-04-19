"use client";

import { useSearchParams } from "next/navigation";
import SharedLayout from "../../components/SharedLayout";
import Link from "next/link";

// Tool descriptions
const toolInfo = {
	"Vulnerability Scanner": {
		description:
			"Our comprehensive scanner identifies security vulnerabilities across your entire digital infrastructure including web applications, networks, and servers.",
		features: [
			"Continuous scanning",
			"Detailed reporting",
			"Risk prioritization",
			"Integration with CI/CD pipelines",
		],
	},
	"Password Manager": {
		description:
			"Secure password management solution for teams and enterprises with advanced encryption and access controls.",
		features: [
			"Zero-knowledge architecture",
			"Breach monitoring",
			"SSO integration",
			"Secure sharing",
		],
	},
	"Threat Intelligence": {
		description:
			"Real-time threat intelligence platform that collects, analyzes and distributes actionable intelligence about emerging threats.",
		features: [
			"Global threat database",
			"Customized alerts",
			"Attribution analysis",
			"Integration with SIEM systems",
		],
	},
	"Security Dashboard": {
		description:
			"Comprehensive security monitoring dashboard providing real-time visibility into your organization's security posture.",
		features: [
			"Unified security metrics",
			"Compliance tracking",
			"Risk visualization",
			"Executive reporting",
		],
	},
	"Network Monitor": {
		description:
			"Advanced network traffic analysis tool that detects anomalies and potential security incidents in real-time.",
		features: [
			"Deep packet inspection",
			"Behavioral analysis",
			"Automated alerting",
			"Historical traffic analysis",
		],
	},
	"AI Recon Bot": {
		description:
			"Intelligent reconnaissance tool that collects surface-level information about your digital assets and identifies potential security issues.",
		features: [
			"WHOIS data collection",
			"DNS enumeration",
			"SSL certificate validation",
			"Open port detection",
			"AI-generated insights",
		],
	},
	"Smart WAF and Firewall Bypass Tester": {
		description:
			"Tests your web application firewalls and network firewalls against common bypass techniques to identify weaknesses.",
		features: [
			"WAF detection",
			"Bypass simulation",
			"AI-suggested mitigations",
			"Non-destructive testing",
		],
	},
	"Form Input Vulnerability Scanner": {
		description:
			"Automatically tests web forms for common vulnerabilities like XSS, SQL injection, and command injection.",
		features: [
			"Smart payload selection",
			"Non-destructive testing",
			"Detailed vulnerability explanations",
			"Remediation guidance",
		],
	},
	"AI Misconfiguration Checker": {
		description:
			"Identifies common server and application misconfigurations that could lead to security vulnerabilities.",
		features: [
			"Header analysis",
			"Error page evaluation",
			"NLP-powered detection",
			"Best practice recommendations",
		],
	},
	"Flexgen Web App Pentester Pro": {
		description:
			"Enterprise-grade web application penetration testing suite for comprehensive security assessment.",
		features: [
			"DOM-based XSS detection",
			"SSRF/SSTI payload injection",
			"Single-page app handling",
			"Plain-English vulnerability explanations",
		],
	},
	"AI-Powered API Fuzzer": {
		description:
			"Deep fuzzing tool for REST APIs and GraphQL endpoints to identify security weaknesses and logic flaws.",
		features: [
			"OpenAPI/Swagger integration",
			"Intelligent payload generation",
			"Automated edge case testing",
			"Detailed reporting",
		],
	},
	"Cloud Exposure Analyzer": {
		description:
			"Scans for exposed cloud resources and misconfigurations across AWS, Azure, and GCP environments.",
		features: [
			"S3 bucket security assessment",
			"IAM policy analysis",
			"Least privilege recommendations",
			"Multi-cloud support",
		],
	},
	"Automated Report Generator": {
		description:
			"Consolidates security findings into comprehensive, branded reports with actionable insights.",
		features: [
			"Executive summaries",
			"Technical details",
			"CVSS scoring",
			"Prioritized remediation roadmap",
		],
	},
};

export default function ComingSoonPage() {
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
		<SharedLayout>
			<div className="max-w-5xl mx-auto px-4 py-16">
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
							<ul className="space-y-2 mb-8">
								{toolData.features.map((feature, index) => (
									<li key={index} className="flex items-start">
										<span className="text-primarySaffron mr-2">✓</span>
										<span className="text-gray-700">{feature}</span>
									</li>
								))}
							</ul>

							<div className="border-t border-gray-200 pt-6 mt-6">
								<p className="text-gray-600 italic">
									We're working hard to bring you this powerful cybersecurity
									tool. Sign up below to be notified when it launches.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-6">
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h3 className="font-semibold text-lg mb-4 text-gray-800">
								Get Notified
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								Be the first to know when this tool is available:
							</p>
							<form className="space-y-3">
								<input
									type="email"
									placeholder="Your email address"
									className="w-full px-4 py-2 border border-gray-300 rounded-md"
									required
								/>
								<button
									type="submit"
									className="w-full bg-primarySaffron text-black font-medium py-2 px-4 rounded-md hover:bg-black hover:text-white transition duration-300"
								>
									Notify Me
								</button>
							</form>
						</div>

						<div className="bg-gray-50 p-6 rounded-lg shadow-md">
							<h3 className="font-semibold text-lg mb-3 text-gray-800">
								Explore Our Services
							</h3>
							<div className="space-y-2">
								<Link
									href="/services/risk-assessment"
									className="block px-4 py-2 bg-white hover:bg-gray-100 rounded-md text-sm transition"
								>
									Risk Assessment
								</Link>
								<Link
									href="/services/threat-detection"
									className="block px-4 py-2 bg-white hover:bg-gray-100 rounded-md text-sm transition"
								>
									Threat Detection
								</Link>
								<Link
									href="/services/penetration-testing"
									className="block px-4 py-2 bg-white hover:bg-gray-100 rounded-md text-sm transition"
								>
									Penetration Testing
								</Link>
								<Link
									href="/services"
									className="block text-primarySaffron hover:text-black text-sm mt-3 transition"
								>
									View all services →
								</Link>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-12 text-center">
					<Link
						href="/"
						className="inline-flex items-center text-gray-700 hover:text-primarySaffron transition"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Return to Home
					</Link>
				</div>
			</div>
		</SharedLayout>
	);
}
