"use client";

import { useState } from "react";

interface SocialShareButtonsProps {
	title: string;
	slug: string;
}

export default function SocialShareButtons({
	title,
	slug,
}: SocialShareButtonsProps) {
	const [copied, setCopied] = useState(false);

	const pageUrl = `https://flexgen.ai/blog/${slug}`;
	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(pageUrl);

	const handleCopyLink = () => {
		navigator.clipboard.writeText(pageUrl);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="flex flex-wrap gap-3">
			{/* Twitter/X */}
			<a
				href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-colors"
				aria-label="Share on Twitter"
			>
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
				</svg>
			</a>

			{/* LinkedIn */}
			<a
				href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-colors"
				aria-label="Share on LinkedIn"
			>
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
				</svg>
			</a>

			{/* Facebook */}
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-colors"
				aria-label="Share on Facebook"
			>
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
				</svg>
			</a>

			{/* Copy Link Button */}
			<button
				className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-colors"
				onClick={handleCopyLink}
				aria-label={copied ? "Link copied!" : "Copy link"}
			>
				<svg
					className="w-5 h-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
					/>
				</svg>
				{copied && (
					<span className="absolute bg-black text-white text-xs px-2 py-1 rounded mt-1 ml-6">
						Copied!
					</span>
				)}
			</button>
		</div>
	);
}
