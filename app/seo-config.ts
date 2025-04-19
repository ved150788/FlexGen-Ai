import { Metadata } from "next";

// Base URL for canonical links and OpenGraph images
export const siteUrl = "https://flexgen.ai";

// Site name for OpenGraph
export const siteName = "FlexGen.ai - AI-Powered Cybersecurity Solutions";

// Default metadata values
export const defaultMetadata: Metadata = {
	title: "FlexGen.ai | AI-Powered Cybersecurity Solutions",
	description:
		"Protect your organization with advanced AI-driven cybersecurity solutions. Our expert team helps identify, prevent, and mitigate cyber threats.",
	authors: [{ name: "FlexGen.ai", url: siteUrl }],
	keywords: [
		"cybersecurity",
		"AI security",
		"threat detection",
		"risk assessment",
		"penetration testing",
	],
	creator: "FlexGen.ai",
	publisher: "FlexGen.ai",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		siteName,
		title: "FlexGen.ai | AI-Powered Cybersecurity Solutions",
		description:
			"Protect your organization with advanced AI-driven cybersecurity solutions. Our expert team helps identify, prevent, and mitigate cyber threats.",
		images: [
			{
				url: `${siteUrl}/images/og-default.jpg`,
				width: 1200,
				height: 630,
				alt: "FlexGen.ai Cybersecurity",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "FlexGen.ai | AI-Powered Cybersecurity Solutions",
		description:
			"Protect your organization with advanced AI-driven cybersecurity solutions. Our expert team helps identify, prevent, and mitigate cyber threats.",
		images: [`${siteUrl}/images/og-default.jpg`],
		creator: "@flexgen_ai",
	},
	alternates: {
		canonical: siteUrl,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: "google-site-verification-code", // Replace with actual Google verification code
	},
};

// Helper function to create page-specific metadata
export function createMetadata({
	title,
	description,
	path = "",
	image = "/images/og-default.jpg",
	type = "website",
}: {
	title: string;
	description: string;
	path?: string;
	image?: string;
	type?: "website" | "article";
}): Metadata {
	const pageUrl = path ? `${siteUrl}/${path}` : siteUrl;
	const imageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

	return {
		title,
		description,
		keywords: defaultMetadata.keywords,
		authors: defaultMetadata.authors,
		creator: defaultMetadata.creator,
		publisher: defaultMetadata.publisher,
		openGraph: {
			type,
			locale: "en_US",
			url: pageUrl,
			siteName,
			title,
			description,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [imageUrl],
			creator: "@flexgen_ai",
		},
		alternates: {
			canonical: pageUrl,
		},
		robots: defaultMetadata.robots,
		verification: defaultMetadata.verification,
	};
}
