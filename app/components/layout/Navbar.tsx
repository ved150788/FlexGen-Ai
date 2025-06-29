"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

// Remove Tools from separate dropdown and add to main navItems
const navItems = [
	{ name: "Home", href: "/" },
	{ name: "Tools", href: "/tools", isDropdown: true },
	{ name: "Services", href: "/services" },
	{ name: "About", href: "/about" },
	{ name: "Blogs", href: "/blog" },
	{ name: "Contact Us", href: "/contact" },
];

// Add tools data with categories
const toolsCategories = [
	{
		category: "Security Monitoring",
		tools: [
			{
				name: "Security Dashboard",
				href: "/security-dashboard",
				icon: "📊",
				featured: true,
			},
			{
				name: "Threat Intelligence",
				href: "/tools/threat-intelligence",
			},
			{
				name: "Network Monitor",
				href: "/tools/coming-soon?tool=Network Monitor",
			},
		],
	},
	{
		category: "Security Assessment",
		tools: [
			{
				name: "Vulnerability Scanner",
				href: "/tools/vulnerability-scanner",
			},
			{
				name: "Password Manager",
				href: "/tools/coming-soon?tool=Password Manager",
			},
		],
	},
	{
		category: "Lightweight Testing Tools",
		tools: [
			{
				name: "AI Recon Bot",
				href: "/tools/ai-recon-bot",
			},
			{
				name: "Smart WAF & Firewall Bypass Tester",
				href: "/tools/smart-waf-tester",
			},
			{
				name: "Form Input Vulnerability Scanner",
				href: "/tools/form-input-scanner",
			},
			{
				name: "AI Misconfiguration Checker",
				href: "/tools/coming-soon?tool=AI Misconfiguration Checker",
			},
		],
	},
	{
		category: "Advanced Penetration Testing",
		tools: [
			{
				name: "Web App Pentester Pro",
				href: "/tools/web-app-pentester-pro",
			},
			{
				name: "AI-Powered API Fuzzer",
				href: "/tools/api-fuzzer",
			},
			{
				name: "Cloud Exposure Analyzer",
				href: "/tools/coming-soon?tool=Cloud Exposure Analyzer",
			},
			{
				name: "Automated Report Generator",
				href: "/tools/coming-soon?tool=Automated Report Generator",
			},
		],
	},
];

export default function Navbar() {
	const pathname = usePathname();
	const [showMobile, setShowMobile] = useState(false);
	const [showToolsDropdown, setShowToolsDropdown] = useState(false);
	const dropdownRef = useRef<HTMLLIElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				showToolsDropdown
			) {
				setShowToolsDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showToolsDropdown]);

	// Close mobile menu on route change
	useEffect(() => {
		setShowMobile(false);
	}, [pathname]);

	return (
		<>
			<nav className="relative w-full px-6 py-4 flex items-center justify-between bg-white text-white border-b-0 ">
				<div className="flex-1">
					<a href="/" className="font-bold text-xl">
						<Image
							src="/Images/flexgenlogo.png"
							alt="Flexgen Logo"
							width={150}
							height={48}
							className="h-12 w-auto" // change height here
						/>
					</a>
				</div>

				{/* Center Search */}
				<div className="hidden md:flex flex-1 justify-center border border-gray-300 rounded p-2 mx-4 max-w-xs">
					<input
						type="text"
						placeholder="Search..."
						className="px-3 py-1 rounded bg-white text-black focus:outline-none w-full"
					/>
				</div>

				{/* Desktop Nav */}
				<ul className="hidden md:flex flex-1 justify-end space-x-4 items-center whitespace-nowrap">
					{navItems.map((item) => (
						<li
							key={item.name}
							className="relative"
							ref={item.isDropdown ? dropdownRef : undefined}
						>
							{item.isDropdown ? (
								<>
									<button
										className="nav-link flex items-center"
										onClick={() => setShowToolsDropdown(!showToolsDropdown)}
									>
										{item.name}
										<svg
											className={`w-4 h-4 ml-1 transform ${
												showToolsDropdown ? "rotate-180" : ""
											}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</button>

									{showToolsDropdown && (
										<div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-lg rounded-md py-1 z-50 text-black">
											{/* Security Dashboard - Featured Link */}
											<Link
												href="/security-dashboard"
												className="block px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 border-b border-gray-100 flex items-center bg-blue-10"
												onClick={() => setShowToolsDropdown(false)}
											>
												<span className="text-lg mr-2">📊</span>
												Security Dashboard
												<span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
													Featured
												</span>
											</Link>

											{/* Tools Dashboard Link */}
											<Link
												href="/tools"
												className="block px-4 py-3 text-sm font-bold text-primarySaffron hover:bg-gray-50 border-b border-gray-100 flex items-center"
												onClick={() => setShowToolsDropdown(false)}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-5 w-5 mr-2"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M4 6h16M4 12h16M4 18h7"
													/>
												</svg>
												All Tools
											</Link>
											{toolsCategories.map((category, i) => (
												<div key={i} className="mb-2">
													<div className="px-4 py-1 text-xs font-bold uppercase bg-gray-100 text-gray-600">
														{category.category}
													</div>
													<div>
														{category.tools.map((tool) => (
															<Link
																key={tool.href}
																href={tool.href}
																className={`block px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
																	tool.featured
																		? "text-blue-600 font-medium"
																		: "text-gray-700"
																}`}
																onClick={() => setShowToolsDropdown(false)}
															>
																{tool.icon && (
																	<span className="mr-2">{tool.icon}</span>
																)}
																{tool.name}
															</Link>
														))}
													</div>
												</div>
											))}
										</div>
									)}
								</>
							) : (
								<a
									href={item.href}
									className={`nav-link ${
										pathname === item.href ? "active" : ""
									}`}
								>
									{item.name}
								</a>
							)}
						</li>
					))}
				</ul>

				{/* Mobile Toggle */}
				<button
					className="md:hidden text-[#FFA726]"
					onClick={() => setShowMobile(!showMobile)}
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
			</nav>

			{/* Mobile Menu */}
			{showMobile && (
				<div className="md:hidden px-6 pb-4">
					<ul className="flex flex-col space-y-2">
						{navItems.map((item) => {
							if (item.isDropdown) {
								return (
									<li key={item.name}>
										<button
											className="w-full text-left nav-link flex items-center justify-between"
											onClick={() => setShowToolsDropdown(!showToolsDropdown)}
										>
											{item.name}
											<svg
												className={`w-4 h-4 ml-1 transform ${
													showToolsDropdown ? "rotate-180" : ""
												}`}
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</button>

										{showToolsDropdown && (
											<div className="pl-4 mt-2 space-y-4">
												{/* Featured Security Dashboard Link */}
												<div className="mb-2">
													<Link
														href="/security-dashboard"
														className="flex items-center py-2 font-semibold text-blue-600"
														onClick={() => setShowMobile(false)}
													>
														📊 Security Dashboard
														<span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
															Featured
														</span>
													</Link>
												</div>

												{/* Mobile Tools Dashboard Link */}
												<div className="mb-2">
													<Link
														href="/tools"
														className="flex items-center py-2 font-semibold text-primarySaffron"
														onClick={() => setShowMobile(false)}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															className="h-4 w-4 mr-2"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M4 6h16M4 12h16M4 18h7"
															/>
														</svg>
														All Tools
													</Link>
												</div>
												{toolsCategories.map((category, i) => (
													<div key={i}>
														<div className="font-semibold text-sm text-gray-600 mb-1">
															{category.category}
														</div>
														<div className="space-y-1">
															{category.tools.map((tool) => (
																<a
																	key={tool.href}
																	href={tool.href}
																	className={`block py-1 ${
																		tool.featured
																			? "text-blue-600 font-medium"
																			: "text-gray-700"
																	}`}
																>
																	• {tool.icon && `${tool.icon} `}
																	{tool.name}
																</a>
															))}
														</div>
													</div>
												))}
											</div>
										)}
									</li>
								);
							}
							return (
								<li key={item.name}>
									<a
										href={item.href}
										className={`nav-link ${
											pathname === item.href ? "active" : ""
										}`}
									>
										{item.name}
									</a>
								</li>
							);
						})}

						<input
							type="text"
							placeholder="Search..."
							className="mt-2 w-full px-3 py-1 border border-gray-300 rounded"
						/>
					</ul>
				</div>
			)}
		</>
	);
}
