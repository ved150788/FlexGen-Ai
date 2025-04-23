import React, { Suspense } from "react";
import Link from "next/link";
import SearchParamsClient from "./SearchParamsClient";

// Loading fallback component
function LoadingFallback() {
	return (
		<div className="flex items-center justify-center min-h-[300px]">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primarySaffron"></div>
		</div>
	);
}

export default function ComingSoonPage() {
	return (
		<div className="max-w-5xl mx-auto px-4 py-16">
			{/* Back to Tools Dashboard Link */}
			<div className="mb-8">
				<Link
					href="/tools"
					className="inline-flex items-center text-gray-700 hover:text-primarySaffron transition"
				>
					<svg
						className="w-4 h-4 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Tools Dashboard
				</Link>
			</div>

			<Suspense fallback={<LoadingFallback />}>
				<SearchParamsClient />
			</Suspense>
		</div>
	);
}
