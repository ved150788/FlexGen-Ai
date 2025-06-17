// Authentication API utility functions
import React from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
	process.env.NODE_ENV === "production"
		? process.env.NEXT_PUBLIC_PRODUCTION_API_URL || "https://api.flexgenai.com"
		: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar?: string;
	isEmailVerified: boolean;
	createdAt: string;
	lastLogin: string;
}

export interface AuthResponse {
	message: string;
	token: string;
	user: User;
}

export interface ScanResult {
	id: string;
	scanType: string;
	targetUrl?: string;
	targetIp?: string;
	riskLevel: string;
	threatsFound: number;
	scanDuration: number;
	createdAt: string;
	scanResults: any;
}

export interface UserPreferences {
	emailNotifications: boolean;
	securityAlerts: boolean;
	marketingEmails: boolean;
	theme: "light" | "dark";
	language: string;
	timezone: string;
}

class AuthAPI {
	private getHeaders(includeAuth = false) {
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (includeAuth) {
			const token = this.getToken();
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
		}

		return headers;
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			const error = await response
				.json()
				.catch(() => ({ error: "Network error" }));
			throw new Error(
				error.error || `HTTP ${response.status}: ${response.statusText}`
			);
		}
		return response.json();
	}

	// Token management
	getToken(): string | null {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("authToken");
	}

	setToken(token: string): void {
		if (typeof window === "undefined") return;
		localStorage.setItem("authToken", token);
	}

	removeToken(): void {
		if (typeof window === "undefined") return;
		localStorage.removeItem("authToken");
		localStorage.removeItem("user");
	}

	isAuthenticated(): boolean {
		return !!this.getToken();
	}

	// Authentication endpoints
	async register(userData: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}): Promise<AuthResponse> {
		const response = await fetch(`${API_BASE_URL}/auth/register`, {
			method: "POST",
			headers: this.getHeaders(),
			body: JSON.stringify(userData),
		});

		const data = await this.handleResponse<AuthResponse>(response);
		this.setToken(data.token);
		return data;
	}

	async login(credentials: {
		email: string;
		password: string;
	}): Promise<AuthResponse> {
		const response = await fetch(`${API_BASE_URL}/auth/login`, {
			method: "POST",
			headers: this.getHeaders(),
			body: JSON.stringify(credentials),
		});

		const data = await this.handleResponse<AuthResponse>(response);
		this.setToken(data.token);
		return data;
	}

	async logout(): Promise<void> {
		try {
			await fetch(`${API_BASE_URL}/auth/logout`, {
				method: "POST",
				headers: this.getHeaders(true),
			});
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			this.removeToken();
		}
	}

	// User profile endpoints
	async getProfile(): Promise<{ user: User }> {
		const response = await fetch(`${API_BASE_URL}/auth/profile`, {
			headers: this.getHeaders(true),
		});

		return this.handleResponse<{ user: User }>(response);
	}

	async updateProfile(profileData: {
		firstName: string;
		lastName: string;
		avatar?: string;
	}): Promise<{ message: string }> {
		const response = await fetch(`${API_BASE_URL}/auth/profile`, {
			method: "PUT",
			headers: this.getHeaders(true),
			body: JSON.stringify(profileData),
		});

		return this.handleResponse<{ message: string }>(response);
	}

	// User preferences
	async getPreferences(): Promise<{ preferences: UserPreferences }> {
		const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
			headers: this.getHeaders(true),
		});

		return this.handleResponse<{ preferences: UserPreferences }>(response);
	}

	async updatePreferences(
		preferences: UserPreferences
	): Promise<{ message: string }> {
		const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
			method: "PUT",
			headers: this.getHeaders(true),
			body: JSON.stringify(preferences),
		});

		return this.handleResponse<{ message: string }>(response);
	}

	// Scan history endpoints
	async getScanHistory(
		page = 1,
		limit = 10
	): Promise<{
		scans: ScanResult[];
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
	}> {
		const response = await fetch(
			`${API_BASE_URL}/scans/history?page=${page}&limit=${limit}`,
			{
				headers: this.getHeaders(true),
			}
		);

		return this.handleResponse(response);
	}

	async saveScanResult(scanData: {
		scanType: string;
		targetUrl?: string;
		targetIp?: string;
		scanResults: any;
		riskLevel: string;
		threatsFound: number;
		scanDuration: number;
	}): Promise<{ message: string; scanId: string }> {
		const response = await fetch(`${API_BASE_URL}/scans/save`, {
			method: "POST",
			headers: this.getHeaders(true),
			body: JSON.stringify(scanData),
		});

		return this.handleResponse(response);
	}

	// Health check
	async healthCheck(): Promise<{ status: string; timestamp: string }> {
		const response = await fetch(`${API_BASE_URL}/health`);
		return this.handleResponse(response);
	}

	// Social login URLs
	getGoogleLoginUrl(): string {
		return `${API_BASE_URL}/auth/google`;
	}

	getFacebookLoginUrl(): string {
		return `${API_BASE_URL}/auth/facebook`;
	}

	// Token validation
	async validateToken(): Promise<{ user: User }> {
		const response = await fetch(`${API_BASE_URL}/auth/validate`, {
			headers: this.getHeaders(true),
		});

		return this.handleResponse<{ user: User }>(response);
	}
}

// Create and export a singleton instance
export const authAPI = new AuthAPI();

// Utility functions for React components
export const useAuth = () => {
	const isAuthenticated = authAPI.isAuthenticated();

	return {
		isAuthenticated,
		login: authAPI.login.bind(authAPI),
		register: authAPI.register.bind(authAPI),
		logout: authAPI.logout.bind(authAPI),
		getProfile: authAPI.getProfile.bind(authAPI),
		updateProfile: authAPI.updateProfile.bind(authAPI),
		getPreferences: authAPI.getPreferences.bind(authAPI),
		updatePreferences: authAPI.updatePreferences.bind(authAPI),
		getScanHistory: authAPI.getScanHistory.bind(authAPI),
		saveScanResult: authAPI.saveScanResult.bind(authAPI),
		getGoogleLoginUrl: authAPI.getGoogleLoginUrl.bind(authAPI),
		getFacebookLoginUrl: authAPI.getFacebookLoginUrl.bind(authAPI),
	};
};

// Authentication guard hook
export const useAuthGuard = (redirectPath?: string) => {
	const router = useRouter();
	const isAuthenticated = authAPI.isAuthenticated();

	if (typeof window !== "undefined" && !isAuthenticated) {
		const currentPath = window.location.pathname;
		const redirectUrl = redirectPath || currentPath;
		router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
		return false;
	}

	return isAuthenticated;
};

// Higher-order component for authentication protection
export function withAuth<P extends object>(
	WrappedComponent: React.ComponentType<P>,
	redirectPath?: string
) {
	return function AuthenticatedComponent(props: P) {
		const isAuthenticated = useAuthGuard(redirectPath);

		if (!isAuthenticated) {
			return (
				<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
					<div className="text-white text-xl">Redirecting to login...</div>
				</div>
			);
		}

		return <WrappedComponent {...props} />;
	};
}

export default authAPI;
