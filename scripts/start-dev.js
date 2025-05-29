const { spawn } = require("child_process");
const path = require("path");
const os = require("os");

// Determine the platform
const isWindows = os.platform() === "win32";

// Function to start the backend
function startBackend() {
	const backendPath = path.join(__dirname, "..", "backend");
	const pythonCmd = isWindows ? "python" : "python3";

	console.log("🐍 Starting Python backend...");

	const backend = spawn(pythonCmd, ["app.py"], {
		cwd: backendPath,
		stdio: "inherit",
		shell: isWindows,
	});

	backend.on("error", (err) => {
		console.error("❌ Failed to start backend:", err.message);
		console.log(
			"💡 Make sure Python is installed and requirements.txt dependencies are installed"
		);
		console.log("💡 Run: cd backend && pip install -r requirements.txt");
	});

	return backend;
}

// Function to start the frontend
function startFrontend() {
	console.log("⚛️  Starting Next.js frontend...");

	const frontend = spawn("npm", ["run", "dev:frontend"], {
		stdio: "inherit",
		shell: isWindows,
	});

	frontend.on("error", (err) => {
		console.error("❌ Failed to start frontend:", err.message);
	});

	return frontend;
}

// Start both processes
console.log("🚀 Starting FlexGen.ai Threat Intelligence Tool...");
console.log("📊 Backend will be available at: http://localhost:5000");
console.log("🌐 Frontend will be available at: http://localhost:3000");
console.log("");

const backend = startBackend();
const frontend = startFrontend();

// Handle process termination
process.on("SIGINT", () => {
	console.log("\n🛑 Shutting down...");
	backend.kill();
	frontend.kill();
	process.exit(0);
});

process.on("SIGTERM", () => {
	backend.kill();
	frontend.kill();
	process.exit(0);
});
