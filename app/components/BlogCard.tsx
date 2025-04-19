"use client";
import Link from "next/link";

export default function BlogCard({ post }: { post: any }) {
	return (
		<div className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-lg transition">
			<Link href={`/blog/${post.slug}`}>
				<img
					src={post.image}
					alt={post.title}
					className="h-48 w-full object-cover"
				/>
			</Link>
			<div className="p-6">
				<div className="flex justify-between items-center mb-2">
					<span className="text-xs text-primarySaffron uppercase tracking-wide font-medium">
						{post.category}
					</span>
					<span className="text-xs text-gray-500">{post.date}</span>
				</div>
				<Link href={`/blog/${post.slug}`}>
					<h3 className="mt-2 text-xl font-semibold hover:text-primarySaffron transition">
						{post.title}
					</h3>
				</Link>
				<p className="text-gray-600 text-sm mt-2 line-clamp-3">
					{post.summary}
				</p>
				<div className="mt-4 flex items-center justify-between">
					<div className="flex items-center">
						<div className="text-sm">
							<p className="text-gray-900 font-medium">{post.author}</p>
							<p className="text-gray-500 text-xs">{post.authorRole}</p>
						</div>
					</div>
					<Link
						href={`/blog/${post.slug}`}
						className="text-sm text-primarySaffron font-medium hover:underline"
					>
						Read more →
					</Link>
				</div>
			</div>
		</div>
	);
}
