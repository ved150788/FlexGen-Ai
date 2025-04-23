"use client";

const categories = ["", "AI Security", "Zero Trust", "Testing"];
const tags = [
	"",
	"AI",
	"Threat Detection",
	"Architecture",
	"Best Practices",
	"Penetration Testing",
	"Ethical Hacking",
];

export default function BlogFilter({
	selectedCategory,
	selectedTag,
	searchTerm,
	onCategoryChange,
	onTagChange,
	onSearchChange,
}: {
	selectedCategory: string;
	selectedTag: string;
	searchTerm: string;
	onCategoryChange: (val: string) => void;
	onTagChange: (val: string) => void;
	onSearchChange: (val: string) => void;
}) {
	return (
		<div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
			<div className="flex items-center gap-3">
				<label className="text-sm font-medium">Category:</label>
				<select
					value={selectedCategory}
					onChange={(e) => onCategoryChange(e.target.value)}
					className="border px-3 py-2 rounded-md text-sm"
				>
					<option value="">All</option>
					{categories.map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
			</div>

			<div className="flex items-center gap-3">
				<label className="text-sm font-medium">Tag:</label>
				<select
					value={selectedTag}
					onChange={(e) => onTagChange(e.target.value)}
					className="border px-3 py-2 rounded-md text-sm"
				>
					<option value="">All</option>
					{tags.map((tag) => (
						<option key={tag} value={tag}>
							{tag}
						</option>
					))}
				</select>
			</div>

			<input
				type="text"
				placeholder="Search blog titles..."
				value={searchTerm}
				onChange={(e) => onSearchChange(e.target.value)}
				className="border px-4 py-2 rounded-md text-sm w-full md:w-60"
			/>
		</div>
	);
}
