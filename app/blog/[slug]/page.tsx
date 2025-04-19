import { blogs } from "../../../data/blogs";
import { notFound } from "next/navigation";
import BreadcrumbLayout from "../../components/BreadcrumbLayout";
import SharedLayout from "../../components/SharedLayout";
import { Metadata } from "next";
import Image from "next/image";

interface Props {
	params: { slug: string };
}

// ✅ SEO Metadata
export function generateMetadata({ params }: Props): Metadata {
	const post = blogs.find((b) => b.slug === params.slug);
	if (!post) return {};

	return {
		title: `${post.title} | FlexGen.ai Blog`,
		description: post.summary,
		openGraph: {
			title: post.title,
			description: post.summary,
			url: `https://flexgen.ai/blog/${params.slug}`,
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
			canonical: `https://flexgen.ai/blog/${params.slug}`,
		},
	};
}

// ✅ Static pre-generation of routes
export function generateStaticParams() {
	return blogs.map((b) => ({ slug: b.slug }));
}

// ✅ Main Page Component
export default function BlogDetailPage({ params }: Props) {
	const post = blogs.find((b) => b.slug === params.slug);
	if (!post) return notFound();

	const breadcrumbItems = [
		{ label: "Home", href: "/" },
		{ label: "Blog", href: "/blog" },
		{ label: post.title },
	];

	// ✅ Inject JSON-LD for Article and BreadcrumbList
	const articleJsonLd = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.title,
		description: post.summary,
		image: post.image,
		datePublished: post.date,
		author: {
			"@type": "Person",
			name: post.author,
			jobTitle: post.authorRole,
		},
		publisher: {
			"@type": "Organization",
			name: "FlexGen.ai",
			logo: {
				"@type": "ImageObject",
				url: "https://flexgen.ai/logo.png",
			},
		},
		mainEntityOfPage: {
			"@type": "WebPage",
			"@id": `https://flexgen.ai/blog/${params.slug}`,
		},
		keywords: post.tags.join(", "),
	};

	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbItems.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.label,
			item: item.href
				? `https://flexgen.ai${item.href}`
				: `https://flexgen.ai/blog/${post.slug}`,
		})),
	};

	// Related posts
	const relatedPosts = blogs
		.filter((b) => b.slug !== post.slug)
		.filter((b) => b.tags.some((tag) => post.tags.includes(tag)))
		.slice(0, 3);

	return (
		<SharedLayout>
			<BreadcrumbLayout breadcrumbItems={breadcrumbItems}>
				{/* JSON-LD for SEO */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
				/>

				<article className="bg-white">
					<div className="relative h-[50vh] min-h-[400px] bg-black">
						<Image
							src={post.image}
							alt={post.title}
							className="absolute w-full h-full object-cover opacity-70"
							width={1200}
							height={630}
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
						<div className="absolute bottom-0 left-0 right-0 p-8 text-white">
							<div className="max-w-4xl mx-auto">
								<div className="mb-4">
									<span className="bg-primarySaffron text-black px-3 py-1 rounded-full text-sm font-medium">
										{post.category}
									</span>
								</div>
								<h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
									{post.title}
								</h1>
								<div className="flex items-center space-x-4">
									<div>
										<p className="font-medium">{post.author}</p>
										<p className="text-sm opacity-80">{post.authorRole}</p>
									</div>
									<span className="text-sm opacity-80">|</span>
									<p className="text-sm opacity-80">{post.date}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="max-w-4xl mx-auto px-4 py-12">
						<div className="prose prose-lg max-w-none">
							<p className="text-xl text-gray-700 mb-8 font-medium leading-relaxed">
								{post.summary}
							</p>

							<div className="markdown-content">
								{/* If using actual markdown, you would use a markdown renderer here */}
								<div className="whitespace-pre-line text-gray-800 leading-relaxed">
									{post.content}
								</div>
							</div>

							{post.tags.length > 0 && (
								<div className="mt-12 pt-8 border-t border-gray-200">
									<h3 className="text-lg font-semibold mb-4">Related Topics</h3>
									<div className="flex flex-wrap gap-2">
										{post.tags.map((tag, idx) => (
											<span
												key={idx}
												className="bg-gray-100 hover:bg-gray-200 transition text-gray-800 px-3 py-1 rounded-full text-sm"
											>
												#{tag}
											</span>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Author Bio */}
						<div className="mt-12 pt-8 border-t border-gray-200">
							<div className="flex items-start space-x-4">
								<div className="flex-1">
									<h3 className="font-semibold text-lg">About the Author</h3>
									<p className="font-medium">{post.author}</p>
									<p className="text-gray-600">
										{post.authorRole} at FlexGen.ai
									</p>
									<p className="mt-2 text-gray-700">
										Security expert with over a decade of experience in
										cybersecurity, risk assessment, and threat intelligence.
									</p>
								</div>
							</div>
						</div>

						{/* Related Posts */}
						{relatedPosts.length > 0 && (
							<div className="mt-12 pt-8 border-t border-gray-200">
								<h3 className="text-2xl font-bold mb-6">Related Articles</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{relatedPosts.map((relatedPost) => (
										<a
											key={relatedPost.slug}
											href={`/blog/${relatedPost.slug}`}
											className="group block"
										>
											<div className="rounded-lg overflow-hidden mb-3">
												<Image
													src={relatedPost.image}
													alt={relatedPost.title}
													className="h-48 w-full object-cover group-hover:scale-105 transition duration-300"
													width={300}
													height={200}
												/>
											</div>
											<h4 className="font-semibold group-hover:text-primarySaffron transition">
												{relatedPost.title}
											</h4>
											<p className="text-sm text-gray-600 mt-1">
												{relatedPost.date}
											</p>
										</a>
									))}
								</div>
							</div>
						)}

						{/* CTA */}
						<div className="mt-16 bg-gray-900 text-white p-8 rounded-lg text-center">
							<h3 className="text-2xl font-bold mb-4">
								Ready to Enhance Your Cybersecurity?
							</h3>
							<p className="mb-6 max-w-2xl mx-auto">
								Learn how FlexGen.ai can help protect your organization with our
								expert cybersecurity services and solutions.
							</p>
							<a
								href="/contact"
								className="inline-block bg-primarySaffron text-black px-8 py-3 rounded-lg font-medium hover:bg-white transition duration-300"
							>
								Request a Security Consultation
							</a>
						</div>
					</div>
				</article>
			</BreadcrumbLayout>
		</SharedLayout>
	);
}
