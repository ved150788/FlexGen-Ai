# FlexGen.ai Threat Intelligence Tool Setup

This guide will help you set up and run the threat intelligence tool both locally and on Vercel.

## 🏗️ Architecture

The threat intelligence tool consists of:

- **Frontend**: Next.js React application
- **Backend**: Python Flask API with SQLite database
- **Data Sources**: Comprehensive TAXII feeds from 9+ real threat intelligence sources
- **Automation**: Scheduled updates every 6 hours and daily at 2:00 AM

## 🔄 **Automated Data Sources**

The system automatically fetches real threat intelligence from:

- **MITRE ATT&CK**: Adversarial tactics and techniques
- **CISA KEV**: Known exploited vulnerabilities
- **URLhaus**: Malware URLs and payloads
- **MalwareBazaar**: Malware samples and file hashes
- **ThreatFox**: Indicators of Compromise (IOCs)
- **DShield**: Top attacking IP addresses
- **OpenPhish**: Phishing URLs
- **Blocklist.de**: Malicious IP addresses
- **Feodo Tracker**: Botnet C&C servers

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- Python 3.8+
- pip (Python package manager)

### 1. Install Dependencies

```bash
# Install both frontend and backend dependencies
npm run setup
```

### 2. Start Development Server

```bash
# This will start both frontend (port 3000) and backend (port 5000)
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 3. Initialize Threat Intelligence Data

```bash
# Clean any old data and fetch fresh threat intelligence
npm run threat-setup
```

## 🔧 Manual Setup

If you prefer to set up manually:

### Frontend Setup

```bash
npm install
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Run Separately

```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

## ☁️ Vercel Deployment

The threat intelligence tool is configured to automatically deploy on Vercel with both frontend and backend.

### Automatic Setup

1. Connect your GitHub repository to Vercel
2. Vercel will automatically:
   - Build the Next.js frontend
   - Deploy Python backend as serverless functions
   - Set up API routes at `/api/threat/*`

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

No additional environment variables are required for basic functionality. The tool uses demo API keys that work for testing.

## 📊 API Endpoints

### Local Development

- `GET http://localhost:5000/api/dashboard` - Dashboard statistics
- `GET http://localhost:5000/api/iocs` - List all IOCs
- `GET http://localhost:5000/api/search?query=<term>` - Search threats
- `GET http://localhost:5000/api/taxii-status` - TAXII server status
- `POST http://localhost:5000/api/refresh-data` - Force refresh threat data

### Production (Vercel)

- `GET /api/threat/dashboard` - Dashboard statistics
- `GET /api/threat/iocs` - List all IOCs
- `GET /api/threat/search?query=<term>` - Search threats
- `GET /api/threat/taxii-status` - TAXII server status

## 🗄️ Database

The tool uses SQLite for data storage:

- **Local**: `backend/threat_intel.db`
- **Production**: Database is created automatically on first run

## 🔧 Configuration

### Python Backend (Local)

Located in `backend/app.py`:

- Port: 5000
- Host: 0.0.0.0 (accessible from all interfaces)
- Debug: True (for development)

### Vercel Serverless Functions

Located in `api/python/`:

- Runtime: Python 3.9
- Auto-scaling serverless functions
- CORS enabled for frontend access

## 🛠️ Development Scripts

```bash
npm run dev          # Start both frontend and backend
npm run dev:frontend # Start only Next.js frontend
npm run dev:backend  # Start only Python backend
npm run build        # Build for production
npm run setup        # Install all dependencies
npm run install:backend # Install only Python dependencies

# Threat Intelligence Management
npm run threat-status    # Comprehensive threat intelligence status
npm run refresh-data     # Force refresh of threat intelligence data
npm run clean-old-data   # Clean up old/dummy data
npm run threat-setup     # Complete setup: clean + refresh + status

# Health Checks
npm run health           # Basic health check for frontend/backend
```

## 🔍 Monitoring & Troubleshooting

### Status Checking

```bash
# Check comprehensive status of threat intelligence system
npm run threat-status
```

This will show:

- Database status and IOC counts
- Backend API health
- Individual API endpoint status
- Data freshness information
- Source distribution (AlienVault OTX, ThreatFox)

### Data Refresh

```bash
# Force refresh of threat intelligence data
npm run refresh-data
```

This will:

- Clear existing data to prevent dummy data issues
- Fetch fresh IOCs from AlienVault OTX and ThreatFox
- Store real threat intelligence indicators only

### Fixing Dummy Data Issues

If you're seeing dummy/mock data instead of real threat intelligence:

1. **Check Status**: `npm run threat-status`
2. **Refresh Data**: `npm run refresh-data`
3. **Restart Backend**: Stop and restart `npm run dev:backend`

The system now **only uses real data** - dummy data fallbacks have been removed.

## 🐛 Troubleshooting

### Backend Won't Start

1. Check Python installation: `python --version`
2. Install backend dependencies: `npm run install:backend`
3. Try running manually: `cd backend && python app.py`

### Frontend Issues

1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version: `node --version`

### No Real Data / Dummy Data Showing

1. Run status check: `npm run threat-status`
2. If database is empty or mock data detected: `npm run refresh-data`
3. Restart backend: `npm run dev:backend`

### API Connection Issues

- **Local**: Ensure backend is running on port 5000
- **Production**: Check Vercel function logs for errors

## 📁 Project Structure

```
├── api/
│   └── python/           # Vercel serverless functions
├── backend/              # Local Python Flask app
│   ├── app.py           # Main Flask application
│   ├── requirements.txt # Python dependencies
│   └── threat_intel.db  # SQLite database
├── scripts/
│   ├── start-dev.js     # Development starter script
│   ├── health-check.js  # Basic health check
│   ├── threat-intel-status.js # Comprehensive status check
│   └── refresh-data.js  # Data refresh utility
├── package.json         # Node.js configuration
├── vercel.json          # Vercel deployment config
└── README.md
```

## 🔒 Security Notes

- Demo API keys are used for testing
- For production, replace with your own API keys
- Database is local SQLite (consider PostgreSQL for production)
- CORS is enabled for all origins (configure for production)

## 🚨 Data Quality Assurance

The system ensures **only real, fresh threat intelligence data**:

- ❌ **No dummy/mock data** - all fallbacks removed
- ✅ **9+ real threat intelligence sources** via TAXII and APIs
- ✅ **Automated scheduling** every 6 hours + daily updates
- ✅ **Comprehensive monitoring** and status reporting
- ✅ **Data freshness validation** (removes data older than 30 days)

## 🎯 **Solution Summary**

✅ **Automated Data Fetching**: Every 6 hours + daily at 2:00 AM  
✅ **9+ Real Threat Intelligence Sources**: No dummy data  
✅ **Comprehensive Monitoring**: Full status and health checks  
✅ **Data Quality Assurance**: Automatic cleanup of old data  
✅ **Easy Management**: Simple npm scripts for all operations

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `npm run threat-status` for diagnostic information
3. Review the console logs for error messages
4. Ensure all dependencies are properly installed
