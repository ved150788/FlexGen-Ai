// components/ContactInfo.tsx
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function ContactInfo() {
	return (
		<section className="py-16 px-6 bg-gray-900 text-white">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-3xl font-bold text-center mb-12">Get In Touch</h2>

				<div className="grid md:grid-cols-3 gap-8 text-center">
					<div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors duration-300">
						<div className="flex justify-center mb-4">
							<div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center">
								<FaPhone className="text-blue-400 text-2xl" />
							</div>
						</div>
						<h3 className="text-xl font-semibold mb-2">Phone</h3>
						<p className="text-gray-300">+91 98765 43210</p>
					</div>

					<div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors duration-300">
						<div className="flex justify-center mb-4">
							<div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center">
								<FaEnvelope className="text-blue-400 text-2xl" />
							</div>
						</div>
						<h3 className="text-xl font-semibold mb-2">Email</h3>
						<p className="text-gray-300">contact@flexgen.ai</p>
					</div>

					<div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors duration-300">
						<div className="flex justify-center mb-4">
							<div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center">
								<FaMapMarkerAlt className="text-blue-400 text-2xl" />
							</div>
						</div>
						<h3 className="text-xl font-semibold mb-2">Address</h3>
						<p className="text-gray-300">
							Bangalore | Varanasi | Global Remote Team
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
