"use client";

import Link from "next/link";
import Image from "next/image";

interface BlogPost {
	slug: string;
	title: string;
	summary: string;
	date: string;
	author?: string;
	authorRole?: string;
	category: string;
	image: string;
	tags: string[];
}

export default function BlogCard({ post }: { post: BlogPost }) {
	return (
		<div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
			<div className="relative h-48 overflow-hidden">
				<Image
					src={post.image}
					alt={post.title}
					layout="fill"
					objectFit="cover"
					className="transition-transform duration-500 hover:scale-105"
					onError={(e) => {
						// Fallback image if the post image doesn't exist
						const target = e.target as HTMLImageElement;
						target.src = "/Images/flexgenlogo.png";
					}}
				/>
				<div className="absolute top-3 left-3">
					<span className="bg-primarySaffron/90 text-black px-3 py-1 rounded-full text-xs font-medium">
						{post.category}
					</span>
				</div>
			</div>

			<div className="p-6 flex-grow flex flex-col">
				<div className="mb-3">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm text-gray-500">{post.date}</span>
						<div className="flex flex-wrap gap-1">
							{post.tags.slice(0, 2).map((tag, index) => (
								<span
									key={index}
									className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
					<h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-primarySaffron transition-colors">
						<Link href={`/blog/${post.slug}`}>{post.title}</Link>
					</h3>
					<p className="text-gray-600 text-sm line-clamp-3 mb-4">
						{post.summary}
					</p>
				</div>

				<div className="mt-auto flex items-center justify-between">
					<div className="flex items-center">
						<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold">
							{post.author ? post.author.charAt(0) : "F"}
						</div>
						<div className="ml-2">
							<p className="text-sm font-medium">
								{post.author || "FlexGen.ai Team"}
							</p>
							<p className="text-xs text-gray-500">
								{post.authorRole || "Contributor"}
							</p>
						</div>
					</div>
					<Link
						href={`/blog/${post.slug}`}
						className="text-sm text-primarySaffron font-medium hover:underline flex items-center"
					>
						Read more
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4 ml-1"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</Link>
				</div>
			</div>
		</div>
	);
}
