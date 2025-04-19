"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
	{ name: "Home", href: "/" },
	{ name: "Services", href: "/services" },
	{ name: "About", href: "/about" },
	{ name: "Blogs", href: "/blog" },
	{ name: "Contact Us", href: "/contact" },
];

export default function Navbar() {
	const pathname = usePathname();
	const [showMobile, setShowMobile] = useState(false);

	return (
		<>
			<nav className="w-full px-6 py-4 flex items-center justify-between bg-white border-b-2 border-black">
				<div className="flex-1">
					<a href="/" className="font-bold text-xl">
						<img
							src="/Images/flexgenlogo.png"
							alt="Flexgen Logo"
							className="h-12 w-auto" // change height here
						/>
					</a>
				</div>

				{/* Center Search */}
				<div className="hidden md:flex flex-1 justify-center border border-gray-300 rounded p-2">
					<input
						type="text"
						placeholder="Search..."
						className="px-3 py-1 rounded bg-white text-black focus:outline-none w-full max-w-xs"
					/>
				</div>

				{/* Desktop Nav */}
				<ul className="hidden md:flex flex-1 justify-end space-x-6 items-center">
					{navItems.map((item) => (
						<li key={item.href}>
							<a
								href={item.href}
								className={`nav-link ${pathname === item.href ? "active" : ""}`}
							>
								{item.name}
							</a>
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
						{navItems.map((item) => (
							<li key={item.href}>
								<a
									href={item.href}
									className={`nav-link ${
										pathname === item.href ? "active" : ""
									}`}
								>
									{item.name}
								</a>
							</li>
						))}
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
