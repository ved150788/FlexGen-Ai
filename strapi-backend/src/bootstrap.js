"use strict";

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

module.exports = async ({ strapi }) => {
	// Check if admin user exists
	const admins = await strapi.query("admin::user").findMany();

	if (admins.length === 0) {
		strapi.log.info(
			"No admin users found. Please create an admin user after startup."
		);
	} else {
		strapi.log.info(`Found ${admins.length} admin users.`);
	}

	// Log available content types
	const contentTypes = Object.keys(strapi.contentTypes)
		.filter((key) => key.startsWith("api::"))
		.map((key) => key.replace("api::", ""));

	if (contentTypes.length === 0) {
		strapi.log.info(
			"No content types found. Please create content types in the admin panel."
		);
	} else {
		strapi.log.info(`Available content types: ${contentTypes.join(", ")}`);
	}
};
