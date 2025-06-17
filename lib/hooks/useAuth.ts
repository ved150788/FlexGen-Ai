import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/auth";

export interface User {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	role: "ADMIN" | "USER" | "MODERATOR";
	token?: string;
}

export interface AuthState {
	user: User | null;
	loading: boolean;
	isAuthenticated: boolean;
	isAdmin: boolean;
}

export function useAuth(): AuthState & {
	executeTool: <T>(endpoint: string, data: any) => Promise<T>;
} {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const initAuth = async () => {
			try {
				const token = localStorage.getItem("auth_token");
				if (token) {
					// Validate token with backend
					const response = await fetch("/api/auth/validate", {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (response.ok) {
						const userData = await response.json();
						setUser(userData);
					} else {
						// Clear invalid token
						localStorage.removeItem("auth_token");
					}
				}
			} catch (error) {
				console.error("Auth initialization error:", error);
			} finally {
				setLoading(false);
			}
		};

		initAuth();
	}, []);

	const isAuthenticated = !!user;
	const isAdmin = user?.role === "ADMIN";

	// Function to execute tools with authentication handling
	const executeTool = async <T>(endpoint: string, data: any): Promise<T> => {
		try {
			const token = localStorage.getItem("auth_token");
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				body: JSON.stringify(data),
			});

			if (response.status === 401 || response.status === 403) {
				// Handle authentication required
				const currentPath = window.location.pathname;
				router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
				throw new Error("Authentication required");
			}

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			return response.json();
		} catch (error) {
			console.error("Tool execution error:", error);
			throw error;
		}
	};

	return {
		user,
		loading,
		isAuthenticated,
		isAdmin,
		executeTool,
	};
}

// Helper function to set mock user for testing
export function setMockUser(userType: "admin" | "user") {
	if (userType === "admin") {
		localStorage.setItem("auth_token", "admin_token");
	} else {
		localStorage.setItem("auth_token", "user_token");
	}
	window.location.reload();
}
