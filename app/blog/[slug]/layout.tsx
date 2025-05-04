import { blogs } from "../../data/blogs";
import { Metadata } from "next";

// Generate metadata for each blog post page
export async function generateMetadata({
	params,
}: {
	params: { slug: string };
}): Promise<Metadata> {
	// No need to await the params
	const { slug } = params;

	// Find the post with the matching slug
	const post = blogs.find((b) => b.slug === slug);

	if (!post) {
		return {
			title: "Blog Post Not Found | FlexGen.ai",
			description: "The requested blog post could not be found.",
		};
	}

	return {
		title: `${post.title} | FlexGen.ai Blog`,
		description: post.summary,
		openGraph: {
			title: post.title,
			description: post.summary,
			url: `https://flexgen.ai/blog/${slug}`,
			siteName: "FlexGen.ai Cybersecurity Blog",
			images: [
				{
					url: post.image,
					width: 1200,
					height: 630,
					alt: post.title,
				},
			],
			locale: "en_US",
			type: "article",
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.summary,
			images: [post.image],
			creator: "@flexgen_ai",
		},
		alternates: {
			canonical: `https://flexgen.ai/blog/${slug}`,
		},
		metadataBase: new URL("https://flexgen.ai"),
	};
}

// Generate static paths for all blog posts
export function generateStaticParams() {
	return blogs.map((post) => ({ slug: post.slug }));
}

export default function BlogPostLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
