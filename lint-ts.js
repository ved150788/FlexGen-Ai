// Simple script to run TypeScript compiler in check mode
const { execSync } = require("child_process");

try {
	console.log("Running TypeScript compiler in type-check mode...");
	const result = execSync("npx tsc --noEmit", { encoding: "utf8" });
	console.log("TypeScript check completed successfully!");
} catch (error) {
	console.error("TypeScript check failed with the following errors:");
	console.error(error.stdout);
	process.exit(1);
}
