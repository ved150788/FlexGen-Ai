// Configuration for Threat Intelligence Platform

// Enable mock data generation for development and testing
export const config = {
	// Mock data settings
	useMockData: false, // Master switch for all mock data - MUST BE FALSE FOR REAL DATA
	useMockApiData: false, // For API module - MUST BE FALSE FOR REAL DATA
	useMockTaxiiData: false, // For TAXII module - MUST BE FALSE FOR REAL DATA

	// Number of mock indicators to generate per source
	mockIndicatorsPerSource: 3,

	// Development flags
	enableDetailedLogging: true,
	showProgressMessages: true, // Show detailed progress in console

	// Refresh settings
	autoRefreshInterval: 60000, // Auto refresh interval in ms (60 seconds)

	// Timeframes
	defaultLookbackDays: 30, // Default period to look back for threats
};

// Force console logging to be visible
if (typeof window !== "undefined") {
	const originalConsoleLog = console.log;
	console.log = function (...args) {
		originalConsoleLog.apply(console, args);
		// Make sure messages are visible in the browser console
		if (args[0] && typeof args[0] === "string" && args[0].includes("[")) {
			// This is one of our progress messages
			document.dispatchEvent(
				new CustomEvent("threatIntelLog", {
					detail: { message: args.join(" "), timestamp: new Date() },
				})
			);
		}
	};
}

export default config;
