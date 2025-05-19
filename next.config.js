/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	trailingSlash: true,
	assetPrefix: process.env.NODE_ENV === "production" ? undefined : undefined,
	basePath: "",
};

module.exports = nextConfig;
