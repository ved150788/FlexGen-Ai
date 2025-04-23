import { Suspense } from "react";
import SearchParamsClient from "./SearchParamsClient";

// Loading fallback component
function LoadingFallback() {
	return (
		<div className="flex items-center justify-center min-h-[300px]">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primarySaffron"></div>
		</div>
	);
}

export default function ToolsDashboard() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-12">
			<div className="text-center mb-10">
				<h1 className="text-4xl font-bold mb-3">Security Tools Dashboard</h1>
				<p className="text-lg text-gray-600 max-w-3xl mx-auto">
					Explore our suite of cybersecurity tools designed to strengthen your
					security posture
				</p>
			</div>

			<Suspense fallback={<LoadingFallback />}>
				<SearchParamsClient />
			</Suspense>
		</div>
	);
}
