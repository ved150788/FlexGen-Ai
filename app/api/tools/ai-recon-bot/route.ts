import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { domain, mode = "light" } = body;

		// Validate the domain
		if (
			!domain ||
			typeof domain !== "string" ||
			!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain)
		) {
			return NextResponse.json(
				{ error: "Invalid domain format" },
				{ status: 400 }
			);
		}

		// Validate scan mode
		const validMode = mode === "light" || mode === "full" ? mode : "light";

		// Path to the Python script
		const scriptPath = path.join(
			process.cwd(),
			"tools",
			"ai_recon_bot",
			"main.py"
		);

		// Check if the Python script exists
		if (!fs.existsSync(scriptPath)) {
			console.error("Script not found at path:", scriptPath);
			return NextResponse.json(
				{ error: "Script not found at expected path" },
				{ status: 500 }
			);
		}

		// Get the request signal for cancellation
		const signal = request.signal;

		console.log(`Executing: python "${scriptPath}" "${domain}" "${validMode}"`);

		// Execute the Python script with timeout so it can be cancelled
		const childProcess = exec(
			`python "${scriptPath}" "${domain}" "${validMode}"`,
			{
				timeout: mode === "full" ? 600000 : 300000, // 10 minutes for full scan, 5 minutes for light scan
			}
		);

		// Setup cancellation handler
		let cancelled = false;
		signal.addEventListener("abort", () => {
			cancelled = true;
			if (childProcess.pid) {
				try {
					// On Windows, use taskkill to kill the process tree
					if (process.platform === "win32") {
						exec(`taskkill /pid ${childProcess.pid} /T /F`);
					} else {
						// On Unix systems, kill process group
						process.kill(-childProcess.pid, "SIGTERM");
					}
				} catch (e) {
					console.error("Failed to kill process:", e);
				}
			}
		});

		// Collect output
		let stdout = "";
		let stderr = "";

		childProcess.stdout?.on("data", (data) => {
			stdout += data;
			console.log(
				"STDOUT:",
				data.toString().slice(0, 200) +
					(data.toString().length > 200 ? "..." : "")
			);
		});

		childProcess.stderr?.on("data", (data) => {
			stderr += data;
			console.error("STDERR:", data.toString());
		});

		// Wait for process to complete
		const exitCode = await new Promise<number>((resolve) => {
			childProcess.on("close", (code) => {
				console.log(`Process exited with code ${code}`);
				resolve(code ?? 1);
			});
		});

		// Check if the request was cancelled
		if (cancelled) {
			return NextResponse.json(
				{ error: "Scan cancelled by user" },
				{ status: 499 } // Using 499 "Client Closed Request" status
			);
		}

		if (exitCode !== 0) {
			console.error("Script execution failed with exit code:", exitCode);
			console.error("Error output:", stderr);
			return NextResponse.json(
				{
					error: "Script execution failed with exit code: " + exitCode,
					stderr: stderr,
					stdout: stdout.slice(0, 1000), // Include part of stdout for debugging
				},
				{ status: 500 }
			);
		}

		if (stderr) {
			console.warn("Script produced error output:", stderr);
		}

		// Try to parse the output
		try {
			// Check if stdout contains valid JSON
			if (!stdout.trim()) {
				console.error("Empty output from script");
				return NextResponse.json(
					{
						error: "Empty output from script",
						domain: domain,
						scan_mode: validMode,
						scan_time: new Date().toISOString(),
					},
					{ status: 500 }
				);
			}

			// Log the first part of the output for debugging
			console.log(
				"Output preview:",
				stdout.slice(0, 200) + (stdout.length > 200 ? "..." : "")
			);

			// Try to find JSON in the output (in case there's debug text before/after)
			let jsonString = stdout.trim();
			try {
				// Find the first '{' and last '}' to extract JSON
				const startIdx = jsonString.indexOf("{");
				const endIdx = jsonString.lastIndexOf("}");

				if (startIdx >= 0 && endIdx > startIdx) {
					jsonString = jsonString.substring(startIdx, endIdx + 1);
				}

				const results = JSON.parse(jsonString);

				// Add timestamp and metadata to the results
				results.scan_time = new Date().toISOString();
				results.domain = domain;
				results.scan_mode = validMode;

				// Ensure summary section exists
				if (!results.summary) {
					results.summary = {
						text: "Scan completed but no findings were generated.",
						findings: [],
						high_risks: 0,
						medium_risks: 0,
						low_risks: 0,
						total_findings: 0,
					};
				}

				// Make sure findings array exists in summary
				if (!results.summary.findings) {
					results.summary.findings = [];
				}

				// Ensure all expected sections exist, even if they have errors
				const expectedSections = [
					"whois",
					"dns",
					"ssl",
					"http_headers",
					"open_ports",
					"cdn_waf",
					"ip_geolocation",
					"subdomains",
					"robots_sitemap",
					"directory_fingerprint",
					"rate_limit",
					"github_metadata",
				];

				expectedSections.forEach((section) => {
					if (!results[section]) {
						results[section] = { error: "No data available" };
					}
				});

				return NextResponse.json(results);
			} catch (parseError) {
				console.error("JSON parsing error:", parseError);
				console.error(
					"Failed to parse:",
					jsonString.slice(0, 500) + (jsonString.length > 500 ? "..." : "")
				);

				// Fall back to a simpler approach - try to match any JSON object in the output
				const jsonMatch = stdout.match(/(\{[\s\S]*\})/);
				if (jsonMatch && jsonMatch[0]) {
					try {
						const results = JSON.parse(jsonMatch[0]);
						results.scan_time = new Date().toISOString();
						results.domain = domain;
						results.scan_mode = validMode;

						// Ensure summary section exists
						if (!results.summary) {
							results.summary = {
								text: "Scan completed but no findings were generated.",
								findings: [],
								high_risks: 0,
								medium_risks: 0,
								low_risks: 0,
								total_findings: 0,
							};
						}

						// Make sure findings array exists in summary
						if (!results.summary.findings) {
							results.summary.findings = [];
						}

						// Ensure all expected sections exist, even if they have errors
						const expectedSections = [
							"whois",
							"dns",
							"ssl",
							"http_headers",
							"open_ports",
							"cdn_waf",
							"ip_geolocation",
							"subdomains",
							"robots_sitemap",
							"directory_fingerprint",
							"rate_limit",
							"github_metadata",
						];

						expectedSections.forEach((section) => {
							if (!results[section]) {
								results[section] = { error: "No data available" };
							}
						});

						return NextResponse.json(results);
					} catch (error) {
						console.error("Fallback parsing also failed:", error);
					}
				}

				// If all parsing attempts fail, return a simpler response
				return NextResponse.json(
					{
						error: "Failed to parse script output",
						scan_time: new Date().toISOString(),
						domain: domain,
						scan_mode: validMode,
						summary: {
							text: "Scan completed but results could not be parsed.",
							findings: [],
							high_risks: 0,
							medium_risks: 0,
							low_risks: 0,
							total_findings: 0,
						},
						stdout_preview: stdout.slice(0, 500), // Include part of the output for debugging
					},
					{ status: 500 }
				);
			}
		} catch (error) {
			console.error("Unexpected error parsing output:", error);
			return NextResponse.json(
				{
					error: "Unexpected error parsing script output",
					details: error instanceof Error ? error.message : String(error),
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Unexpected error:", error);

		// Check if this is an AbortError
		if (error instanceof DOMException && error.name === "AbortError") {
			return NextResponse.json({ error: "Request cancelled" }, { status: 499 });
		}

		return NextResponse.json(
			{
				error: "Unexpected error occurred",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
