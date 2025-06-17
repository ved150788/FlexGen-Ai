"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function SecurityDashboardPage() {
	const [dashboard, setDashboard] = useState<Dashboard | null>(null);
	const [loading, setLoading] = useState(true);
	const [showAuthPrompt, setShowAuthPrompt] = useState(false);

	const { isAuthenticated } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isAuthenticated) {
			loadDashboard();
		} else {
			setLoading(false);
		}
	}, [isAuthenticated]);

	const loadDashboard = async () => {
		try {
			setLoading(true);
			// ... existing dashboard loading logic ...
		} catch (error) {
			console.error("Error loading dashboard:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAuthPrompt = () => {
		const currentPath = window.location.pathname;
		router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-12">
			{/* Authentication Prompt */}
			{showAuthPrompt && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
						<h3 className="text-xl font-semibold mb-4">
							Authentication Required
						</h3>
						<p className="text-gray-600 mb-6">
							Please sign in to view your security dashboard.
						</p>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() => setShowAuthPrompt(false)}
								className="px-4 py-2 text-gray-600 hover:text-gray-800"
							>
								Cancel
							</button>
							<button
								onClick={handleAuthPrompt}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Sign In
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Rest of the component */}
			{/* ... existing JSX ... */}
		</div>
	);
}
