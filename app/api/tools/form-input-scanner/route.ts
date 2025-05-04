import { NextRequest, NextResponse } from "next/server";

interface Field {
	name: string;
	type: string;
	validation: string[];
}

interface Vulnerability {
	id: string;
	name: string;
	description: string;
	risk_level: "High" | "Medium" | "Low";
	field_name: string;
	field_type: string;
	payload_used: string;
	details: string;
	remediation: string;
	category: string;
}

interface Form {
	id: string;
	name: string;
	action: string;
	method: string;
	fields: Field[];
	vulnerabilities: Vulnerability[];
}

interface ScanResults {
	target_url: string;
	scan_time: string;
	scan_mode: "lightweight" | "heavy";
	forms_found: Form[];
	summary: {
		total_forms: number;
		total_fields: number;
		total_vulnerabilities: number;
		high_risks: number;
		medium_risks: number;
		low_risks: number;
		vulnerability_by_category?: Record<string, number>;
		categories?: string[];
		ai_summary?: string;
	};
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { target_url, mode } = body;

		if (!target_url) {
			return NextResponse.json(
				{ error: "Target URL is required" },
				{ status: 400 }
			);
		}

		// Log the request for debugging
		console.log(
			`Form Scanner request received for: ${target_url}, mode: ${mode}`
		);

		// In the future, this would connect to the actual scanning backend
		// For now, we're just returning mock data

		// Simulate processing delay
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Generate different results based on scan mode
		const isHeavyMode = mode === "heavy";

		// Mock forms with fields
		const forms: Form[] = [
			{
				id: "form-1",
				name: "Contact Form",
				action: "/contact",
				method: "post",
				fields: [
					{
						name: "name",
						type: "text",
						validation: ["required", "minlength=3"],
					},
					{
						name: "email",
						type: "email",
						validation: ["required", "email"],
					},
					{
						name: "message",
						type: "textarea",
						validation: ["required", "minlength=10"],
					},
					{
						name: "subject",
						type: "text",
						validation: [],
					},
				],
				vulnerabilities: [
					{
						id: "vuln-1",
						name: "XSS Vulnerability",
						description:
							"The message field is vulnerable to cross-site scripting attacks due to inadequate output sanitization.",
						risk_level: "High",
						field_name: "message",
						field_type: "textarea",
						payload_used: "<script>alert('XSS')</script>",
						details:
							"When user input containing JavaScript is submitted, it is rendered in the page without proper escaping, allowing attackers to execute arbitrary code in visitors' browsers.",
						remediation:
							"Implement output encoding when displaying user-submitted data. Use context-appropriate encoding functions and consider a Content Security Policy.",
						category: "XSS",
					},
				],
			},
			{
				id: "form-2",
				name: "Newsletter Signup",
				action: "/subscribe",
				method: "post",
				fields: [
					{
						name: "email",
						type: "email",
						validation: ["required", "email"],
					},
					{
						name: "name",
						type: "text",
						validation: ["required"],
					},
					{
						name: "preferences",
						type: "checkbox",
						validation: [],
					},
				],
				vulnerabilities: [],
			},
		];

		// Add more vulnerabilities for heavy mode
		if (isHeavyMode) {
			forms[0].vulnerabilities.push({
				id: "vuln-2",
				name: "SQL Injection",
				description:
					"The subject field is vulnerable to SQL injection attacks.",
				risk_level: "High",
				field_name: "subject",
				field_type: "text",
				payload_used: "' OR 1=1 --",
				details:
					"Input is directly concatenated into SQL queries without parameterization, allowing attackers to modify query logic and potentially access sensitive data.",
				remediation:
					"Use prepared statements or parameterized queries. Never build SQL queries by concatenating user input.",
				category: "SQL Injection",
			});

			forms[1].vulnerabilities.push({
				id: "vuln-3",
				name: "CSRF Vulnerability",
				description: "The form lacks anti-CSRF tokens.",
				risk_level: "Medium",
				field_name: "",
				field_type: "form",
				payload_used: "N/A",
				details:
					"The form does not implement Cross-Site Request Forgery protection, allowing attackers to submit forms on behalf of authenticated users.",
				remediation:
					"Implement anti-CSRF tokens that are validated on form submission. Use SameSite cookie attributes where appropriate.",
				category: "CSRF",
			});
		}

		// Add a third form with more findings in heavy mode
		if (isHeavyMode) {
			forms.push({
				id: "form-3",
				name: "Admin Search",
				action: "/admin/search",
				method: "get",
				fields: [
					{
						name: "query",
						type: "text",
						validation: [],
					},
					{
						name: "filter",
						type: "select",
						validation: [],
					},
				],
				vulnerabilities: [
					{
						id: "vuln-4",
						name: "Client-side Validation Bypass",
						description: "Form validation can be easily bypassed.",
						risk_level: "Low",
						field_name: "query",
						field_type: "text",
						payload_used: "JavaScript disabled",
						details:
							"Form only implements client-side validation which can be bypassed by disabling JavaScript or editing the DOM.",
						remediation:
							"Implement server-side validation in addition to client-side validation. Never rely solely on client-side checks.",
						category: "Input Validation",
					},
					{
						id: "vuln-5",
						name: "Command Injection",
						description: "The search query is vulnerable to command injection.",
						risk_level: "High",
						field_name: "query",
						field_type: "text",
						payload_used: "; cat /etc/passwd",
						details:
							"Search query input is passed to a system command without proper sanitization, allowing execution of arbitrary commands.",
						remediation:
							"Never pass user input directly to system commands. Use an API or library instead, or implement strict input validation and allowlisting.",
						category: "Command Injection",
					},
				],
			});
		}

		// Calculate totals for summary
		const totalForms = forms.length;
		let totalFields = 0;
		let totalVulnerabilities = 0;
		let highRisks = 0;
		let mediumRisks = 0;
		let lowRisks = 0;

		const vulnerabilityByCategory: Record<string, number> = {};
		const categories: string[] = [];

		forms.forEach((form) => {
			totalFields += form.fields.length;
			totalVulnerabilities += form.vulnerabilities.length;

			form.vulnerabilities.forEach((vuln) => {
				if (vuln.risk_level === "High") highRisks++;
				else if (vuln.risk_level === "Medium") mediumRisks++;
				else if (vuln.risk_level === "Low") lowRisks++;

				if (!categories.includes(vuln.category)) {
					categories.push(vuln.category);
				}

				vulnerabilityByCategory[vuln.category] =
					(vulnerabilityByCategory[vuln.category] || 0) + 1;
			});
		});

		// Generate AI Summary based on findings
		let aiSummary = "";
		if (totalVulnerabilities > 0) {
			aiSummary = `Analysis of ${totalForms} forms with ${totalFields} fields found ${totalVulnerabilities} potential security vulnerabilities. `;

			if (highRisks > 0) {
				aiSummary += `${highRisks} high-risk issues require immediate attention, particularly the ${
					highRisks > 1 ? "vulnerabilities" : "vulnerability"
				} related to ${categories
					.filter((cat) =>
						forms.some((form) =>
							form.vulnerabilities.some(
								(v) => v.risk_level === "High" && v.category === cat
							)
						)
					)
					.join(" and ")}. `;
			}

			if (mediumRisks > 0 || lowRisks > 0) {
				aiSummary += `${
					mediumRisks + lowRisks
				} lower severity issues were also detected. `;
			}

			if (isHeavyMode) {
				aiSummary +=
					"The deep scan revealed potential attack vectors that could be exploited to compromise user data or system integrity. Implementing the recommended remediations would significantly improve the security posture of these forms.";
			} else {
				aiSummary +=
					"The lightweight scan identified potential security weaknesses without submitting potentially harmful data. A more thorough heavy assessment is recommended to confirm these findings.";
			}
		} else {
			aiSummary = `No vulnerabilities were detected in the ${
				isHeavyMode ? "heavy" : "lightweight"
			} scan of ${totalForms} forms. This is a positive result, but it's always good practice to regularly test your forms for security issues as new vulnerabilities emerge.`;
		}

		const mockResults: ScanResults = {
			target_url,
			scan_time: new Date().toISOString(),
			scan_mode: mode === "heavy" ? "heavy" : "lightweight",
			forms_found: forms,
			summary: {
				total_forms: totalForms,
				total_fields: totalFields,
				total_vulnerabilities: totalVulnerabilities,
				high_risks: highRisks,
				medium_risks: mediumRisks,
				low_risks: lowRisks,
				vulnerability_by_category: vulnerabilityByCategory,
				categories: categories,
				ai_summary: aiSummary,
			},
		};

		return NextResponse.json(mockResults, { status: 200 });
	} catch (error) {
		console.error("Error in Form Input Scanner API:", error);
		return NextResponse.json(
			{
				error: "Failed to scan form vulnerabilities",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
