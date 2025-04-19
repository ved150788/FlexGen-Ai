"use client";

import { useState } from "react";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function SecurityAuditModal({ isOpen, onClose }: Props) {
	const [showSuccess, setShowSuccess] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		company: "",
		employeeCount: "",
		industry: "",
		currentSecurity: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Clear error when user types
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		if (!formData.company.trim()) {
			newErrors.company = "Company name is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			// Here you would send the data to your server
			// For example:
			// const res = await fetch("/api/security-audit", {
			//   method: "POST",
			//   headers: { "Content-Type": "application/json" },
			//   body: JSON.stringify(formData),
			// });

			// if (!res.ok) {
			//   throw new Error("Failed to submit");
			// }

			// For demonstration purposes, we're simulating a successful API call
			console.log("Form submitted:", formData);

			// Simulate successful submission
			setShowSuccess(true);
			setFormData({
				name: "",
				email: "",
				company: "",
				employeeCount: "",
				industry: "",
				currentSecurity: "",
			});

			setTimeout(() => {
				setShowSuccess(false);
				onClose();
			}, 3000);
		} catch (error) {
			alert("Error submitting form: " + error);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Security Audit Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 overflow-y-auto py-10">
				<div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-lg mx-4">
					<button
						className="absolute top-3 right-3 text-black text-xl font-bold hover:text-red-500 transition"
						onClick={onClose}
						aria-label="Close modal"
					>
						&times;
					</button>

					<div className="mb-6 text-center">
						<div className="inline-block p-3 rounded-full bg-primarySaffron/10 mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-primarySaffron"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<h2 className="text-2xl font-bold mb-2">
							Get Your Free Security Audit
						</h2>
						<p className="text-gray-600">
							Our experts will analyze your cybersecurity posture and provide
							actionable recommendations.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Full Name*
								</label>
								<input
									id="name"
									name="name"
									type="text"
									required
									value={formData.name}
									onChange={handleChange}
									placeholder="John Doe"
									className={`w-full border ${
										errors.name ? "border-red-500" : "border-gray-300"
									} p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron`}
								/>
								{errors.name && (
									<p className="text-red-500 text-xs mt-1">{errors.name}</p>
								)}
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Email Address*
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={formData.email}
									onChange={handleChange}
									placeholder="john@company.com"
									className={`w-full border ${
										errors.email ? "border-red-500" : "border-gray-300"
									} p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron`}
								/>
								{errors.email && (
									<p className="text-red-500 text-xs mt-1">{errors.email}</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="company"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Company Name*
								</label>
								<input
									id="company"
									name="company"
									type="text"
									required
									value={formData.company}
									onChange={handleChange}
									placeholder="Your Company"
									className={`w-full border ${
										errors.company ? "border-red-500" : "border-gray-300"
									} p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron`}
								/>
								{errors.company && (
									<p className="text-red-500 text-xs mt-1">{errors.company}</p>
								)}
							</div>

							<div>
								<label
									htmlFor="employeeCount"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Number of Employees
								</label>
								<select
									id="employeeCount"
									name="employeeCount"
									value={formData.employeeCount}
									onChange={handleChange}
									className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron"
								>
									<option value="">Select...</option>
									<option value="1-10">1-10</option>
									<option value="11-50">11-50</option>
									<option value="51-200">51-200</option>
									<option value="201-500">201-500</option>
									<option value="501+">501+</option>
								</select>
							</div>
						</div>

						<div>
							<label
								htmlFor="industry"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Industry
							</label>
							<select
								id="industry"
								name="industry"
								value={formData.industry}
								onChange={handleChange}
								className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primarySaffron"
							>
								<option value="">Select...</option>
								<option value="Finance">Finance & Banking</option>
								<option value="Healthcare">Healthcare</option>
								<option value="Technology">Technology</option>
								<option value="Manufacturing">Manufacturing</option>
								<option value="Retail">Retail</option>
								<option value="Education">Education</option>
								<option value="Government">Government</option>
								<option value="Other">Other</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="currentSecurity"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Current Security Measures
							</label>
							<textarea
								id="currentSecurity"
								name="currentSecurity"
								rows={3}
								value={formData.currentSecurity}
								onChange={handleChange}
								placeholder="Briefly describe your current cybersecurity measures"
								className="w-full border border-gray-300 p-3 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primarySaffron"
							></textarea>
						</div>

						<div className="pt-2">
							<button
								type="submit"
								className="w-full bg-primarySaffron text-black py-3 rounded-md font-semibold hover:bg-black hover:text-white transition duration-300"
							>
								Request Free Security Audit
							</button>
							<p className="text-xs text-gray-500 mt-2 text-center">
								Your information is secured with SSL encryption and will never
								be shared with third parties.
							</p>
						</div>
					</form>
				</div>
			</div>

			{/* Success Modal */}
			{showSuccess && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
					<div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-sm animate-fadeIn">
						<div className="mx-auto w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8 text-green-600"
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
						</div>
						<h3 className="text-xl font-bold mb-2 text-gray-900">
							Security Audit Request Received!
						</h3>
						<p className="text-gray-700 mb-4">
							Thank you for your interest in our security audit. One of our
							security experts will contact you within 24 hours to schedule your
							audit.
						</p>
					</div>
				</div>
			)}
		</>
	);
}
