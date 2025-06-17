# 🚀 Complete FlexGen.ai Application Startup Guide

This guide shows you how to start the complete FlexGen.ai application with all components running: frontend, backend, authentication, feedback system, email service, threat intelligence, and all tools.

## 📋 Prerequisites

### Required Software

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### Optional (for production)

- **PostgreSQL** - For production database
- **Redis** - For session storage and caching

## 🛠️ Initial Setup (One-time)

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Install feedback system dependencies
cd app/feedback/backend
npm install
cd ../../..

# Install email backend dependencies
cd flask-email-backend
pip install -r requirements.txt
cd ..
```

### 2. Environment Configuration

Create `.env.local` file in the project root:

```bash
# ===========================================
# MAIN APPLICATION
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# ===========================================
# AUTHENTICATION SYSTEM
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
SESSION_SECRET=your-session-secret-key-change-in-production-min-32-chars
FRONTEND_URL=http://localhost:3000

# OAuth (Optional - get from developer consoles)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# ===========================================
# FEEDBACK SYSTEM
# ===========================================
NEXT_PUBLIC_FEEDBACK_API_URL=http://localhost:3001
FEEDBACK_DB_URL=file:./feedback.db
FEEDBACK_MAX_FILE_SIZE=5242880
FEEDBACK_UPLOAD_DIR=./uploads/feedback

# ===========================================
# EMAIL SERVICE
# ===========================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@flexgen.ai
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# ===========================================
# WEBSOCKET SERVICE
# ===========================================
WEBSOCKET_PORT=8080
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080

# ===========================================
# THREAT INTELLIGENCE
# ===========================================
THREAT_INTEL_DB_PATH=./threat_intel.db
```

### 3. Database Setup

```bash
# Initialize threat intelligence database
python init_threat_db.py

# Setup feedback database
cd app/feedback/backend
npx prisma migrate dev
npx prisma generate
cd ../../..
```

## 🚀 Starting All Services

### Method 1: Complete Automated Startup (Recommended)

I'll create a master startup script that starts everything:

```bash
# Windows
.\start-complete.bat

# Linux/Mac
./start-complete.sh

# Or using npm
npm run start:complete
```

### Method 2: Manual Component Startup

Start each component in separate terminal windows:

#### Terminal 1: Main Frontend (Next.js)

```bash
npm run dev:frontend
# Available at: http://localhost:3000
```

#### Terminal 2: Authentication Backend

```bash
npm run dev:backend
# Available at: http://localhost:3001
```

#### Terminal 3: Threat Intelligence Backend

```bash
python api_server.py
# Available at: http://localhost:5000
```

#### Terminal 4: Feedback System Backend

```bash
cd app/feedback/backend
npm run dev
# Available at: http://localhost:3001/api/feedback
```

#### Terminal 5: Email Service Backend

```bash
cd flask-email-backend
python app.py
# Available at: http://localhost:5002
```

#### Terminal 6: WebSocket Server (Optional)

```bash
python websocket_server.py
# Available at: ws://localhost:8080
```

### Method 3: Docker Compose (Production-like)

```bash
cd app/feedback
docker-compose up -d
cd ../..
```

## 🌐 Application URLs

Once all services are running, you can access:

### Main Application

- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Login**: http://localhost:3000/login

### Tools

- **Threat Intelligence**: http://localhost:3000/tools/threat-intelligence
- **Security Dashboard**: http://localhost:3000/tools/security-dashboard
- **Email Analysis**: http://localhost:3000/tools/email-analysis
- **Network Scanner**: http://localhost:3000/tools/network-scanner
- **Vulnerability Scanner**: http://localhost:3000/tools/vulnerability-scanner

### Feedback System

- **Admin Dashboard**: http://localhost:3000/feedback-dashboard
- **My Feedback**: http://localhost:3000/my-feedback
- **Feedback Demo**: http://localhost:3000/feedback-demo

### API Endpoints

- **Main API**: http://localhost:5000/api
- **Auth API**: http://localhost:3001/auth
- **Feedback API**: http://localhost:3001/api/feedback
- **Email API**: http://localhost:5002/api

### Health Checks

- **Frontend**: http://localhost:3000/api/health
- **Auth Backend**: http://localhost:3001/health
- **Threat Intel**: http://localhost:5000/api/health
- **Email Service**: http://localhost:5002/health

## 🔧 Service Details

### Port Allocation

- **3000**: Next.js Frontend
- **3001**: Authentication Backend & Feedback API
- **5000**: Threat Intelligence Python Backend
- **5002**: Email Service Flask Backend
- **8080**: WebSocket Server

### Key Features Running

- ✅ **User Authentication** (Local, Google, Facebook OAuth)
- ✅ **All Security Tools** (Threat Intel, Vuln Scanner, etc.)
- ✅ **Feedback System** (Floating button, admin dashboard)
- ✅ **Email Service** (SMTP, notifications)
- ✅ **Real-time Updates** (WebSocket connections)
- ✅ **Database Integration** (SQLite/PostgreSQL)
- ✅ **File Uploads** (Feedback attachments)

## 🧪 Testing the Complete Setup

### 1. Test Authentication

```bash
# Visit http://localhost:3000/login
# Try logging in with test credentials or OAuth
```

### 2. Test Tools

```bash
# Visit http://localhost:3000/tools/threat-intelligence
# Run a sample threat intelligence scan
```

### 3. Test Feedback System

```bash
# Click the floating feedback button on any tool page
# Submit feedback and check admin dashboard
```

### 4. Test Email Service

```bash
# Try the contact form or password reset
# Check if emails are being sent
```

## 🛠️ Development Scripts

Add these to your `package.json` scripts section:

```json
{
	"scripts": {
		"start:complete": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\" \"npm run threat-intel\" \"npm run feedback:dev\" \"npm run email:dev\"",
		"dev:frontend": "next dev",
		"dev:backend": "node backend/server.js",
		"threat-intel": "python api_server.py",
		"feedback:dev": "cd app/feedback/backend && npm run dev",
		"email:dev": "cd flask-email-backend && python app.py",
		"websocket:dev": "python websocket_server.py",
		"health:all": "concurrently \"curl http://localhost:3000/api/health\" \"curl http://localhost:3001/health\" \"curl http://localhost:5000/api/health\"",
		"setup:complete": "npm install && pip install -r requirements.txt && cd app/feedback/backend && npm install && cd ../../../flask-email-backend && pip install -r requirements.txt"
	}
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find and kill process using port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 2. Python Dependencies Missing

```bash
pip install -r requirements.txt
pip install flask flask-cors python-dotenv
```

#### 3. Node Dependencies Missing

```bash
npm install
cd app/feedback/backend && npm install
```

#### 4. Database Connection Issues

```bash
# Reset databases
rm -f threat_intel.db feedback.db
python init_threat_db.py
cd app/feedback/backend && npx prisma migrate dev
```

#### 5. Environment Variables Not Loaded

```bash
# Check if .env.local exists
ls -la .env.local

# Restart all services after updating .env.local
```

### Service Status Check

```bash
# Check all services are running
curl http://localhost:3000/api/health  # Frontend
curl http://localhost:3001/health      # Auth Backend
curl http://localhost:5000/api/health  # Threat Intel
curl http://localhost:5002/health      # Email Service
```

## 📚 Additional Resources

- [Feedback System Setup](./FEEDBACK_ENV_SETUP.md)
- [Authentication Guide](./AUTH_SYSTEM_README.md)
- [Threat Intelligence Setup](./THREAT_INTEL_SETUP.md)
- [Email Service Setup](./email-setup-instructions.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🔄 Quick Start Commands

```bash
# Complete setup from scratch
npm run setup:complete

# Start all services
npm run start:complete

# Check all services are healthy
npm run health:all

# Stop all services (Ctrl+C in the terminal running start:complete)
```

## 🎯 Production Deployment

For production deployment, see:

- [Vercel Deployment](./DEPLOYMENT_GUIDE.md#vercel)
- [Docker Deployment](./app/feedback/docker-compose.yml)
- [Environment Variables for Production](./FEEDBACK_ENV_SETUP.md#production-deployment)

---

**🎉 Your complete FlexGen.ai application with all tools, authentication, feedback system, and email service should now be running!**
