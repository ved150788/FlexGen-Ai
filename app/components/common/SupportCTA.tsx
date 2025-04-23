// components/SupportCTA.tsx
import Link from "next/link";

export default function SupportCTA() {
	return (
		<section className="py-10 bg-gradient-to-r from-black via-gray-900 to-black text-white text-center">
			<p className="text-gray-400 mb-2">Need technical help or service info?</p>
			<Link
				href="/support"
				className="text-primarySaffron font-medium underline hover:text-white transition"
			>
				Visit our Support Center
			</Link>
		</section>
	);
}
