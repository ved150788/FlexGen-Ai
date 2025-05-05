import { blogs } from "../../data/blogs";
import type { Metadata, ResolvingMetadata } from "next";

type BlogParams = Promise<{ slug: string }>;

// Generate metadata for each blog post page
export async function generateMetadata(
	{ params }: { params: BlogParams },
	parent: ResolvingMetadata
): Promise<Metadata> {
	// Need to await params to access the slug
	const { slug } = await params;

	const post = blogs.find((b) => b.slug === slug);

	if (!post) {
		return {
			title: "Blog Post Not Found | FlexGen.ai",
			description: "The requested blog post could not be found.",
		};
	}

	// Get data from parent
	const previousImages = (await parent).openGraph?.images || [];

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
				...previousImages,
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
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
	return blogs.map((post) => ({
		slug: post.slug,
	}));
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
