"use client";

import { useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaLink } from "react-icons/fa";

interface SocialShareProps {
	title: string;
	url: string;
}

const SocialShare = ({ title, url }: SocialShareProps) => {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Encode the title and URL for social media sharing
	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(url);

	return (
		<div className="flex items-center gap-3">
			{/* Facebook */}
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
				aria-label="Share on Facebook"
			>
				<FaFacebookF />
			</a>

			{/* Twitter */}
			<a
				href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
				aria-label="Share on Twitter"
			>
				<FaTwitter />
			</a>

			{/* LinkedIn */}
			<a
				href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
				target="_blank"
				rel="noopener noreferrer"
				className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-800 hover:bg-blue-900 text-white transition-colors"
				aria-label="Share on LinkedIn"
			>
				<FaLinkedinIn />
			</a>

			{/* Copy Link */}
			<button
				onClick={copyToClipboard}
				className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-800 text-white transition-colors"
				aria-label="Copy link"
			>
				<FaLink />
			</button>

			{copied && (
				<span className="text-green-600 text-sm font-medium ml-2">
					Link copied!
				</span>
			)}
		</div>
	);
};

export default SocialShare;
