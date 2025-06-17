"use client";

import React, { useState } from "react";
import {
	HeaderFeedbackButton,
	SidebarFeedbackButton,
	FloatingFeedbackButton,
} from "@/components/feedback/FeedbackButton";
import {
	HeaderFeedbackNavigation,
	SidebarFeedbackNavigation,
	DropdownFeedbackNavigation,
} from "@/components/navigation/FeedbackNavigation";
import { setMockUser } from "@/lib/hooks/useAuth";
import { User, Settings, MoreVertical } from "lucide-react";

export default function FeedbackDemoPage() {
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [currentModule, setCurrentModule] = useState("Feedback Demo");

	const modules = [
		"Dashboard",
		"API Fuzzer",
		"AI Recon Bot",
		"Vulnerability Scanner",
		"Web App Pentester Pro",
		"Smart WAF Tester",
		"Form Input Scanner",
		"Threat Intelligence",
	];

	const handleRoleSwitch = (role: "admin" | "user") => {
		setMockUser(role);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<h1 className="text-xl font-semibold text-gray-900">
								FlexGen.ai Feedback System Demo
							</h1>
						</div>
						<div className="flex items-center space-x-4">
							{/* Header Feedback Button */}
							<HeaderFeedbackButton currentModule={currentModule} />

							{/* Header Feedback Navigation */}
							<HeaderFeedbackNavigation />

							{/* User Dropdown Demo */}
							<div className="relative">
								<button
									onClick={() => setShowUserDropdown(!showUserDropdown)}
									className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
										<User className="w-4 h-4 text-white" />
									</div>
									<span className="text-gray-700 font-medium">Demo User</span>
									<MoreVertical className="w-4 h-4 text-gray-600" />
								</button>

								{showUserDropdown && (
									<div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 border">
										<div className="px-4 py-3 border-b border-gray-100">
											<p className="font-medium">Demo User</p>
											<p className="text-sm text-gray-600">demo@flexgen.ai</p>
										</div>
										<a
											href="/dashboard"
											className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
										>
											<Settings className="w-4 h-4 mr-2" />
											Dashboard
										</a>
										{/* Dropdown Feedback Navigation */}
										<DropdownFeedbackNavigation />
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="flex">
				{/* Sidebar */}
				<aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
					<nav className="mt-8 px-4">
						<div className="space-y-2">
							<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
								Modules
							</h3>
							{modules.map((module) => (
								<button
									key={module}
									onClick={() => setCurrentModule(module)}
									className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										currentModule === module
											? "bg-blue-100 text-blue-700"
											: "text-gray-700 hover:bg-gray-100"
									}`}
								>
									{module}
								</button>
							))}
						</div>

						{/* Sidebar Feedback Navigation */}
						<div className="mt-8 pt-8 border-t border-gray-200">
							<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
								Feedback
							</h3>
							<SidebarFeedbackNavigation />

							{/* Sidebar Feedback Button */}
							<div className="mt-4">
								<SidebarFeedbackButton currentModule={currentModule} />
							</div>
						</div>
					</nav>
				</aside>

				{/* Main Content */}
				<main className="flex-1 p-8">
					<div className="max-w-4xl mx-auto">
						<div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
							<h2 className="text-2xl font-bold text-gray-900 mb-4">
								Feedback System Demo
							</h2>
							<p className="text-gray-600 mb-6">
								This demo shows the feedback system implementation with
								role-based access control. Switch between admin and user roles
								to see different feedback views.
							</p>

							{/* Role Switching */}
							<div className="bg-gray-50 rounded-lg p-4 mb-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-3">
									Test Different User Roles
								</h3>
								<div className="flex space-x-4">
									<button
										onClick={() => handleRoleSwitch("admin")}
										className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
									>
										Switch to Admin
									</button>
									<button
										onClick={() => handleRoleSwitch("user")}
										className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
									>
										Switch to User
									</button>
								</div>
								<p className="text-sm text-gray-600 mt-2">
									<strong>Admin:</strong> Can access feedback dashboard to
									view/manage all feedback
									<br />
									<strong>User:</strong> Can access my-feedback page to view
									only their own feedback
								</p>
							</div>

							{/* Current Module Display */}
							<div className="bg-blue-50 rounded-lg p-4 mb-6">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">
									Current Module: {currentModule}
								</h3>
								<p className="text-gray-600">
									The feedback button automatically detects the current module.
									Click on different modules in the sidebar to see this change.
								</p>
							</div>

							{/* Feature Overview */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="bg-white border rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-2">
										Feedback Button Variants
									</h3>
									<ul className="text-sm text-gray-600 space-y-1">
										<li>
											• <strong>Floating:</strong> Always visible on tool pages
										</li>
										<li>
											• <strong>Header:</strong> In top navigation bar
										</li>
										<li>
											• <strong>Sidebar:</strong> In navigation menus
										</li>
									</ul>
								</div>

								<div className="bg-white border rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-2">
										Navigation Components
									</h3>
									<ul className="text-sm text-gray-600 space-y-1">
										<li>
											• <strong>Header:</strong> Role-based feedback links
										</li>
										<li>
											• <strong>Sidebar:</strong> Navigation menu integration
										</li>
										<li>
											• <strong>Dropdown:</strong> User menu integration
										</li>
									</ul>
								</div>

								<div className="bg-white border rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-2">
										Admin Features
									</h3>
									<ul className="text-sm text-gray-600 space-y-1">
										<li>• View all feedback submissions</li>
										<li>• Advanced filtering and search</li>
										<li>• Edit and update feedback status</li>
										<li>• Manage feedback conversations</li>
									</ul>
								</div>

								<div className="bg-white border rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-2">
										User Features
									</h3>
									<ul className="text-sm text-gray-600 space-y-1">
										<li>• View only personal feedback</li>
										<li>• Track feedback status updates</li>
										<li>• See developer responses</li>
										<li>• Search personal feedback history</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>

			{/* Floating Feedback Button (always visible) */}
			<FloatingFeedbackButton currentModule={currentModule} />
		</div>
	);
}
