const fs = require("fs");
const path = require("path");

console.error("Starting setup check...");

// Function to check if file exists
function fileExists(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch (err) {
		return false;
	}
}

// Check essential files
const files = [
	"package.json",
	"vercel.json",
	"next.config.js",
	"app/page.tsx",
	"app/layout.tsx",
];

console.error("Checking essential files...");
let allFilesExist = true;

files.forEach((file) => {
	const exists = fileExists(file);
	console.error(`${file}: ${exists ? "Found" : "Missing"}`);
	if (!exists) allFilesExist = false;
});

if (allFilesExist) {
	console.error(
		"\nAll essential files exist. Your setup should work with Vercel."
	);
} else {
	console.error(
		"\nSome essential files are missing. Please fix before deploying."
	);
}

// Check package.json content
if (fileExists("package.json")) {
	try {
		const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
		console.error("\nChecking package.json configuration...");

		// Check if next.js is in dependencies
		if (packageJson.dependencies && packageJson.dependencies.next) {
			console.error(`next.js version: ${packageJson.dependencies.next}`);
		} else {
			console.error("next.js: Missing from dependencies");
		}

		// Check if build script exists
		if (packageJson.scripts && packageJson.scripts.build) {
			console.error(`build script: ${packageJson.scripts.build}`);
		} else {
			console.error("build script: Missing");
		}
	} catch (err) {
		console.error("Error reading package.json:", err.message);
	}
}
