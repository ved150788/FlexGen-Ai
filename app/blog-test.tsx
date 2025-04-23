"use client";

import { useEffect } from "react";
import Link from "next/link";
import { blogs } from "../data/blogs";

export default function BlogTest() {
	useEffect(() => {
		console.log("Blog test page loaded");
	}, []);

	return (
		<div className="p-10">
			<h1 className="text-2xl font-bold mb-4">Blog Navigation Test</h1>

			<div className="mb-6">
				<h2 className="text-xl font-semibold mb-2">Current blog slugs:</h2>
				<ul className="list-disc pl-6">
					{blogs.map((blog) => (
						<li key={blog.slug} className="mb-2">
							<strong>{blog.slug}</strong>
						</li>
					))}
				</ul>
			</div>

			<div className="mb-6">
				<h2 className="text-xl font-semibold mb-2">
					Test links (Next.js Link component):
				</h2>
				<ul className="list-disc pl-6">
					{blogs.map((blog) => (
						<li key={blog.slug} className="mb-2">
							<Link
								href={`/blog/${blog.slug}`}
								className="text-blue-500 hover:underline"
							>
								Link to {blog.title}
							</Link>
						</li>
					))}
				</ul>
			</div>

			<div className="mb-6">
				<h2 className="text-xl font-semibold mb-2">
					Test links (regular anchor tags):
				</h2>
				<ul className="list-disc pl-6">
					{blogs.map((blog) => (
						<li key={blog.slug} className="mb-2">
							<a
								href={`/blog/${blog.slug}`}
								className="text-green-500 hover:underline"
							>
								Link to {blog.title}
							</a>
						</li>
					))}
				</ul>
			</div>

			<div>
				<Link href="/blog" className="bg-blue-500 text-white px-4 py-2 rounded">
					Back to blog page
				</Link>
			</div>
		</div>
	);
}
