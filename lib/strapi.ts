/**
 * Utility functions to fetch data from Strapi API
 */

const STRAPI_URL =
	process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

/**
 * Fetch data from Strapi API with optional parameters
 */
export async function fetchFromStrapi(
	endpoint: string,
	params: Record<string, any> = {}
) {
	// Construct query string from params
	const queryString =
		Object.keys(params).length > 0
			? `?${new URLSearchParams(params).toString()}`
			: "";

	const url = `${STRAPI_URL}/api/${endpoint}${queryString}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Error fetching from Strapi: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching from Strapi:", error);
		return null;
	}
}

/**
 * Fetch blog posts with pagination
 */
export async function fetchBlogPosts(page = 1, pageSize = 10) {
	return fetchFromStrapi("blog-posts", {
		"pagination[page]": page,
		"pagination[pageSize]": pageSize,
		populate: "*",
		sort: "publishedAt:desc",
	});
}

/**
 * Fetch a single blog post by slug
 */
export async function fetchBlogPostBySlug(slug: string) {
	const response = await fetchFromStrapi("blog-posts", {
		"filters[slug][$eq]": slug,
		populate: "*",
	});

	if (response?.data?.length > 0) {
		return response.data[0];
	}

	return null;
}

/**
 * Fetch services
 */
export async function fetchServices() {
	return fetchFromStrapi("services", {
		populate: "*",
	});
}

/**
 * Fetch tools
 */
export async function fetchTools(category?: string) {
	const params: Record<string, any> = {
		populate: "*",
	};

	if (category && category !== "All Tools") {
		params["filters[category][$eq]"] = category;
	}

	return fetchFromStrapi("tools", params);
}

/**
 * Fetch a single tool by ID or slug
 */
export async function fetchToolById(id: string) {
	return fetchFromStrapi(`tools/${id}`, {
		populate: "*",
	});
}

/**
 * Fetch team members
 */
export async function fetchTeamMembers() {
	return fetchFromStrapi("team-members", {
		populate: "*",
	});
}

/**
 * Fetch testimonials
 */
export async function fetchTestimonials() {
	return fetchFromStrapi("testimonials", {
		populate: "*",
	});
}

/**
 * Fetch FAQs
 */
export async function fetchFAQs() {
	return fetchFromStrapi("faqs", {
		populate: "*",
	});
}
