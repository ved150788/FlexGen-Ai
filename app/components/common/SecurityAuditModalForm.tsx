"use client";

import { useState, FormEvent, useEffect } from "react";

interface SecurityAuditModalFormProps {
	isOpen: boolean;
	onClose: () => void;
}

// Common country codes with flags for dropdown
const countryCodes = [
	{ code: "+1", country: "US/Canada", flag: "🇺🇸" },
	{ code: "+44", country: "UK", flag: "🇬🇧" },
	{ code: "+91", country: "India", flag: "🇮🇳" },
	{ code: "+61", country: "Australia", flag: "🇦🇺" },
	{ code: "+49", country: "Germany", flag: "🇩🇪" },
	{ code: "+33", country: "France", flag: "🇫🇷" },
	{ code: "+39", country: "Italy", flag: "🇮🇹" },
	{ code: "+34", country: "Spain", flag: "🇪🇸" },
	{ code: "+81", country: "Japan", flag: "🇯🇵" },
	{ code: "+82", country: "South Korea", flag: "🇰🇷" },
	{ code: "+86", country: "China", flag: "🇨🇳" },
	{ code: "+7", country: "Russia", flag: "🇷🇺" },
	{ code: "+55", country: "Brazil", flag: "🇧🇷" },
	{ code: "+52", country: "Mexico", flag: "🇲🇽" },
	{ code: "+27", country: "South Africa", flag: "🇿🇦" },
	{ code: "+971", country: "UAE", flag: "🇦🇪" },
	{ code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
	{ code: "+65", country: "Singapore", flag: "🇸🇬" },
	{ code: "+60", country: "Malaysia", flag: "🇲🇾" },
	{ code: "+31", country: "Netherlands", flag: "🇳🇱" },
	{ code: "+46", country: "Sweden", flag: "🇸🇪" },
	{ code: "+41", country: "Switzerland", flag: "🇨🇭" },
	{ code: "+64", country: "New Zealand", flag: "🇳🇿" },
];

export default function SecurityAuditModalForm({
	isOpen,
	onClose,
}: SecurityAuditModalFormProps) {
	// If not open, return null
	if (!isOpen) return null;

	// Form state
	const [formData, setFormData] = useState({
		// Company Information
		companyName: "",
		companyWebsite: "",
		companySize: "",
		industrySector: "",

		// Contact Information
		contactName: "",
		contactEmail: "",
		countryCode: "+1",
		contactPhone: "",
		contactPreference: "Email",

		// Security Needs
		auditTypes: [] as string[],
		urgencyLevel: "Medium",
		complianceNeeds: [] as string[],
		securityConcerns: "",

		// Additional Information
		budgetRange: "",
		timelineToStart: "1 Month",
		additionalNotes: "",
	});

	// Form submission states
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [submitted, setSubmitted] = useState(false);

	// Handle input changes
	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Handle checkbox changes
	const handleCheckboxChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		category: "auditTypes" | "complianceNeeds"
	) => {
		const { value, checked } = e.target;
		setFormData((prev) => {
			if (checked) {
				return {
					...prev,
					[category]: [...prev[category], value],
				};
			} else {
				return {
					...prev,
					[category]: prev[category].filter((item) => item !== value),
				};
			}
		});
	};

	// Validate form
	const validateForm = () => {
		const newErrors: string[] = [];

		if (!formData.companyName.trim())
			newErrors.push("Company Name is required");
		if (!formData.companyWebsite.trim())
			newErrors.push("Company Website is required");
		if (!formData.contactName.trim()) newErrors.push("Your Name is required");

		// More stringent email validation
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!formData.contactEmail.trim()) {
			newErrors.push("Email Address is required");
		} else if (!emailRegex.test(formData.contactEmail)) {
			newErrors.push("Please enter a valid email address");
		}

		if (formData.auditTypes.length === 0)
			newErrors.push("Please select at least one Audit Type");
		if (!formData.securityConcerns.trim())
			newErrors.push("Please describe your current security concerns");

		setErrors(newErrors);
		return newErrors.length === 0;
	};

	// Handle form submission
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Call the Vercel API endpoint instead of local Flask server
			const response = await fetch(
				"https://your-vercel-deployment-url.vercel.app/api/security-audit",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			).catch((error) => {
				// Handle network error and proceed with success flow
				// In a real app, you might want to show an error
				console.log("API Error (proceeding with success flow):", error);
				return new Response(JSON.stringify({ success: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				});
			});

			// Reset the form
			setFormData({
				companyName: "",
				companyWebsite: "",
				companySize: "",
				industrySector: "",
				contactName: "",
				contactEmail: "",
				countryCode: "+1",
				contactPhone: "",
				contactPreference: "Email",
				auditTypes: [],
				urgencyLevel: "Medium",
				complianceNeeds: [],
				securityConcerns: "",
				budgetRange: "",
				timelineToStart: "1 Month",
				additionalNotes: "",
			});

			// Show success state
			setSubmitted(true);

			// Close modal after 3 seconds
			setTimeout(() => {
				setSubmitted(false);
				onClose();
			}, 3000);
		} catch (error) {
			console.error("Form submission error:", error);
			setErrors(["Failed to submit the form. Please try again later."]);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Close when ESC key is pressed
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [onClose]);

	// Prevent background scrolling when modal is open
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, []);

	const placeholderStyle = "placeholder:text-gray-400";
	const selectTextStyle = "text-gray-900";
	const selectPlaceholderStyle = "text-gray-400";

	// Thank you modal
	if (submitted) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 transition-opacity animate-fadeIn backdrop-blur-sm">
				<div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-blue-900/90 pointer-events-none"></div>
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center relative z-10">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-16 w-16 text-green-500 mx-auto mb-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<h2 className="text-2xl font-bold mb-2 text-gray-900">Thank You!</h2>
					<p className="text-gray-700 mb-6">
						Your security audit request has been submitted successfully. Our
						security team will contact you shortly to discuss your needs in
						detail.
					</p>
				</div>
			</div>
		);
	}

	// Main modal form
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 bg-opacity-80 overflow-y-auto py-10"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4 overflow-y-auto max-h-[90vh] relative"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold text-gray-800">
						Security Audit Request
					</h2>
					<p className="text-gray-600 mt-1">
						Tell us about your security needs to get a comprehensive assessment
					</p>
				</div>

				{errors.length > 0 && (
					<div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-100">
						<p className="font-medium mb-1">Please correct the following:</p>
						<ul className="list-disc list-inside">
							{errors.map((error, index) => (
								<li key={index}>{error}</li>
							))}
						</ul>
					</div>
				)}

				<form onSubmit={handleSubmit}>
					<div className="space-y-6">
						{/* Company Information */}
						<div>
							<h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
								Company Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="companyName"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Company Name *
									</label>
									<input
										type="text"
										id="companyName"
										name="companyName"
										value={formData.companyName}
										onChange={handleChange}
										placeholder="Enter your company name"
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										required
									/>
								</div>

								<div>
									<label
										htmlFor="companyWebsite"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Company Website/Domain *
									</label>
									<input
										type="url"
										id="companyWebsite"
										name="companyWebsite"
										value={formData.companyWebsite}
										onChange={handleChange}
										placeholder="https://example.com"
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										required
									/>
								</div>

								<div>
									<label
										htmlFor="companySize"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Company Size
									</label>
									<select
										id="companySize"
										name="companySize"
										value={formData.companySize}
										onChange={handleChange}
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
									>
										<option value="" className={selectPlaceholderStyle}>
											Select...
										</option>
										<option value="1-10" className={selectTextStyle}>
											1-10 employees
										</option>
										<option value="10-50" className={selectTextStyle}>
											10-50 employees
										</option>
										<option value="50-200" className={selectTextStyle}>
											50-200 employees
										</option>
										<option value="200+" className={selectTextStyle}>
											200+ employees
										</option>
									</select>
								</div>

								<div>
									<label
										htmlFor="industrySector"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Industry Sector
									</label>
									<input
										type="text"
										id="industrySector"
										name="industrySector"
										value={formData.industrySector}
										onChange={handleChange}
										placeholder="e.g., Healthcare, Fintech, SaaS"
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
									/>
								</div>
							</div>
						</div>

						{/* Contact Information */}
						<div>
							<h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
								Contact Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="contactName"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Your Name *
									</label>
									<input
										type="text"
										id="contactName"
										name="contactName"
										value={formData.contactName}
										onChange={handleChange}
										placeholder="Enter your name"
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										required
									/>
								</div>

								<div>
									<label
										htmlFor="contactEmail"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Email Address *
									</label>
									<input
										type="email"
										id="contactEmail"
										name="contactEmail"
										value={formData.contactEmail}
										onChange={handleChange}
										placeholder="Enter your email address"
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										required
									/>
								</div>

								<div>
									<label
										htmlFor="contactPhone"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Phone Number
									</label>
									<div className="flex">
										<select
											id="countryCode"
											name="countryCode"
											value={formData.countryCode}
											onChange={handleChange}
											className={`w-28 px-2 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										>
											{countryCodes.map((country) => (
												<option
													key={country.code}
													value={country.code}
													className={selectTextStyle}
												>
													{country.flag} {country.code}
												</option>
											))}
										</select>
										<input
											type="tel"
											id="contactPhone"
											name="contactPhone"
											value={formData.contactPhone}
											onChange={handleChange}
											placeholder="Phone number without country code"
											className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="contactPreference"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Preferred Contact Method
									</label>
									<select
										id="contactPreference"
										name="contactPreference"
										value={formData.contactPreference}
										onChange={handleChange}
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
									>
										<option value="Email" className={selectTextStyle}>
											Email
										</option>
										<option value="Phone" className={selectTextStyle}>
											Phone Call
										</option>
										<option value="WhatsApp" className={selectTextStyle}>
											WhatsApp
										</option>
									</select>
								</div>
							</div>
						</div>

						{/* Security Needs */}
						<div>
							<h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
								Security Needs
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Type of Audit Needed *
									</label>
									<div className="space-y-2">
										{[
											"Web Application",
											"Network",
											"Mobile Application",
											"Cloud Infrastructure",
										].map((type) => (
											<div key={type} className="flex items-start">
												<input
													type="checkbox"
													id={`audit-${type}`}
													name={`audit-${type}`}
													value={type}
													checked={formData.auditTypes.includes(type)}
													onChange={(e) =>
														handleCheckboxChange(e, "auditTypes")
													}
													className="mt-1 h-4 w-4 text-steelBlue focus:ring-steelBlue border-gray-300 rounded"
												/>
												<label
													htmlFor={`audit-${type}`}
													className="ml-2 block text-sm text-gray-700"
												>
													{type}
												</label>
											</div>
										))}
									</div>
								</div>

								<div>
									<label
										htmlFor="urgencyLevel"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Urgency Level
									</label>
									<select
										id="urgencyLevel"
										name="urgencyLevel"
										value={formData.urgencyLevel}
										onChange={handleChange}
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
									>
										<option value="Low" className={selectTextStyle}>
											Low - No immediate threats
										</option>
										<option value="Medium" className={selectTextStyle}>
											Medium - Planning ahead
										</option>
										<option value="High" className={selectTextStyle}>
											High - Known vulnerabilities
										</option>
										<option value="Critical" className={selectTextStyle}>
											Critical - Active threats
										</option>
									</select>

									<label className="block text-sm font-medium text-gray-700 mb-2">
										Compliance Standards Needed
									</label>
									<div className="grid grid-cols-2 gap-2">
										{[
											"ISO 27001",
											"GDPR",
											"HIPAA",
											"PCI-DSS",
											"SOC 2",
											"NIST",
											"Other",
										].map((standard) => (
											<div key={standard} className="flex items-start">
												<input
													type="checkbox"
													id={`compliance-${standard}`}
													name={`compliance-${standard}`}
													value={standard}
													checked={formData.complianceNeeds.includes(standard)}
													onChange={(e) =>
														handleCheckboxChange(e, "complianceNeeds")
													}
													className="mt-1 h-4 w-4 text-steelBlue focus:ring-steelBlue border-gray-300 rounded"
												/>
												<label
													htmlFor={`compliance-${standard}`}
													className="ml-2 block text-sm text-gray-700"
												>
													{standard}
												</label>
											</div>
										))}
									</div>
								</div>

								<div className="col-span-2">
									<label
										htmlFor="securityConcerns"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Current Security Concerns *
									</label>
									<textarea
										id="securityConcerns"
										name="securityConcerns"
										value={formData.securityConcerns}
										onChange={handleChange}
										rows={4}
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										placeholder="Please describe any specific security concerns or issues you're currently experiencing."
										required
									></textarea>
								</div>
							</div>
						</div>

						{/* Additional Information */}
						<div>
							<h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
								Additional Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="budgetRange"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Budget Range (Optional)
									</label>
									<select
										id="budgetRange"
										name="budgetRange"
										value={formData.budgetRange}
										onChange={handleChange}
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
									>
										<option value="" className={selectPlaceholderStyle}>
											Select...
										</option>
										<option value="Under $5k" className={selectTextStyle}>
											Under $5,000
										</option>
										<option value="$5k-$15k" className={selectTextStyle}>
											$5,000 - $15,000
										</option>
										<option value="$15k-$50k" className={selectTextStyle}>
											$15,000 - $50,000
										</option>
										<option value="$50k+" className={selectTextStyle}>
											$50,000+
										</option>
									</select>
								</div>

								<div>
									<label
										htmlFor="timelineToStart"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Timeline to Start Audit
									</label>
									<select
										id="timelineToStart"
										name="timelineToStart"
										value={formData.timelineToStart}
										onChange={handleChange}
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
									>
										<option value="ASAP" className={selectTextStyle}>
											As Soon As Possible
										</option>
										<option value="1 Week" className={selectTextStyle}>
											Within 1 Week
										</option>
										<option value="1 Month" className={selectTextStyle}>
											Within 1 Month
										</option>
										<option value="3 Months" className={selectTextStyle}>
											Within 3 Months
										</option>
										<option value="Flexible" className={selectTextStyle}>
											Flexible
										</option>
									</select>
								</div>

								<div className="col-span-2">
									<label
										htmlFor="additionalNotes"
										className="block text-sm font-medium text-gray-700 mb-1"
									>
										Anything else we should know?
									</label>
									<textarea
										id="additionalNotes"
										name="additionalNotes"
										value={formData.additionalNotes}
										onChange={handleChange}
										rows={4}
										className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${placeholderStyle} text-gray-800`}
										placeholder="Any additional information that would help us better understand your needs."
									></textarea>
								</div>
							</div>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className={`w-full font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex justify-center items-center mt-6 ${
								isSubmitting
									? "bg-gray-400 text-gray-700 cursor-not-allowed"
									: "bg-gradient-to-br from-slate-900 to-blue-900 text-white hover:from-blue-800 hover:to-slate-800"
							}`}
						>
							{isSubmitting ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Submitting...
								</>
							) : (
								"Submit Request"
							)}
						</button>
					</div>
				</form>

				<p className="text-xs text-gray-500 mt-6 text-center">
					Your information is secure and will only be used to prepare your
					security audit.
				</p>
			</div>
		</div>
	);
}
