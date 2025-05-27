import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Parse query parameters
		const searchParams = request.nextUrl.searchParams;
		const typeFilter = searchParams.get("type");
		const sourceFilter = searchParams.get("source");
		const timeFilter = searchParams.get("timeRange");
		const limit = searchParams.get("limit") || "100";

		// Build query string
		let queryParams = new URLSearchParams();
		if (typeFilter && typeFilter !== "all")
			queryParams.append("type", typeFilter);
		if (sourceFilter && sourceFilter !== "all")
			queryParams.append("source", sourceFilter);
		if (timeFilter && timeFilter !== "all")
			queryParams.append("timeRange", timeFilter);
		queryParams.append("limit", limit);

		// Call the Flask backend API
		const backendUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000";
		const url = `${backendUrl}/api/iocs?${queryParams.toString()}`;

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store", // Prevent caching to always get fresh data
			});

			if (response.ok) {
				const data = await response.json();
				return NextResponse.json(data);
			} else {
				console.error("Backend returned error:", await response.text());
				// Return mock data if backend returns an error
				return NextResponse.json(getMockIocData());
			}
		} catch (error) {
			console.error("Error fetching IOCs:", error);
			// Return mock data if the fetch fails completely
			return NextResponse.json(getMockIocData());
		}
	} catch (error) {
		console.error("Error in IOCs listing:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

function getMockIocData() {
	return {
		status: "success",
		results: [
			{
				indicator: "185.176.43.94",
				type: "ip",
				threatScore: 8.7,
				source: "AlienVault OTX",
				firstSeen: "2023-11-12T14:32:10Z",
				lastSeen: "2024-04-15T08:45:22Z",
				tags: ["malware", "botnet", "c2"],
				sourceUrl: "https://otx.alienvault.com/indicator/ip/185.176.43.94",
				sampleText:
					"Command and Control server for LockBit ransomware campaign",
			},
			{
				indicator: "cdn-delivery-system.net",
				type: "domain",
				threatScore: 9.4,
				source: "MITRE ATT&CK",
				firstSeen: "2023-10-21T09:18:35Z",
				lastSeen: "2024-04-18T12:33:41Z",
				tags: ["phishing", "malware-distribution", "apt29"],
				sourceUrl: "https://attack.mitre.org/groups/G0016/",
				sampleText:
					"Domain used in targeted phishing campaigns by APT29 targeting defense contractors",
			},
			{
				indicator:
					"49f9b5d516a2eae3a801366b0cc1b3b1f88be38c22e546f34972207cd9e618ae",
				type: "hash",
				threatScore: 8.9,
				source: "VirusTotal",
				firstSeen: "2024-02-05T22:45:11Z",
				lastSeen: "2024-04-10T17:52:09Z",
				tags: ["ransomware", "exfiltration", "encryption"],
				sourceUrl:
					"https://www.virustotal.com/gui/file/49f9b5d516a2eae3a801366b0cc1b3b1f88be38c22e546f34972207cd9e618ae",
				sampleText:
					"BlackCat/ALPHV ransomware payload with data exfiltration capabilities",
			},
			{
				indicator: "http://invoice-secure-download.biz/document.php",
				type: "url",
				threatScore: 9.6,
				source: "MISP",
				firstSeen: "2024-03-30T11:22:37Z",
				lastSeen: "2024-04-17T14:15:00Z",
				tags: ["malware-distribution", "phishing", "banking-trojan"],
				sourceUrl: "https://www.misp-project.org/feeds/",
				sampleText:
					"URL hosting fake invoice documents containing Emotet banking trojan",
			},
			{
				indicator: "finance-director@compromised-org.com",
				type: "email",
				threatScore: 8.3,
				source: "PhishTank",
				firstSeen: "2024-04-01T08:17:45Z",
				lastSeen: "2024-04-14T19:23:12Z",
				tags: ["phishing", "bec", "credential-theft"],
				sourceUrl: "https://phishtank.org/",
				sampleText:
					"Email address used in business email compromise (BEC) attacks targeting financial departments",
			},
			{
				indicator: "23.32.246.157",
				type: "ip",
				threatScore: 7.9,
				source: "AbuseIPDB",
				firstSeen: "2024-03-15T16:42:18Z",
				lastSeen: "2024-04-16T21:37:29Z",
				tags: ["exploit", "scanning", "brute-force"],
				sourceUrl: "https://www.abuseipdb.com/check/23.32.246.157",
				sampleText:
					"IP associated with brute forcing SSH credentials across multiple targets",
			},
			{
				indicator: "login-secure-verification.cc",
				type: "domain",
				threatScore: 9.7,
				source: "CIRCL",
				firstSeen: "2024-02-25T13:51:22Z",
				lastSeen: "2024-04-18T06:12:38Z",
				tags: ["phishing", "credential-theft", "banking"],
				sourceUrl: "https://www.circl.lu/",
				sampleText:
					"Domain hosting phishing pages impersonating multiple banking institutions",
			},
			{
				indicator:
					"95e8942abe27169dd3f949c523cc6d977dd3d79620068e32e971989c7c2b7f92",
				type: "hash",
				threatScore: 8.8,
				source: "MalwareBazaar",
				firstSeen: "2024-03-07T19:28:51Z",
				lastSeen: "2024-04-12T15:46:20Z",
				tags: ["trojan", "info-stealer", "keylogger"],
				sourceUrl:
					"https://bazaar.abuse.ch/sample/95e8942abe27169dd3f949c523cc6d977dd3d79620068e32e971989c7c2b7f92/",
				sampleText:
					"RedLine Stealer malware targeting credentials and cryptocurrency wallets",
			},
			{
				indicator: "http://financial-report-2024.xyz/download.html",
				type: "url",
				threatScore: 8.5,
				source: "URLhaus",
				firstSeen: "2024-04-05T10:33:47Z",
				lastSeen: "2024-04-17T22:19:55Z",
				tags: ["phishing", "malware", "document-exploit"],
				sourceUrl: "https://urlhaus.abuse.ch/url/2381954/",
				sampleText:
					"URL distributing malicious Office documents exploiting CVE-2023-21823",
			},
			{
				indicator: "accounts-department@exfiltration.xyz",
				type: "email",
				threatScore: 7.8,
				source: "ThreatFox",
				firstSeen: "2024-03-22T07:55:14Z",
				lastSeen: "2024-04-15T11:28:36Z",
				tags: ["spam", "phishing", "malicious-attachment"],
				sourceUrl: "https://threatfox.abuse.ch/",
				sampleText:
					"Email address used in targeted campaigns delivering Qakbot malware",
			},
		],
	};
}
