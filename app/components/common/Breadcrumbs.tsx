"use client";
import Link from "next/link";

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
	if (!items?.length) return null;

	return (
		<nav className="text-sm mb-6 text-gray-600" aria-label="Breadcrumb">
			<ol className="flex flex-wrap items-center gap-1">
				{items.map((item, index) => (
					<li key={index} className="flex items-center">
						{item.href ? (
							<Link href={item.href} className="hover:text-black font-medium">
								{item.label}
							</Link>
						) : (
							<span className="text-primarySaffron font-semibold">
								{item.label}
							</span>
						)}
						{index < items.length - 1 && <span className="mx-2">/</span>}
					</li>
				))}
			</ol>
		</nav>
	);
}
