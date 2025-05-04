# Environment Variables Setup

To properly configure your Strapi backend and connect it to your Next.js frontend, you need to set up the following environment variables.

## Strapi Backend (.env)

Create a `.env` file in the root of your Strapi backend project (strapi-backend directory) with the following content:

```
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=toBeModified
ADMIN_JWT_SECRET=toBeModified
TRANSFER_TOKEN_SALT=toBeModified
JWT_SECRET=toBeModified
```

For security in production, you should change all the "toBeModified" values to secure random strings. You can use the following commands in your terminal to generate secure values:

```bash
# For APP_KEYS (comma-separated list of keys)
openssl rand -base64 32,openssl rand -base64 32

# For other values
openssl rand -base64 32
```

## Next.js Frontend (.env.local)

Create a `.env.local` file in the root of your Next.js project with the following content:

```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

For production, you'll want to update this to your production Strapi URL.

## API Token for Secured Routes

If you want to use Strapi's API Token system to secure content access:

1. Log in to your Strapi admin panel
2. Go to Settings > API Tokens
3. Create a new API token with the appropriate permissions
4. Add it to your Next.js `.env.local` file:

```
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your-token-here
```

Then update your fetch functions to include the token:

```typescript
const response = await fetch(`${STRAPI_URL}/api/${endpoint}${queryString}`, {
	headers: {
		Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
	},
});
```

## Starting Both Services

Remember to start both services for development:

1. Start Strapi:

   ```
   cd strapi-backend
   npm run develop
   ```

2. Start Next.js in a separate terminal:
   ```
   npm run dev
   ```
