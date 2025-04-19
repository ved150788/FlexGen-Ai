/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./node_modules/swiper/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				primarySaffron: "#F4A261",
				primaryBlue: "#264653",
			},
		},
	},
	plugins: [],
};
