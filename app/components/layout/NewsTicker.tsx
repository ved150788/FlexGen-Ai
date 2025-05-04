"use client";

import { useEffect, useState } from "react";

// Define comprehensive RSS sources based on provided list
const rssSources: Record<string, string> = {
	"CSO Online": "https://www.csoonline.com/feed/",
	"Cybercrime Wire": "https://cybersecurityventures.com/today/feed/",
	"Dark Reading": "https://www.darkreading.com/rss.xml",
	"Graham Cluley": "https://grahamcluley.com/feed/",
	"Infosecurity Magazine": "https://www.infosecurity-magazine.com/rss/news/",
	"Help Net Security": "https://www.helpnetsecurity.com/feed/",
	"Krebs On Security": "http://krebsonsecurity.com/feed/",
	"Security Magazine": "https://www.securitymagazine.com/rss",
	SecurityWeek: "https://feeds.feedburner.com/securityweek",
	"The Hacker News": "https://feeds.feedburner.com/TheHackersNews",
	// Keeping one reliable source from the previous implementation
	BleepingComputer: "https://www.bleepingcomputer.com/feed/",
};

// Enhanced fallback news items with more recent topics
const fallbackNewsItems = [
	{
		title: "Advanced Persistent Threats Target Critical Infrastructure Sectors",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "Threat Intel",
	},
	{
		title: "Zero Trust Architecture Implementation Guide for Enterprises",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "Security Guide",
	},
	{
		title: "New Data Privacy Regulations Impact Global Organizations",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "Compliance News",
	},
	{
		title: "Emerging Supply Chain Attacks: Detection and Prevention Strategies",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "Attack Vectors",
	},
	{
		title: "AI-Enhanced Security Operations Centers Reduce Dwell Time",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "Security Ops",
	},
	{
		title: "Cloud Security Posture Management: Best Practices for 2023",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "Cloud Security",
	},
	{
		title: "Multi-Factor Authentication Bypass Techniques Exposed",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "Identity Security",
	},
	{
		title: "Securing IoT Devices Against Emerging Threats",
		link: "#",
		pubDate: new Date().toISOString(),
		author: "IoT Security",
	},
];

// Refresh feeds every 5 minutes (reduced from 15 minutes to rotate sources more frequently)
const refreshInterval = 5 * 60 * 1000;

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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;

		const fetchRSS = async () => {
			setLoading(true);
			const sourceKeys = Object.keys(rssSources);
			const sourceKey = sourceKeys[currentSourceIndex];
			const rssURL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
				rssSources[sourceKey]
			)}`;

			try {
				const res = await fetch(rssURL);

				if (!res.ok) {
					throw new Error(
						`Failed to fetch RSS feed: ${res.status} ${res.statusText}`
					);
				}

				const data = await res.json();

				if (data.status !== "ok") {
					throw new Error(`RSS feed status not OK: ${data.status}`);
				}

				if (!data.items || data.items.length === 0) {
					console.warn(
						`No RSS items returned from ${sourceKey}, trying next source`
					);

					// Try the next source immediately
					setCurrentSourceIndex(
						(prev) => (prev + 1) % Object.keys(rssSources).length
					);
					return;
				}

				// Process the items to ensure consistent format
				const processedItems = data.items.slice(0, 8).map((item: any) => ({
					title: item.title,
					link: item.link,
					pubDate: item.pubDate,
					author: item.author || sourceKey,
				}));

				setItems(processedItems);
				setError(false);
			} catch (err) {
				console.error(`RSS fetch error for ${sourceKey}:`, err);

				// If we've tried all sources and failed, use fallback data
				const nextIndex = (currentSourceIndex + 1) % sourceKeys.length;

				if (nextIndex === 0) {
					setItems(fallbackNewsItems);
					setError(true);
				} else {
					// Try the next source
					setCurrentSourceIndex(nextIndex);
					return;
				}
			} finally {
				setLoading(false);
			}
		};

		fetchRSS();

		// Set up two intervals:
		// 1. One for fetching new content from the current source every minute
		const fetchInterval = setInterval(fetchRSS, 60 * 1000);

		// 2. One for rotating to a different source
		const rotateInterval = setInterval(() => {
			setCurrentSourceIndex(
				(prev) => (prev + 1) % Object.keys(rssSources).length
			);
		}, refreshInterval);

		return () => {
			clearInterval(fetchInterval);
			clearInterval(rotateInterval);
		};
	}, [currentSourceIndex, mounted]);

	// Don't render anything during SSR
	if (!mounted) return null;

	return (
		<div className="news-ticker-container relative bg-white">
			<div className="ticker-label bg-gray-800 text-white px-4 font-bold h-full flex items-center text-sm min-w-[140px] z-20">
				SECURITY NEWS:
			</div>

			<div className="news-scroll-wrapper overflow-hidden w-full">
				<div className="news-ticker-track flex gap-10 whitespace-nowrap will-change-transform">
					{loading ? (
						<div className="loading-message px-4">
							Fetching latest cybersecurity news...
						</div>
					) : items.length === 0 ? (
						<div className="loading-message px-4">
							No news items available at the moment.
						</div>
					) : (
						[...items, ...items].map((item, i) => (
							<div
								className="news-item"
								key={`${i}-${item.title.substring(0, 20)}`}
							>
								<span className="news-source font-medium text-blue-600">
									{item.author || "Security News"}
								</span>
								<span className="news-headline mx-2">
									<a
										href={item.link}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:underline"
									>
										{item.title}
									</a>
								</span>
								<span className="timestamp text-gray-500">
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

			{error && (
				<div className="absolute bottom-0 right-0 bg-gray-800 text-xs text-white px-2 py-1 rounded-tl-md opacity-70">
					Using cached news
				</div>
			)}
		</div>
	);
}
