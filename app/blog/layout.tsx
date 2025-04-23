import { createMetadata } from "../seo-config";
import { Metadata } from "next";

export const metadata: Metadata = createMetadata({
	title: "Cybersecurity Blog | FlexGen.ai",
	description:
		"Expert insights, guides, and tips on the latest cybersecurity trends, threats, and best practices to protect your business.",
	path: "blog",
	image: "/images/blog/blog-og.jpg",
});

export default function BlogLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
