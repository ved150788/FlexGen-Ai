"use client";

import { useState, useEffect, useCallback } from "react";
import { blogs } from "../data/blogs";
import BlogCard from "../components/common/BlogCard";
import Link from "next/link";
import Script from "next/script";

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

// Filter blogs to ensure they have all required properties
const validBlogs = blogs.filter(isValidBlog);
// Get the featured blog (newest one)
const featuredBlog = validBlogs.length > 0 ? validBlogs[0] : null;
// Get the rest of the blogs
const restOfBlogs = validBlogs.slice(1);

// Extract all unique categories and tags for filters
const allCategories = Array.from(
	new Set(validBlogs.map((blog) => blog.category))
);
const allTags = Array.from(new Set(validBlogs.flatMap((blog) => blog.tags)));

export default function SearchParamsClient() {
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

			<div className="max-w-7xl mx-auto px-4 py-12">
				{/* Filters Section */}
				<div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Categories */}
					<div className="bg-white p-6 rounded-xl shadow-md">
						<h3 className="text-lg font-semibold mb-4 text-gray-800">
							Categories
						</h3>
						<div className="space-y-2">
							{allCategories.map((category) => (
								<button
									key={category}
									onClick={() => handleCategoryChange(category)}
									className={`block w-full text-left px-3 py-2 rounded-md transition ${
										selectedCategory === category
											? "bg-primarySaffron text-black"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{category}
								</button>
							))}
						</div>
					</div>

					{/* Popular Tags */}
					<div className="bg-white p-6 rounded-xl shadow-md">
						<h3 className="text-lg font-semibold mb-4 text-gray-800">
							Popular Tags
						</h3>
						<div className="flex flex-wrap gap-2">
							{allTags.slice(0, 15).map((tag) => (
								<button
									key={tag}
									onClick={() => handleTagChange(tag)}
									className={`px-3 py-1 rounded-full text-sm transition ${
										selectedTag === tag
											? "bg-primarySaffron text-black"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{tag}
								</button>
							))}
						</div>
					</div>

					{/* Search and Active Filters */}
					<div className="bg-white p-6 rounded-xl shadow-md">
						<h3 className="text-lg font-semibold mb-4 text-gray-800">
							Search Articles
						</h3>
						<div className="relative mb-4">
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search by keyword..."
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron"
							/>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
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

						{/* Active filters */}
						<div className="mt-4">
							<div className="flex justify-between items-center mb-2">
								<h4 className="font-medium text-gray-700">Active Filters:</h4>
								{(selectedCategory || selectedTag || searchQuery) && (
									<button
										onClick={clearFilters}
										className="text-sm text-primarySaffron hover:underline"
									>
										Clear all
									</button>
								)}
							</div>
							<div className="flex flex-wrap gap-2">
								{selectedCategory && (
									<span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
										{selectedCategory}
										<button
											onClick={() => setSelectedCategory(null)}
											className="ml-2 text-gray-500 hover:text-gray-700"
										>
											&times;
										</button>
									</span>
								)}
								{selectedTag && (
									<span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
										{selectedTag}
										<button
											onClick={() => setSelectedTag(null)}
											className="ml-2 text-gray-500 hover:text-gray-700"
										>
											&times;
										</button>
									</span>
								)}
								{searchQuery && (
									<span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 flex items-center">
										"{searchQuery}"
										<button
											onClick={() => setSearchQuery("")}
											className="ml-2 text-gray-500 hover:text-gray-700"
										>
											&times;
										</button>
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Blog List */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold mb-8 border-l-4 border-primarySaffron pl-4">
						All Articles{" "}
						{filteredBlogs.length > 0 && `(${filteredBlogs.length})`}
					</h2>

					{filteredBlogs.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{filteredBlogs.map((blog) => (
								<BlogCard key={blog.slug} post={blog} />
							))}
						</div>
					) : (
						<div className="bg-white p-8 rounded-xl shadow-md text-center">
							<h3 className="text-xl font-semibold mb-4">No articles found</h3>
							<p className="text-gray-600 mb-6">
								No articles match your current filters. Try adjusting your
								search criteria.
							</p>
							<button
								onClick={clearFilters}
								className="px-6 py-2 bg-primarySaffron text-black rounded-md hover:bg-yellow-500 transition"
							>
								Clear all filters
							</button>
						</div>
					)}
				</div>

				{/* Newsletter CTA */}
				<div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-8 text-white shadow-xl">
					<div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between">
						<div className="mb-6 md:mb-0 md:mr-8">
							<h3 className="text-2xl font-bold mb-2">Stay in the know</h3>
							<p className="text-gray-300">
								Subscribe to our newsletter for the latest cybersecurity
								insights and updates.
							</p>
						</div>
						<div className="w-full md:w-auto flex-shrink-0">
							<div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
								<input
									type="email"
									placeholder="Your email address"
									className="px-4 py-2 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-primarySaffron"
								/>
								<button className="bg-primarySaffron text-black px-6 py-2 rounded-md hover:bg-yellow-500 transition whitespace-nowrap">
									Subscribe
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
