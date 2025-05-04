# FlexGen Email Backend

A serverless backend for handling email functionality for the FlexGen.ai website contact forms and security audit requests.

## Features

- Contact form email handling
- Security audit request processing
- CORS support
- HTML and plain text email formatting

## Deployment on Vercel

This backend is designed to be deployed as a serverless function on Vercel.

### Prerequisites

- A Vercel account
- SMTP email account credentials (Gmail recommended)

### Deployment Steps

1. Fork or clone this repository
2. Connect the repository to your Vercel account
3. Add the following environment variables in your Vercel project settings:
   - `MAIL_USERNAME`: Your email address
   - `MAIL_PASSWORD`: Your email app password
   - `MAIL_RECEIVER`: Recipient email address

For Gmail, you'll need to use an App Password. [Learn how to create one](https://support.google.com/accounts/answer/185833?hl=en).

### Update Frontend API Endpoints

After deployment, update your frontend forms to use the Vercel deployment URL:

```typescript
// In your form submit handlers
const response = await fetch(
	"https://your-vercel-deployment-url.vercel.app/api/contact",
	{
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			name: "User Name",
			email: "user@example.com",
			message: "Form message",
			// Other form fields
		}),
	}
);
```

## API Endpoints

- `GET /api`: Check if the server is running
- `POST /api/contact`: Handle contact form submissions
- `POST /api/security-audit`: Process security audit requests

## Local Development

For local development:

1. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your email credentials

4. Run the Vercel dev server:

```bash
vercel dev
```
