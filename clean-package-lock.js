const fs = require("fs");
const path = require("path");

try {
	const packageLockPath = path.join(__dirname, "package-lock.json");

	// Check if package-lock.json exists
	if (fs.existsSync(packageLockPath)) {
		// Read the file
		const packageLockContent = fs.readFileSync(packageLockPath, "utf8");

		// Parse the JSON
		const packageLock = JSON.parse(packageLockContent);

		// Write it back as clean UTF-8
		fs.writeFileSync(
			path.join(__dirname, "package-lock.json.clean"),
			JSON.stringify(packageLock, null, 2),
			"utf8"
		);

		console.log("Created clean package-lock.json.clean file");
	} else {
		console.log("package-lock.json not found");
	}
} catch (error) {
	console.error("Error:", error.message);
}
