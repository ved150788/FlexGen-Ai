/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	trailingSlash: true,
	assetPrefix: process.env.NODE_ENV === "production" ? undefined : undefined,
	basePath: "",
	env: {
		FLASK_BACKEND_URL: "http://localhost:5000",
	},
};

module.exports = nextConfig;
