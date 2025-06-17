"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	Users,
	AlertCircle,
	CheckCircle,
} from "lucide-react";
import { authAPI } from "@/lib/auth";

interface LoginFormData {
	email: string;
	password: string;
}

interface RegisterFormData {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

// Component that uses useSearchParams - needs to be wrapped in Suspense
function LoginPageContent() {
	const [isLogin, setIsLogin] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const router = useRouter();
	const searchParams = useSearchParams();

	const [loginData, setLoginData] = useState<LoginFormData>({
		email: "",
		password: "",
	});

	const [registerData, setRegisterData] = useState<RegisterFormData>({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	useEffect(() => {
		// Check for error messages from OAuth failures
		const errorParam = searchParams?.get("error");
		if (errorParam === "google_auth_failed") {
			setError("Google authentication failed. Please try again.");
		} else if (errorParam === "facebook_auth_failed") {
			setError("Facebook authentication failed. Please try again.");
		}

		// Check for success token from OAuth
		const token = searchParams?.get("token");
		if (token) {
			authAPI.setToken(token);

			// Check for redirect URL
			const redirect = searchParams?.get("redirect") || "/dashboard";
			router.push(redirect);
			return;
		}

		// Redirect if already authenticated
		if (authAPI.isAuthenticated()) {
			const redirect = searchParams?.get("redirect") || "/dashboard";
			router.push(redirect);
		}
	}, [searchParams, router]);

	const handleLoginSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const response = await authAPI.login(loginData);
			setSuccess("Login successful! Redirecting...");

			// Get redirect URL from search params
			const redirect = searchParams?.get("redirect") || "/dashboard";

			setTimeout(() => {
				router.push(redirect);
			}, 1000);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Login failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRegisterSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		// Validation
		if (registerData.password !== registerData.confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (registerData.password.length < 8) {
			setError("Password must be at least 8 characters long");
			setIsLoading(false);
			return;
		}

		try {
			const response = await authAPI.register({
				firstName: registerData.firstName,
				lastName: registerData.lastName,
				email: registerData.email,
				password: registerData.password,
			});

			setSuccess("Account created successfully! Redirecting...");

			// Get redirect URL from search params
			const redirect = searchParams?.get("redirect") || "/dashboard";

			setTimeout(() => {
				router.push(redirect);
			}, 1000);
		} catch (error) {
			setError(error instanceof Error ? error.message : "Registration failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSocialLogin = (provider: "google" | "facebook") => {
		if (provider === "google") {
			router.push(authAPI.getGoogleLoginUrl());
		} else if (provider === "facebook") {
			router.push(authAPI.getFacebookLoginUrl());
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
				{/* Header */}
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
						<Users className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-white mb-2">
						{isLogin ? "Welcome Back" : "Create Account"}
					</h1>
					<p className="text-gray-300">
						{isLogin
							? "Sign in to access your security dashboard"
							: "Join FlexGen AI for advanced security tools"}
					</p>
				</div>

				{/* Toggle Buttons */}
				<div className="flex bg-white/10 rounded-lg p-1 mb-6">
					<button
						onClick={() => setIsLogin(true)}
						className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
							isLogin
								? "bg-white text-gray-900 shadow-sm"
								: "text-gray-300 hover:text-white"
						}`}
					>
						Sign In
					</button>
					<button
						onClick={() => setIsLogin(false)}
						className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
							!isLogin
								? "bg-white text-gray-900 shadow-sm"
								: "text-gray-300 hover:text-white"
						}`}
					>
						Sign Up
					</button>
				</div>

				{/* Error/Success Messages */}
				{error && (
					<div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-red-400" />
						<span className="text-red-200">{error}</span>
					</div>
				)}

				{success && (
					<div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
						<CheckCircle className="w-5 h-5 text-green-400" />
						<span className="text-green-200">{success}</span>
					</div>
				)}

				{/* Social Login Buttons */}
				<div className="space-y-3 mb-6">
					<button
						onClick={() => handleSocialLogin("google")}
						className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
					>
						<svg className="w-5 h-5" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Continue with Google
					</button>

					<button
						onClick={() => handleSocialLogin("facebook")}
						className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
					>
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
						</svg>
						Continue with Facebook
					</button>
				</div>

				{/* Divider */}
				<div className="relative mb-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-600"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-transparent text-gray-400">or</span>
					</div>
				</div>

				{/* Login Form */}
				{isLogin ? (
					<form onSubmit={handleLoginSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Email Address
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									id="email"
									type="email"
									value={loginData.email}
									onChange={(e) =>
										setLoginData({ ...loginData, email: e.target.value })
									}
									className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your email"
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={loginData.password}
									onChange={(e) =>
										setLoginData({ ...loginData, password: e.target.value })
									}
									className="w-full pl-10 pr-12 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your password"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember"
									type="checkbox"
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="remember"
									className="ml-2 block text-sm text-gray-300"
								>
									Remember me
								</label>
							</div>
							<Link
								href="/forgot-password"
								className="text-sm text-blue-400 hover:text-blue-300"
							>
								Forgot password?
							</Link>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Signing In..." : "Sign In"}
						</button>
					</form>
				) : (
					/* Register Form */
					<form onSubmit={handleRegisterSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									First Name
								</label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
									<input
										id="firstName"
										type="text"
										value={registerData.firstName}
										onChange={(e) =>
											setRegisterData({
												...registerData,
												firstName: e.target.value,
											})
										}
										className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="First name"
										required
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Last Name
								</label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
									<input
										id="lastName"
										type="text"
										value={registerData.lastName}
										onChange={(e) =>
											setRegisterData({
												...registerData,
												lastName: e.target.value,
											})
										}
										className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Last name"
										required
									/>
								</div>
							</div>
						</div>

						<div>
							<label
								htmlFor="registerEmail"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Email Address
							</label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									id="registerEmail"
									type="email"
									value={registerData.email}
									onChange={(e) =>
										setRegisterData({ ...registerData, email: e.target.value })
									}
									className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your email"
									required
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="registerPassword"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									id="registerPassword"
									type={showPassword ? "text" : "password"}
									value={registerData.password}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											password: e.target.value,
										})
									}
									className="w-full pl-10 pr-12 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Create a password"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Confirm Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									value={registerData.confirmPassword}
									onChange={(e) =>
										setRegisterData({
											...registerData,
											confirmPassword: e.target.value,
										})
									}
									className="w-full pl-10 pr-12 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Confirm your password"
									required
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
								>
									{showConfirmPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<div className="flex items-center">
							<input
								id="terms"
								type="checkbox"
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								required
							/>
							<label
								htmlFor="terms"
								className="ml-2 block text-sm text-gray-300"
							>
								I agree to the{" "}
								<Link
									href="/terms"
									className="text-blue-400 hover:text-blue-300"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									href="/privacy"
									className="text-blue-400 hover:text-blue-300"
								>
									Privacy Policy
								</Link>
							</label>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Creating Account..." : "Create Account"}
						</button>
					</form>
				)}

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-gray-400 text-sm">
						{isLogin ? "Don't have an account? " : "Already have an account? "}
						<button
							onClick={() => setIsLogin(!isLogin)}
							className="text-blue-400 hover:text-blue-300 font-medium"
						>
							{isLogin ? "Sign up" : "Sign in"}
						</button>
					</p>
				</div>
			</div>
		</div>
	);
}

// Loading component for Suspense fallback
function LoginPageLoading() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center">
			<div className="text-white text-xl">Loading...</div>
		</div>
	);
}

// Main export with Suspense wrapper
export default function LoginPage() {
	return (
		<Suspense fallback={<LoginPageLoading />}>
			<LoginPageContent />
		</Suspense>
	);
}
