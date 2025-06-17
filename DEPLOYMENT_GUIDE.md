# FlexGen.ai Deployment Guide to Google Cloud Platform

## 🚀 Overview

This guide will help you deploy your FlexGen.ai application to Google Cloud Platform (GCP) with Google OAuth authentication.

## 📋 Prerequisites

1. Google Cloud Platform account
2. Google Cloud CLI installed (`gcloud`)
3. Node.js application running locally
4. GitHub/GitLab repository (optional but recommended)

## 🔧 Step 1: Set up Google OAuth

### 1.1 Create Google Cloud Project

```bash
# Install Google Cloud CLI first if you haven't
# https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create flexgen-ai-project --name="FlexGen AI"

# Set the project as default
gcloud config set project flexgen-ai-project

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable iamcredentials.googleapis.com
```

### 1.2 Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **OAuth consent screen**
3. Choose **External** user type
4. Fill in the required fields:
   - **App name**: FlexGen AI
   - **User support email**: your-email@domain.com
   - **Developer contact information**: your-email@domain.com
5. Add your domain to **Authorized domains** (you'll get this after deployment)
6. Save and continue through the scopes and test users

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Set up the URIs:

   ```
   Authorized JavaScript origins:
   - http://localhost:3000 (for local development)
   - https://your-app-name-hash.run.app (you'll get this after deployment)

   Authorized redirect URIs:
   - http://localhost:3001/auth/google/callback (for local development)
   - https://your-backend-name-hash.run.app/auth/google/callback (you'll get this after deployment)
   ```

5. Save the **Client ID** and **Client Secret**

## 🌐 Step 2: Deploy to Google Cloud Run

### 2.1 Prepare Your Application

Create a `Dockerfile` for the backend:

```dockerfile
# Dockerfile (in the root directory)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the backend server
CMD ["node", "backend/server.js"]
```

### 2.2 Create .dockerignore

```
node_modules
.git
.env.local
.next
.vercel
__pycache__
*.pyc
.venv
```

### 2.3 Deploy Backend to Cloud Run

```bash
# Build and deploy the backend
gcloud run deploy flexgen-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "JWT_SECRET=your-production-jwt-secret" \
  --set-env-vars "SESSION_SECRET=your-production-session-secret" \
  --set-env-vars "GOOGLE_CLIENT_ID=your-google-client-id" \
  --set-env-vars "GOOGLE_CLIENT_SECRET=your-google-client-secret"

# Note the service URL - you'll need this for the frontend
```

### 2.4 Deploy Frontend to Cloud Run

Create a separate `Dockerfile` for the frontend:

```dockerfile
# frontend.Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

Deploy the frontend:

```bash
gcloud run deploy flexgen-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_API_URL=https://your-backend-url" \
  --dockerfile frontend.Dockerfile
```

## 🔒 Step 3: Configure Environment Variables

### 3.1 Update OAuth Redirect URIs

After deployment, go back to Google Cloud Console > APIs & Services > Credentials and update your OAuth 2.0 redirect URIs with your actual Cloud Run URLs.

### 3.2 Set Production Environment Variables

```bash
# Update backend with production URLs
gcloud run services update flexgen-backend \
  --region us-central1 \
  --set-env-vars "FRONTEND_URL=https://your-frontend-url" \
  --set-env-vars "PRODUCTION_GOOGLE_CALLBACK_URL=https://your-backend-url/auth/google/callback"
```

## 🗄️ Step 4: Database Setup

### Option A: Use Cloud SQL (Recommended for production)

```bash
# Create Cloud SQL instance
gcloud sql instances create flexgen-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create flexgen \
  --instance=flexgen-db

# Get connection details and update your app
```

### Option B: Keep SQLite (simpler, but limited)

For development/testing, you can continue using SQLite with Cloud Run's persistent disk.

## 🚀 Step 5: CI/CD with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Cloud CLI
        uses: google-github-actions/setup-gcloud@v0
        with:
          project_id: ${{ secrets.GCP_PROJECT }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          export_default_credentials: true

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy flexgen-backend \
            --source . \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
```

## 🔍 Step 6: Testing the Deployment

1. Visit your frontend URL
2. Click on "Sign in with Google"
3. Complete the OAuth flow
4. Verify the user is created in your database

## 📊 Step 7: Monitoring and Logging

```bash
# View logs
gcloud run services logs read flexgen-backend --region us-central1

# Set up monitoring
gcloud alpha monitoring dashboards create --config-from-file=monitoring.yaml
```

## 🛡️ Step 8: Security Best Practices

1. **Environment Variables**: Store secrets in Google Secret Manager
2. **Domain Verification**: Add your domain to Google Cloud Console
3. **HTTPS**: Cloud Run provides HTTPS by default
4. **CORS**: Update CORS settings in your backend
5. **Rate Limiting**: Implement rate limiting for APIs

## 🔧 Troubleshooting

### Common Issues:

1. **OAuth Error**: Check redirect URIs match exactly
2. **CORS Issues**: Update CORS configuration in backend
3. **Environment Variables**: Use `gcloud run services describe` to check env vars
4. **Database Connection**: Check Cloud SQL proxy settings

### Useful Commands:

```bash
# Check service status
gcloud run services list

# View service details
gcloud run services describe flexgen-backend --region us-central1

# Update environment variables
gcloud run services update flexgen-backend --set-env-vars "KEY=VALUE"

# View real-time logs
gcloud run services logs tail flexgen-backend --region us-central1
```

## 💰 Cost Optimization

1. Use Cloud Run's **pay-per-request** pricing
2. Set **CPU allocation** to "CPU is only allocated during request processing"
3. Configure **concurrency** settings
4. Use **Cloud SQL** with appropriate instance sizes
5. Set up **budget alerts** in Google Cloud Console

## 📞 Support

For deployment issues:

- Check [Google Cloud Run documentation](https://cloud.google.com/run/docs)
- Use [Google Cloud Support](https://cloud.google.com/support)
- Review the [Node.js on Google Cloud guide](https://cloud.google.com/nodejs)

---

**Note**: Replace all placeholder URLs and credentials with your actual values throughout this process.
