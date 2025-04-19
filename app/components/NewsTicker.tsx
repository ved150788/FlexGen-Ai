"use client";

import { useEffect, useState } from "react";

const rssSources: Record<string, string> = {
	SecurityWeek: "https://www.securityweek.com/feed/",
	"The Hacker News": "https://feeds.feedburner.com/TheHackersNews",
	BleepingComputer: "https://www.bleepingcomputer.com/feed/",
};

const refreshInterval = 10 * 60 * 1000;

interface NewsItem {
	title: string;
	link: string;
	pubDate: string;
	author?: string;
}

export default function NewsTicker() {
	const [items, setItems] = useState<NewsItem[]>([]);
	const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const fetchRSS = async () => {
			const sourceKey = Object.keys(rssSources)[currentSourceIndex];
			const rssURL = `https://api.rss2json.com/v1/api.json?rss_url=${rssSources[sourceKey]}`;

			try {
				const res = await fetch(rssURL);
				const data = await res.json();
				if (!data.items) throw new Error("No items");
				setItems(data.items.slice(0, 8));
			} catch (err) {
				console.error("RSS fetch error", err);
			}
		};

		fetchRSS();

		const interval = setInterval(() => {
			setCurrentSourceIndex(
				(prev) => (prev + 1) % Object.keys(rssSources).length
			);
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [currentSourceIndex, mounted]);

	if (!mounted) return null;

	return (
		<div className="news-ticker-container relative bg-white">
			<div className="ticker-label bg-black">SECURITY NEWS:</div>
			<div className="news-scroll-wrapper overflow-hidden w-full">
				<div className="news-ticker-track flex gap-10 whitespace-nowrap will-change-transform">
					{items.length === 0 ? (
						<div className="loading-message">
							Fetching latest cybersecurity news...
						</div>
					) : (
						[...items, ...items].map((item, i) => (
							<div className="news-item" key={i}>
								<span className="news-source">{item.author || "Source"}</span>
								<span className="news-headline">
									<a href={item.link} target="_blank" rel="noopener noreferrer">
										{item.title}
									</a>
								</span>
								<span className="timestamp">
									{new Date(item.pubDate).toLocaleTimeString("en-US", {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
