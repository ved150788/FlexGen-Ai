const fs = require("fs");

// Read the existing package.json file
const packageJson = require("./package.json");

// Write it back as a clean UTF-8 file
fs.writeFileSync(
	"package.json.clean",
	JSON.stringify(packageJson, null, 2),
	"utf8"
);

console.log("Created clean package.json.clean file");
