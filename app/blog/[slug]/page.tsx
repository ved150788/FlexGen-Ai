import React from "react";
import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
	FaTwitter,
	FaLinkedin,
	FaFacebook,
	FaUser,
	FaCalendarAlt,
	FaClock,
	FaChevronLeft,
	FaChevronRight,
	FaRegBookmark,
	FaShareAlt,
	FaTags,
	FaRegClock,
} from "react-icons/fa";

// Import styles
import "@/app/styles/blog-content.css";

// Import components
import Breadcrumbs from "@/app/components/common/Breadcrumbs";
import CtaSection from "@/app/components/common/CtaSection";
import CommentSection from "@/app/components/blog/CommentSection";

// Get blog content functions
import { getPostMetadata, getPostContent } from "@/lib/blog";
import { format } from "date-fns";

// Define types
type BlogPost = {
	slug: string;
	title: string;
	excerpt: string;
	categories: string[];
	// Add missing properties used in the component
	coverImage?: string;
	readingTime?: string;
	authorRole?: string;
	authorBio?: string;
};

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface Props {
	params: Params;
	searchParams?: SearchParams;
}

export async function generateMetadata(
	{ params }: Props,
	parent: ResolvingMetadata
): Promise<Metadata> {
	// Need to await params to access the slug
	const { slug } = await params;
	const post = getPostContent(slug);

	if (!post) {
		return {
			title: "Post Not Found",
			description: "The requested blog post could not be found.",
		};
	}

	return {
		title: `${post.metadata.title} | FlexGen AI Blog`,
		description: post.metadata.excerpt,
		openGraph: {
			title: post.metadata.title,
			description: post.metadata.excerpt,
			type: "article",
			url: `https://flexgen.ai/blog/${slug}`,
			images: [
				{
					url: post.metadata.coverImage || "/images/blog/default-hero.jpg",
					width: 1200,
					height: 630,
					alt: post.metadata.title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: post.metadata.title,
			description: post.metadata.excerpt,
			images: [post.metadata.coverImage || "/images/blog/default-hero.jpg"],
		},
	};
}

// Updated with async/await for Next.js 15
export default async function BlogPostPage({ params }: Props) {
	// Need to await params to access the slug
	const { slug } = await params;
	const post = getPostContent(slug);
	const posts = getPostMetadata();

	if (!post) {
		notFound();
	}

	// Filter out current post and get related posts
	const otherPosts = posts.filter((p: BlogPost) => p.slug !== slug);
	const relatedPosts = otherPosts
		.filter((p: BlogPost) =>
			p.categories.some((cat: string) =>
				post?.metadata.categories.includes(cat)
			)
		)
		.slice(0, 3);

	// Get next and previous posts
	const currentIndex = posts.findIndex((p: BlogPost) => p.slug === slug);
	const prevPost =
		currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
	const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

	const formattedDate = format(new Date(post.metadata.date), "MMMM dd, yyyy");
	const shareUrl = `https://flexgen.ai/blog/${slug}`;
	const shareTitle = post.metadata.title;

	return (
		<main className="blog-post-page min-h-screen bg-gradient-to-b from-gray-50 to-white">
			{/* Hero Section with Enhanced Parallax Effect */}
			<div className="relative h-[60vh] min-h-[500px] overflow-hidden">
				<div className="absolute inset-0 bg-gray-800 z-10"></div>
				<div className="absolute inset-0 z-0">
					<Image
						src={post.metadata.coverImage || "/images/blog/default-cover.jpg"}
						alt={post.metadata.title}
						fill
						className="object-cover"
						priority
					/>
				</div>
				<div className="absolute inset-0 bg-black/30 z-[5]"></div>

				<div className="container mx-auto px-4 h-full flex flex-col justify-end pb-16 relative z-20">
					<div className="max-w-4xl">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Blog", href: "/blog" },
								{
									label: post.metadata.title,
									href: `/blog/${slug}`,
								},
							]}
						/>

						<div className="flex flex-wrap gap-3 mb-6 mt-4">
							{post.metadata.categories?.map((category: string) => (
								<Link
									key={category}
									href={`/blog/category/${category}`}
									className="px-4 py-1.5 bg-blue-500/20 backdrop-blur-sm text-white text-sm rounded-full hover:bg-blue-500/30 transition duration-300"
								>
									{category}
								</Link>
							))}
						</div>

						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
							{post.metadata.title}
						</h1>

						<div className="flex flex-wrap items-center gap-6 text-white/90">
							<div className="flex items-center">
								<FaUser className="mr-2 text-blue-300" />
								<span>{post.metadata.author}</span>
							</div>
							<div className="flex items-center">
								<FaCalendarAlt className="mr-2 text-blue-300" />
								<span>{formattedDate}</span>
							</div>
							<div className="flex items-center">
								<FaRegClock className="mr-2 text-blue-300" />
								<span>
									{post.metadata.readingTime || post.metadata.readTime} min read
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-20"></div>
			</div>

			{/* Content Area */}
			<div className="container mx-auto px-4 py-0 -mt-10 relative z-30">
				<div className="flex flex-col lg:flex-row gap-12">
					{/* Main Column */}
					<div className="lg:w-2/3">
						{/* Blog Content */}
						<div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
							{/* Share and Save Links */}
							<div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
								<button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
									<FaRegBookmark className="text-blue-500" />
									<span className="text-sm font-medium">Save article</span>
								</button>
								<div className="flex items-center gap-2">
									<span className="text-sm text-gray-500 mr-1">Share:</span>
									<a
										href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
											shareUrl
										)}&text=${encodeURIComponent(shareTitle)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-[#1DA1F2] hover:text-white transition-all duration-300"
										aria-label="Share on Twitter"
									>
										<FaTwitter size={16} />
									</a>
									<a
										href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
											shareUrl
										)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-[#0A66C2] hover:text-white transition-all duration-300"
										aria-label="Share on LinkedIn"
									>
										<FaLinkedin size={16} />
									</a>
									<a
										href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
											shareUrl
										)}`}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-[#1877F2] hover:text-white transition-all duration-300"
										aria-label="Share on Facebook"
									>
										<FaFacebook size={16} />
									</a>
								</div>
							</div>

							{/* Blog Content */}
							<article className="blog-post-content prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:font-medium prose-img:rounded-xl prose-img:shadow-md">
								<div dangerouslySetInnerHTML={{ __html: post.content }} />
							</article>
						</div>

						{/* Tags */}
						{post.metadata.categories &&
							post.metadata.categories.length > 0 && (
								<div className="bg-gray-50 rounded-2xl p-8 mb-10">
									<h3 className="flex items-center text-xl font-semibold mb-4 text-gray-900">
										<FaTags className="mr-2 text-blue-500" />
										Topics
									</h3>
									<div className="flex flex-wrap gap-2">
										{post.metadata.categories.map((category: string) => (
											<Link
												key={category}
												href={`/blog/category/${category}`}
												className="px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium hover:bg-blue-500 hover:text-white transition-all duration-300 shadow-sm"
											>
												{category}
											</Link>
										))}
									</div>
								</div>
							)}

						{/* Post Navigation */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
							{prevPost && (
								<Link
									href={`/blog/${prevPost.slug}`}
									className="group flex flex-col p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500"
								>
									<span className="flex items-center text-blue-500 text-sm font-medium mb-2">
										<FaChevronLeft className="mr-2 text-xs group-hover:animate-pulse" />
										Previous Post
									</span>
									<h4 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
										{prevPost.title}
									</h4>
								</Link>
							)}

							{nextPost && (
								<Link
									href={`/blog/${nextPost.slug}`}
									className="group flex flex-col p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-r-4 border-blue-500 md:text-right"
								>
									<span className="flex items-center justify-end text-blue-500 text-sm font-medium mb-2">
										Next Post
										<FaChevronRight className="ml-2 text-xs group-hover:animate-pulse" />
									</span>
									<h4 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
										{nextPost.title}
									</h4>
								</Link>
							)}
						</div>

						{/* Related Posts */}
						{relatedPosts.length > 0 && (
							<div className="mb-16">
								<h3 className="text-2xl font-bold mb-8 text-gray-900">
									Related Articles
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{relatedPosts.map((relatedPost: BlogPost) => (
										<Link
											key={relatedPost.slug}
											href={`/blog/${relatedPost.slug}`}
											className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
										>
											<div className="aspect-w-16 aspect-h-9 relative h-48">
												<Image
													src={
														relatedPost.coverImage ||
														"/images/blog/default-thumbnail.jpg"
													}
													alt={relatedPost.title}
													fill
													className="object-cover group-hover:scale-105 transition-transform duration-500"
												/>
											</div>
											<div className="p-5">
												<h4 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
													{relatedPost.title}
												</h4>
												<p className="text-sm text-gray-600 line-clamp-3">
													{relatedPost.excerpt}
												</p>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}

						{/* Comment Section */}
						<CommentSection postSlug={slug} />
					</div>

					{/* Sidebar */}
					<div className="lg:w-1/3 space-y-8">
						{/* Author Info */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<div className="flex items-center mb-4">
								<div className="w-16 h-16 rounded-full overflow-hidden mr-4">
									<Image
										src={
											post.metadata.authorImage ||
											"/images/team/default-avatar.jpg"
										}
										alt={post.metadata.author}
										width={64}
										height={64}
										className="object-cover w-full h-full"
									/>
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">
										{post.metadata.author}
									</h3>
									<p className="text-sm text-gray-600">
										{post.metadata.authorTitle || "Content Writer"}
									</p>
								</div>
							</div>
							<p className="text-gray-700 text-sm">
								{
									"Expert content creator with a passion for cybersecurity and AI technologies."
								}
							</p>
						</div>

						{/* Newsletter Signup */}
						<div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
							<h3 className="text-xl font-bold mb-3">Stay Updated</h3>
							<p className="text-blue-100 mb-4">
								Get the latest cybersecurity insights and AI news delivered to
								your inbox.
							</p>
							<form className="space-y-3">
								<input
									type="email"
									placeholder="Your email address"
									className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
								/>
								<button
									type="submit"
									className="w-full bg-white text-blue-600 font-medium py-3 rounded-lg hover:bg-blue-50 transition-colors"
								>
									Subscribe
								</button>
							</form>
							<p className="text-xs text-blue-200 mt-3">
								We respect your privacy. Unsubscribe at any time.
							</p>
						</div>

						{/* Popular Posts */}
						<div className="bg-white rounded-2xl shadow-md p-6">
							<h3 className="text-xl font-bold mb-6 text-gray-900">
								Popular Posts
							</h3>
							<div className="space-y-4">
								{posts
									.slice(0, 4)
									.filter((p: BlogPost) => p.slug !== slug)
									.map((popularPost: BlogPost) => (
										<Link
											key={popularPost.slug}
											href={`/blog/${popularPost.slug}`}
											className="group flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
										>
											<div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 mr-4">
												<Image
													src={
														popularPost.coverImage ||
														"/images/blog/default-thumbnail.jpg"
													}
													alt={popularPost.title}
													width={80}
													height={80}
													className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
												/>
											</div>
											<div>
												<h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
													{popularPost.title}
												</h4>
												<span className="text-xs text-gray-500 mt-1 block">
													{popularPost.readingTime || "5"} min read
												</span>
											</div>
										</Link>
									))}
							</div>
						</div>

						{/* CTA Section */}
						<CtaSection />
					</div>
				</div>
			</div>
		</main>
	);
}
