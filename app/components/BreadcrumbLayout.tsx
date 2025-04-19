"use client";
import Breadcrumb, { BreadcrumbItem } from "./Breadcrumbs";

export default function BreadcrumbLayout({
	children,
	breadcrumbItems,
}: {
	children: React.ReactNode;
	breadcrumbItems: BreadcrumbItem[];
}) {
	return (
		<div className="px-4 py-12 md:px-16 max-w-7xl mx-auto text-gray-800">
			<Breadcrumb items={breadcrumbItems} />
			{children}
		</div>
	);
}
