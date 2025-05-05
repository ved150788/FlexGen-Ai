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

// Get blog content functions
import { getPostMetadata, getPostContent } from "@/lib/blog";
import { format } from "date-fns";

// Define types
type BlogPost = {
	slug: string;
	title: string;
	excerpt: string;
	categories: string[];
};

// Update the Props type to match Next.js 15 requirements
interface Props {
	params: {
		slug: string;
	};
	searchParams: Record<string, string | string[] | undefined>;
}

export async function generateMetadata(
	{ params, searchParams }: Props,
	parent: ResolvingMetadata
): Promise<Metadata> {
	const { slug } = params;
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

// Use the updated Props interface
export default function BlogPostPage({ params }: Props) {
	const { slug } = params;
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
				<div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/90 z-10"></div>
				<div className="absolute inset-0 z-0">
					<Image
						src={post.metadata.coverImage || "/images/blog/default-cover.jpg"}
						alt={post.metadata.title}
						fill
						className="object-cover brightness-50"
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
												className="px-4 py-2 bg-white hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-full text-sm font-medium transition duration-200"
											>
												{category}
											</Link>
										))}
									</div>
								</div>
							)}

						{/* Author Bio */}
						<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-10">
							<div className="flex items-center">
								<div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-blue-100">
									<Image
										src={
											post.metadata.authorImage ||
											"/images/team/default-avatar.jpg"
										}
										alt={post.metadata.author}
										width={64}
										height={64}
										className="object-cover w-full h-full"
										unoptimized
									/>
								</div>
								<div>
									<h3 className="font-bold text-lg">{post.metadata.author}</h3>
									<p className="text-sm text-gray-600">
										{post.metadata.authorTitle || "AI Expert"}
									</p>
								</div>
							</div>
							<p className="mt-4 text-gray-700">
								Expert in artificial intelligence and machine learning with
								years of industry experience.
							</p>
						</div>

						{/* Navigation */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
							{prevPost && (
								<Link
									href={`/blog/${prevPost.slug}`}
									className="group p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-100 transition duration-300 flex items-center"
								>
									<div className="mr-4 text-blue-500 group-hover:text-blue-600">
										<FaChevronLeft size={20} />
									</div>
									<div>
										<p className="text-sm text-gray-500 mb-1">
											Previous Article
										</p>
										<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
											{prevPost.title}
										</h3>
									</div>
								</Link>
							)}
							{nextPost && (
								<Link
									href={`/blog/${nextPost.slug}`}
									className="group p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-blue-100 transition duration-300 flex items-center justify-end text-right"
								>
									<div>
										<p className="text-sm text-gray-500 mb-1">Next Article</p>
										<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
											{nextPost.title}
										</h3>
									</div>
									<div className="ml-4 text-blue-500 group-hover:text-blue-600">
										<FaChevronRight size={20} />
									</div>
								</Link>
							)}
						</div>

						{/* Related Posts */}
						<div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-8">
							<h3 className="text-xl font-bold mb-6">Related Articles</h3>
							<div className="space-y-6">
								{relatedPosts.length > 0 ? (
									relatedPosts.map((related: BlogPost) => (
										<div
											key={related.slug}
											className="group bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition duration-300"
										>
											<Link href={`/blog/${related.slug}`} className="block">
												<h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
													{related.title}
												</h4>
												<p className="text-sm text-gray-500 line-clamp-2">
													{related.excerpt}
												</p>
												<span className="text-xs text-blue-600 mt-3 inline-block font-medium">
													Read more →
												</span>
											</Link>
										</div>
									))
								) : (
									<p className="text-gray-500 bg-white p-6 rounded-xl text-center">
										No related posts found.
									</p>
								)}
							</div>
						</div>

						{/* Comments Section */}
						<div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
							<h3 className="text-2xl font-bold mb-6 text-gray-900">
								Discussion
							</h3>
							<div className="space-y-6">
								<div className="border-b pb-6 mb-6">
									<h4 className="text-lg font-semibold mb-4">
										Leave a comment
									</h4>
									<form className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<input
												type="text"
												placeholder="Name"
												className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
											<input
												type="email"
												placeholder="Email"
												className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>
										<textarea
											placeholder="Your comment"
											rows={4}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
										></textarea>
										<button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
											Post Comment
										</button>
									</form>
								</div>
								<p className="text-gray-500 text-center italic">
									Be the first to comment on this article!
								</p>
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="lg:w-1/3">
						{/* Author Card */}
						<div className="bg-white rounded-2xl shadow-lg p-8 mb-8 sticky top-24">
							<div className="flex flex-col items-center text-center mb-6">
								<div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-blue-100 shadow-md">
									<Image
										src={
											post.metadata.authorImage ||
											"/images/team/default-avatar.jpg"
										}
										alt={post.metadata.author}
										width={96}
										height={96}
										className="object-cover w-full h-full"
										unoptimized
									/>
								</div>
								<h3 className="text-xl font-bold text-gray-900">
									{post.metadata.author}
								</h3>
								<p className="text-blue-600 text-sm font-medium mt-1">
									{post.metadata.authorTitle || "AI Expert"}
								</p>
							</div>

							<div className="border-t border-gray-100 pt-6 mb-6">
								<h4 className="font-semibold text-lg mb-4 text-gray-900">
									Get in Touch
								</h4>
								<form className="space-y-4">
									<input
										type="text"
										placeholder="Name"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<input
										type="email"
										placeholder="Email"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<textarea
										placeholder="Message"
										rows={3}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
									></textarea>
									<button className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
										Send Message
									</button>
								</form>
							</div>

							<div className="border-t border-gray-100 pt-6">
								<h4 className="font-semibold text-lg mb-4 text-gray-900">
									Request a Demo
								</h4>
								<Link
									href="/contact"
									className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 shadow-md hover:shadow-lg"
								>
									Schedule Now
								</Link>
							</div>
						</div>

						{/* Newsletter Signup */}
						<div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-2xl shadow-lg p-8">
							<h3 className="text-xl font-bold mb-4">Stay Updated</h3>
							<p className="mb-6 text-white/90">
								Subscribe to our newsletter for the latest insights on AI and
								technology.
							</p>
							<form className="space-y-3">
								<input
									type="email"
									placeholder="Your email address"
									className="w-full px-4 py-3 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
								/>
								<button className="w-full py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition duration-300">
									Subscribe
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<CtaSection />
		</main>
	);
}
