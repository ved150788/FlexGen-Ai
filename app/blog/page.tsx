import { blogs } from "../../data/blogs";
import BlogCard from "../components/BlogCard";
import SharedLayout from "../components/SharedLayout";
import Breadcrumb from "../components/Breadcrumbs";
import { Metadata } from "next";
import Script from "next/script";
import { createMetadata } from "../seo-config";

export const metadata: Metadata = createMetadata({
	title: "Cybersecurity Blog | FlexGen.ai",
	description:
		"Expert insights, guides, and tips on the latest cybersecurity trends, threats, and best practices to protect your business.",
	path: "blog",
	image: "/images/blog/blog-og.jpg",
});

// Type guard to ensure all required blog properties are present
function isValidBlog(blog: any): boolean {
	return (
		blog.slug &&
		blog.title &&
		blog.summary &&
		blog.date &&
		blog.category &&
		blog.image &&
		Array.isArray(blog.tags)
	);
}

export default function BlogPage() {
	// Filter blogs to ensure they have all required properties
	const validBlogs = blogs.filter(isValidBlog);

	// Get the featured blog (newest one)
	const featuredBlog = validBlogs.length > 0 ? validBlogs[0] : null;
	// Get the rest of the blogs
	const restOfBlogs = validBlogs.slice(1);

	// Create blog listing structured data
	const blogListingSchema = {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: "FlexGen.ai Cybersecurity Blog",
		description:
			"Expert insights, guides, and tips on the latest cybersecurity trends, threats, and best practices to protect your business.",
		url: "https://flexgen.ai/blog",
		publisher: {
			"@type": "Organization",
			name: "FlexGen.ai",
			logo: {
				"@type": "ImageObject",
				url: "https://flexgen.ai/logo.png",
			},
		},
		blogPosts: validBlogs.map((post) => ({
			"@type": "BlogPosting",
			headline: post.title,
			description: post.summary,
			datePublished: post.date,
			author: {
				"@type": "Person",
				name: post.author || "FlexGen.ai Team",
			},
			url: `https://flexgen.ai/blog/${post.slug}`,
			image: post.image,
			keywords: post.tags?.join(", "),
		})),
	};

	// Create breadcrumb schema
	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: "https://flexgen.ai",
			},
			{
				"@type": "ListItem",
				position: 2,
				name: "Blog",
				item: "https://flexgen.ai/blog",
			},
		],
	};

	return (
		<>
			<Script id="blog-schema" type="application/ld+json">
				{JSON.stringify(blogListingSchema)}
			</Script>
			<Script id="breadcrumb-schema" type="application/ld+json">
				{JSON.stringify(breadcrumbSchema)}
			</Script>
			<SharedLayout>
				<div className="bg-gray-50">
					{/* Hero Section */}
					<div className="bg-gray-900 text-white">
						<div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
							<div className="mb-8">
								<Breadcrumb
									items={[{ label: "Home", href: "/" }, { label: "Blog" }]}
								/>
							</div>
							<div className="grid md:grid-cols-2 gap-12 items-center">
								<div>
									<h1 className="text-4xl md:text-5xl font-bold mb-6">
										Cybersecurity Insights & Resources
									</h1>
									<p className="text-lg text-gray-300 mb-8 max-w-xl">
										Stay informed with the latest cybersecurity trends, best
										practices, and expert guidance to protect your organization
										in an evolving threat landscape.
									</p>
								</div>
								<div className="relative">
									<div className="absolute -top-10 -left-10 w-24 h-24 bg-primarySaffron opacity-20 rounded-full blur-xl"></div>
									<div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primarySaffron opacity-30 rounded-full blur-xl"></div>
									<img
										src="/images/top5.png"
										alt="Cybersecurity Blog"
										className="w-full h-auto rounded-lg shadow-lg relative z-10"
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Featured Article */}
					{featuredBlog && (
						<div className="max-w-7xl mx-auto px-4 py-12">
							<h2 className="text-2xl font-bold mb-8 border-l-4 border-primarySaffron pl-4">
								Featured Article
							</h2>
							<div className="bg-white rounded-xl shadow-lg overflow-hidden">
								<div className="grid md:grid-cols-5 gap-0">
									<div className="col-span-2">
										<img
											src={featuredBlog.image}
											alt={featuredBlog.title}
											className="h-full w-full object-cover"
										/>
									</div>
									<div className="col-span-3 p-8 flex flex-col justify-center">
										<div className="flex items-center space-x-2 mb-3">
											<span className="bg-primarySaffron/10 text-primarySaffron px-3 py-1 rounded-full text-sm font-medium">
												{featuredBlog.category}
											</span>
											<span className="text-gray-500 text-sm">
												{featuredBlog.date}
											</span>
										</div>
										<h3 className="text-2xl md:text-3xl font-bold mb-4">
											<a
												href={`/blog/${featuredBlog.slug}`}
												className="hover:text-primarySaffron transition"
											>
												{featuredBlog.title}
											</a>
										</h3>
										<p className="text-gray-600 mb-6 line-clamp-3">
											{featuredBlog.summary}
										</p>
										<div className="flex items-center justify-between mt-auto">
											<div className="flex items-center">
												<div className="ml-3">
													<p className="text-sm font-medium text-gray-900">
														{featuredBlog.author || "FlexGen.ai Team"}
													</p>
													<p className="text-xs text-gray-500">
														{featuredBlog.authorRole || "Contributor"}
													</p>
												</div>
											</div>
											<a
												href={`/blog/${featuredBlog.slug}`}
												className="inline-flex items-center text-primarySaffron font-medium hover:underline"
											>
												Read more
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="ml-1 h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 5l7 7-7 7"
													/>
												</svg>
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Blog Grid */}
					<div className="max-w-7xl mx-auto px-4 py-12">
						<h2 className="text-2xl font-bold mb-8 border-l-4 border-primarySaffron pl-4">
							Latest Articles
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{restOfBlogs.map((post) => (
								<BlogCard key={post.slug} post={post} />
							))}
						</div>
					</div>

					{/* CTA Section */}
					<div className="max-w-7xl mx-auto px-4 py-16">
						<div className="bg-gray-900 text-white rounded-xl p-8 md:p-12">
							<div className="text-center max-w-3xl mx-auto">
								<h2 className="text-3xl font-bold mb-4">
									Stay Up-to-Date with Cybersecurity Trends
								</h2>
								<p className="text-gray-300 mb-8">
									Subscribe to our newsletter to receive the latest
									cybersecurity insights, best practices, and expert guidance
									directly to your inbox.
								</p>
								<form className="flex flex-col sm:flex-row gap-4 justify-center">
									<input
										type="email"
										placeholder="Enter your email"
										className="px-4 py-3 rounded-lg focus:outline-none text-black w-full sm:w-auto"
									/>
									<button
										type="submit"
										className="bg-primarySaffron text-black px-6 py-3 rounded-lg font-medium hover:bg-white transition"
									>
										Subscribe
									</button>
								</form>
								<p className="text-xs text-gray-400 mt-4">
									We respect your privacy. Unsubscribe at any time.
								</p>
							</div>
						</div>
					</div>
				</div>
			</SharedLayout>
		</>
	);
}
