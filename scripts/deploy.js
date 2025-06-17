#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting deployment process...");

// Check for required environment variables
const requiredEnvVars = [
	"GOOGLE_CLIENT_ID",
	"GOOGLE_CLIENT_SECRET",
	"JWT_SECRET",
	"SESSION_SECRET",
];

console.log("✅ Checking environment variables...");
for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		console.error(`❌ Missing required environment variable: ${envVar}`);
		process.exit(1);
	}
}

// Set production environment variables
const productionEnv = {
	NODE_ENV: "production",
	PRODUCTION_FRONTEND_URL: "https://flexgenai.com",
	PRODUCTION_API_URL: "https://api.flexgenai.com",
	PRODUCTION_GOOGLE_CALLBACK_URL:
		"https://api.flexgenai.com/auth/google/callback",
	PRODUCTION_FACEBOOK_CALLBACK_URL:
		"https://api.flexgenai.com/auth/facebook/callback",
	...process.env,
};

console.log("🔧 Building Next.js application...");
try {
	execSync("npm run build", {
		stdio: "inherit",
		env: productionEnv,
	});
	console.log("✅ Build completed successfully");
} catch (error) {
	console.error("❌ Build failed:", error.message);
	process.exit(1);
}

console.log("📋 Deployment checklist:");
console.log("1. ✅ Environment variables configured");
console.log("2. ✅ Production build completed");
console.log("3. 🔄 Configure OAuth redirect URLs in Google/Facebook console:");
console.log("   - Google: https://api.flexgenai.com/auth/google/callback");
console.log("   - Facebook: https://api.flexgenai.com/auth/facebook/callback");
console.log("4. 🔄 Deploy to Vercel or your hosting platform");
console.log("5. 🔄 Set up domain DNS (flexgenai.com)");

console.log("\n🎉 Ready for deployment!");
