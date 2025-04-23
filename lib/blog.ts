import { blogs } from "../data/blogs";

/**
 * Type definition for blog post metadata
 */
export type BlogMetadata = {
	id?: number;
	slug: string;
	title: string;
	summary: string;
	category: string;
	tags: string[];
	image: string;
	date: string;
	readTime: string;
	author?: string;
	authorRole?: string;
	authorTitle?: string;
	authorImage?: string;
	excerpt?: string;
	categories: string[];
	readingTime?: string;
	coverImage?: string;
};

/**
 * Type definition for blog post content
 */
export type BlogPost = {
	metadata: BlogMetadata;
	content: string;
};

/**
 * Get all blog posts metadata
 */
export function getPostMetadata() {
	return blogs.map((blog) => {
		// Convert blog data to the expected format
		return {
			slug: blog.slug,
			title: blog.title,
			excerpt: blog.summary,
			categories: blog.tags || [blog.category],
			date: blog.date,
			author: blog.author || "FlexGen AI Team",
			readingTime: blog.readTime,
			coverImage: blog.image,
		};
	});
}

/**
 * Get a specific blog post by slug
 */
export function getPostContent(slug?: string) {
	if (!slug) return null;

	const post = blogs.find((blog) => blog.slug === slug);

	if (!post) return null;

	// Convert to expected format
	return {
		metadata: {
			id: post.id,
			slug: post.slug,
			title: post.title,
			summary: post.summary,
			excerpt: post.summary,
			category: post.category,
			categories: post.tags || [post.category],
			tags: post.tags || [post.category],
			image: post.image,
			coverImage: post.image,
			date: post.date,
			readTime: post.readTime,
			readingTime: post.readTime,
			author: post.author || "FlexGen AI Team",
			authorTitle: post.authorRole || "AI Expert",
			authorImage: "/images/team/default-avatar.jpg",
		},
		content: post.content,
	};
}
