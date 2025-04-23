import { Suspense } from "react";
import Breadcrumb from "../components/common/Breadcrumbs";
import SearchParamsClient from "./SearchParamsClient";

// Loading fallback component
function LoadingFallback() {
	return (
		<div className="flex items-center justify-center min-h-[300px]">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primarySaffron"></div>
		</div>
	);
}

export default function BlogPage() {
	return (
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

			<Suspense fallback={<LoadingFallback />}>
				<SearchParamsClient />
			</Suspense>
		</div>
	);
}
