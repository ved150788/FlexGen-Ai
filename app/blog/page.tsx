"use client";

import { useState, useEffect, useCallback } from "react";
import { blogs } from "../data/blogs";
import BlogCard from "../components/common/BlogCard";
import Breadcrumb from "../components/common/Breadcrumbs";
import Script from "next/script";
import Link from "next/link";

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

// Filter blogs to ensure they have all required properties - moved outside component to avoid re-computation
const validBlogs = blogs.filter(isValidBlog);
// Get the featured blog (newest one)
const featuredBlog = validBlogs.length > 0 ? validBlogs[0] : null;
// Get the rest of the blogs
const restOfBlogs = validBlogs.slice(1);

// Extract all unique categories and tags for filters - moved outside component to avoid re-computation
const allCategories = Array.from(
	new Set(validBlogs.map((blog) => blog.category))
);
const allTags = Array.from(new Set(validBlogs.flatMap((blog) => blog.tags)));

export default function BlogPage() {
	// State for filters
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedTag, setSelectedTag] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredBlogs, setFilteredBlogs] = useState(restOfBlogs);

	// Apply filters - memoized with useCallback to prevent recreation on every render
	const applyFilters = useCallback(() => {
		let filtered = restOfBlogs;

		if (selectedCategory) {
			filtered = filtered.filter((blog) => blog.category === selectedCategory);
		}

		if (selectedTag) {
			filtered = filtered.filter((blog) => blog.tags.includes(selectedTag));
		}

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(blog) =>
					blog.title.toLowerCase().includes(query) ||
					blog.summary.toLowerCase().includes(query) ||
					blog.tags.some((tag) => tag.toLowerCase().includes(query))
			);
		}

		setFilteredBlogs(filtered);
	}, [selectedCategory, selectedTag, searchQuery]);

	// Apply filters when dependencies change
	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

	// Handle filter changes - memoized with useCallback
	const handleCategoryChange = useCallback(
		(category: string | null) => {
			setSelectedCategory(category === selectedCategory ? null : category);
		},
		[selectedCategory]
	);

	const handleTagChange = useCallback(
		(tag: string | null) => {
			setSelectedTag(tag === selectedTag ? null : tag);
		},
		[selectedTag]
	);

	const clearFilters = useCallback(() => {
		setSelectedCategory(null);
		setSelectedTag(null);
		setSearchQuery("");
	}, []);

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
			<div className="bg-gray-50">
				{/* Hero Section */}
				<div className="bg-gradient-to-r from-gray-900 to-black text-white">
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
									practices, and expert guidance to protect your organization in
									an evolving threat landscape.
								</p>
								<div className="relative max-w-xl">
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search articles..."
										className="w-full px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primarySaffron text-gray-800"
									/>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5 absolute right-4 top-3.5 text-gray-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
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
						<div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
							<div className="grid md:grid-cols-5 gap-0">
								<div className="col-span-2 relative overflow-hidden">
									<img
										src={featuredBlog.image}
										alt={featuredBlog.title}
										className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
										<Link
											href={`/blog/${featuredBlog.slug}`}
											className="text-white font-bold text-lg hover:underline"
										>
											Read the full article
										</Link>
									</div>
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
										<Link
											href={`/blog/${featuredBlog.slug}`}
											className="hover:text-primarySaffron transition"
										>
											{featuredBlog.title}
										</Link>
									</h3>
									<p className="text-gray-600 mb-6 line-clamp-3">
										{featuredBlog.summary}
									</p>
									<div className="flex flex-wrap gap-2 mb-6">
										{featuredBlog.tags.map((tag, index) => (
											<span
												key={index}
												className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-gray-200"
												onClick={() => handleTagChange(tag)}
											>
												#{tag}
											</span>
										))}
									</div>
									<div className="flex items-center justify-between mt-auto">
										<div className="flex items-center">
											<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold">
												{featuredBlog.author
													? featuredBlog.author.charAt(0)
													: "F"}
											</div>
											<div className="ml-3">
												<p className="text-sm font-medium text-gray-900">
													{featuredBlog.author || "FlexGen.ai Team"}
												</p>
												<p className="text-xs text-gray-500">
													{featuredBlog.authorRole || "Contributor"}
												</p>
											</div>
										</div>
										<Link
											href={`/blog/${featuredBlog.slug}`}
											className="inline-flex items-center px-4 py-2 bg-primarySaffron text-black rounded-full font-medium hover:bg-primarySaffron/90 transition-colors"
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
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Filter Section */}
				<div className="max-w-7xl mx-auto px-4 py-6">
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
						<div>
							<h2 className="text-2xl font-bold border-l-4 border-primarySaffron pl-4">
								Articles
							</h2>
							<p className="text-gray-500 mt-2">
								{filteredBlogs.length}{" "}
								{filteredBlogs.length === 1 ? "article" : "articles"}{" "}
								{selectedCategory || selectedTag || searchQuery
									? "found"
									: "available"}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{(selectedCategory || selectedTag || searchQuery) && (
								<button
									onClick={clearFilters}
									className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm font-medium flex items-center"
								>
									Clear filters
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4 ml-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							)}
						</div>
					</div>

					{/* Filter Pills */}
					<div className="mb-8">
						<div className="mb-4">
							<h3 className="text-sm font-medium text-gray-500 mb-2">
								Categories:
							</h3>
							<div className="flex flex-wrap gap-2">
								{allCategories.map((category, index) => (
									<button
										key={index}
										onClick={() => handleCategoryChange(category)}
										className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
											selectedCategory === category
												? "bg-primarySaffron text-black"
												: "bg-white text-gray-700 hover:bg-gray-100"
										}`}
									>
										{category}
									</button>
								))}
							</div>
						</div>
						<div>
							<h3 className="text-sm font-medium text-gray-500 mb-2">
								Popular Tags:
							</h3>
							<div className="flex flex-wrap gap-2">
								{allTags.slice(0, 8).map((tag, index) => (
									<button
										key={index}
										onClick={() => handleTagChange(tag)}
										className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
											selectedTag === tag
												? "bg-primarySaffron text-black"
												: "bg-white text-gray-700 hover:bg-gray-100"
										}`}
									>
										#{tag}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Blog Grid */}
					{filteredBlogs.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
							{filteredBlogs.map((post) => (
								<BlogCard key={post.slug} post={post} />
							))}
						</div>
					) : (
						<div className="bg-white rounded-lg p-8 text-center my-12">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-16 w-16 mx-auto text-gray-300 mb-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<h3 className="text-xl font-bold mb-2">No articles found</h3>
							<p className="text-gray-600 mb-4">
								No articles match your current filters. Try adjusting your
								search criteria or browse all articles.
							</p>
							<button
								onClick={clearFilters}
								className="px-4 py-2 bg-primarySaffron text-black rounded-md font-medium hover:bg-primarySaffron/90 transition-colors"
							>
								View all articles
							</button>
						</div>
					)}
				</div>

				{/* CTA Section */}
				<div className="max-w-7xl mx-auto px-4 py-16">
					<div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-xl overflow-hidden shadow-xl">
						<div className="grid md:grid-cols-5">
							<div className="col-span-3 p-8 md:p-12">
								<h2 className="text-3xl font-bold mb-4">
									Stay Up-to-Date with Cybersecurity Trends
								</h2>
								<p className="text-gray-300 mb-8 max-w-lg">
									Subscribe to our newsletter to receive the latest
									cybersecurity insights, best practices, and expert guidance
									directly to your inbox.
								</p>
								<form className="flex flex-col sm:flex-row gap-4">
									<input
										type="email"
										placeholder="Enter your email"
										className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primarySaffron text-black w-full sm:max-w-xs"
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
							<div className="col-span-2 relative hidden md:block">
								<div className="absolute inset-0 bg-primarySaffron opacity-20"></div>
								<div className="absolute inset-0 flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-32 w-32 text-white opacity-40"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1}
											d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
