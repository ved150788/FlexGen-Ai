# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>

# Strapi Backend for FlexGen.ai

This directory contains the Strapi backend for the FlexGen.ai website.

## Setup Instructions

1. Navigate to this directory:

   ```
   cd strapi-backend
   ```

2. Create a new Strapi project:

   ```
   npx create-strapi-app@latest . --quickstart
   ```

   Note: The `--quickstart` flag will set up your project with SQLite and automatically run it.

3. After installation, Strapi will automatically start and a browser window will open with the admin panel. Create your first administrator account to access the admin panel.

4. Once you're in the admin panel, you can start creating content types and API endpoints.

## Content Types for FlexGen.ai

Consider creating the following content types for your website:

- **Blog Posts**: For your blog section
- **Services**: To showcase your services
- **Tools**: To display your tools and their details
- **Team Members**: For the about page
- **Testimonials**: For customer reviews
- **FAQ**: Frequently asked questions

## Connecting to the Next.js Frontend

Add the following code to your Next.js project to fetch data from Strapi:

```typescript
// Example: Fetching blog posts from Strapi
async function fetchBlogPosts() {
	const response = await fetch("http://localhost:1337/api/blog-posts");
	const data = await response.json();
	return data;
}
```

## Environment Variables

Make sure to set up environment variables in your Next.js project:

```
// .env.local in your Next.js project
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

## Running in Development

```
npm run develop
```

## Building for Production

```
npm run build
npm run start
```

## Resources

- [Strapi Documentation](https://docs.strapi.io)
- [Next.js Integration](https://strapi.io/blog/build-a-blog-with-next-js-strapi-and-typescript)
