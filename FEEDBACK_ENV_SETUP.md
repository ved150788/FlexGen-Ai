# Feedback System Environment Setup Guide

This guide will help you configure the environment variables needed for the feedback system to work properly.

## 📋 Required Environment Variables

### 1. Create `.env.local` File

Create a `.env.local` file in your project root (same directory as `package.json`) and add the following variables:

```bash
# ===========================================
# FEEDBACK SYSTEM CONFIGURATION
# ===========================================

# Feedback Backend API URL
NEXT_PUBLIC_FEEDBACK_API_URL=http://localhost:3001

# Feedback Database Configuration
FEEDBACK_DB_URL=postgresql://username:password@localhost:5432/flexgen_feedback
# Alternative for SQLite: FEEDBACK_DB_URL=file:./feedback.db

# File Upload Configuration
FEEDBACK_MAX_FILE_SIZE=5242880
FEEDBACK_UPLOAD_DIR=./uploads/feedback
FEEDBACK_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,text/plain,application/pdf

# ===========================================
# MAIN APPLICATION CONFIGURATION
# ===========================================

# Main API URL (if different from feedback API)
NEXT_PUBLIC_API_URL=http://localhost:3001

# JWT Secret for Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# Session Secret
SESSION_SECRET=your-session-secret-key-change-in-production

# ===========================================
# EMAIL CONFIGURATION (Optional)
# ===========================================

# SMTP Configuration for Feedback Notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@flexgen.ai
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================

NODE_ENV=development
DEBUG=true
```

## 🛠️ Setup Instructions

### Step 1: Backend Configuration

1. **Start the Feedback Backend**:

   ```bash
   cd app/feedback/backend
   npm install
   npm run dev
   ```

   This should start the feedback backend on port 3001.

2. **Verify Backend is Running**:
   Visit `http://localhost:3001/api/health` to check if the backend is responding.

### Step 2: Database Setup

Choose one of the following database options:

#### Option A: PostgreSQL (Recommended for Production)

```bash
# Install PostgreSQL and create a database
createdb flexgen_feedback

# Update your .env.local
FEEDBACK_DB_URL=postgresql://username:password@localhost:5432/flexgen_feedback
```

#### Option B: SQLite (Good for Development)

```bash
# SQLite will create the file automatically
FEEDBACK_DB_URL=file:./feedback.db
```

### Step 3: Run Database Migrations

```bash
cd app/feedback/backend
npx prisma migrate dev
npx prisma generate
```

### Step 4: Test the Configuration

1. **Start your Next.js application**:

   ```bash
   npm run dev
   ```

2. **Test feedback submission**:
   - Visit any tool page (e.g., `/tools/threat-intelligence`)
   - Click the floating feedback button
   - Submit a test feedback
   - Check if it appears in the feedback pages

## 🔧 Configuration Options

### Feedback API URL Configuration

The feedback system uses the following environment variable to connect to the backend:

```bash
NEXT_PUBLIC_FEEDBACK_API_URL=http://localhost:3001
```

**For different environments:**

- **Development**: `http://localhost:3001`
- **Staging**: `https://api-staging.flexgen.ai`
- **Production**: `https://api.flexgen.ai`

### File Upload Configuration

```bash
# Maximum file size (5MB = 5242880 bytes)
FEEDBACK_MAX_FILE_SIZE=5242880

# Upload directory (relative to backend)
FEEDBACK_UPLOAD_DIR=./uploads/feedback

# Allowed file types
FEEDBACK_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,text/plain,application/pdf
```

### Rate Limiting (Optional)

```bash
# Rate limiting for feedback submissions
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## 🧪 Testing Your Setup

### 1. Test Backend Connection

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. Test Feedback Submission

```bash
# Test feedback API
curl -X POST http://localhost:3001/api/feedback \
  -F "module=Test Module" \
  -F "comments=This is a test feedback" \
  -F "rating=5" \
  -F "userId=test-user" \
  -F "username=testuser"
```

### 3. Test Frontend Integration

1. Visit `http://localhost:3000/tools/threat-intelligence`
2. Click the floating feedback button (bottom-right)
3. Fill out and submit the feedback form
4. Visit `http://localhost:3000/my-feedback` to see the submitted feedback

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "Network error. Please try again."

- **Cause**: Frontend can't connect to backend
- **Solution**: Check if `NEXT_PUBLIC_FEEDBACK_API_URL` is correct and backend is running

#### 2. "Failed to submit feedback"

- **Cause**: Backend API error
- **Solution**: Check backend logs and database connection

#### 3. "Feedback not appearing in dashboard"

- **Cause**: Database connection or migration issues
- **Solution**: Run `npx prisma migrate dev` and check database URL

#### 4. File upload errors

- **Cause**: File size or type restrictions
- **Solution**: Check `FEEDBACK_MAX_FILE_SIZE` and `FEEDBACK_ALLOWED_FILE_TYPES`

### Environment Variable Debugging

Add this to your code to debug environment variables:

```javascript
console.log("Feedback API URL:", process.env.NEXT_PUBLIC_FEEDBACK_API_URL);
console.log("Backend URL:", process.env.NEXT_PUBLIC_API_URL);
```

## 🚀 Production Deployment

### Vercel Deployment

1. **Add environment variables in Vercel dashboard**:

   - Go to your project settings
   - Add each environment variable from your `.env.local`
   - Make sure to use production URLs

2. **Example production variables**:
   ```bash
   NEXT_PUBLIC_FEEDBACK_API_URL=https://api.flexgen.ai
   FEEDBACK_DB_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   ```

### Docker Deployment

1. **Create `.env.production`**:

   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_FEEDBACK_API_URL=https://api.flexgen.ai
   # ... other production variables
   ```

2. **Update Docker configuration** to use environment variables.

## 📚 Additional Resources

- [Feedback Implementation Guide](./FEEDBACK_IMPLEMENTATION.md)
- [Backend API Documentation](./app/feedback/README.md)
- [Database Schema](./app/feedback/backend/prisma/schema.prisma)

## 🔄 Environment Variable Template

Here's a complete template for your `.env.local`:

```bash
# Copy this entire block to your .env.local file
NEXT_PUBLIC_FEEDBACK_API_URL=http://localhost:3001
FEEDBACK_DB_URL=file:./feedback.db
JWT_SECRET=your-jwt-secret-min-32-characters-long
SESSION_SECRET=your-session-secret-min-32-characters
FEEDBACK_MAX_FILE_SIZE=5242880
FEEDBACK_UPLOAD_DIR=./uploads/feedback
FEEDBACK_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,text/plain,application/pdf
NODE_ENV=development
DEBUG=true
```

Save this file and restart your development server to apply the changes.
