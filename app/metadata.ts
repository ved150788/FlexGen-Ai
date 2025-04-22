import { Metadata } from "next";

export function generateMetadata(): Metadata {
	return {
		title: "FlexGen.ai | Enterprise-Grade AI Cybersecurity",
		description:
			"Our proprietary AI technologies provide predictive and proactive security solutions to protect your digital assets from emerging threats.",
		keywords: [
			"cybersecurity",
			"AI security",
			"enterprise security",
			"threat detection",
		],
		authors: [{ name: "FlexGen.ai Team" }],
		viewport: "width=device-width, initial-scale=1",
		robots: "index, follow",
	};
}
