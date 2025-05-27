import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Threat Intelligence Platform | FlexGen.ai",
	description:
		"Search for threat intelligence on domains, IPs, and other indicators",
};

export default function ThreatIntelligenceLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
