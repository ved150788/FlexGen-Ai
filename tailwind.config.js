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
				primaryBlue: "#1E40AF",
				primaryDarkBlue: "#172554",
				primaryLightBlue: "#3B82F6",
				steelBlue: "#4682B4",
				steelDark: "#2C5282",
				steelLight: "#63B3ED",
				secondaryBlack: "#0F172A",
				primarySaffron: "#F4A261",
				saffronDark: "#DD6B20",
			},
			backgroundImage: {
				"steel-gradient":
					"linear-gradient(to right, var(--steel-dark), var(--steel-blue), var(--steel-light))",
				"saffron-gradient":
					"linear-gradient(to right, var(--primary-saffron), var(--saffron-dark), var(--secondary-black))",
			},
		},
	},
	plugins: [],
};
