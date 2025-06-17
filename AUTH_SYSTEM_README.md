# FlexGen AI Authentication System

A comprehensive Node.js-based authentication system with user management, scan history tracking, and social login capabilities.

## 🚀 Features

### Authentication

- **Email/Password Registration & Login**
- **Social Media Login** (Google & Facebook OAuth)
- **JWT Token-based Authentication**
- **Secure Password Hashing** (bcrypt)
- **Session Management**

### User Management

- **User Profiles** with editable information
- **User Preferences** (notifications, theme, language, timezone)
- **Account Security** with email verification
- **Last Login Tracking**

### Scan History

- **Comprehensive Scan Tracking**
- **Risk Level Classification**
- **Threat Detection Results**
- **Pagination Support**
- **Scan Duration Metrics**

### Database

- **SQLite Database** with automatic table creation
- **Relational Data Structure**
- **Foreign Key Constraints**
- **Efficient Indexing**

## 📁 Project Structure

```
├── backend/
│   ├── server.js          # Main Node.js authentication server
│   └── auth.db            # SQLite database (auto-created)
├── app/
│   ├── login/
│   │   └── page.tsx       # Login/Register page
│   └── dashboard/
│       └── page.tsx       # User dashboard
├── lib/
│   └── auth.ts            # Frontend API utilities
├── start-auth-server.ps1  # PowerShell setup script
└── AUTH_SYSTEM_README.md  # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PowerShell (for Windows setup script)

### Quick Start

1. **Install Dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start Authentication Server**

   ```powershell
   # Using PowerShell script (Windows)
   .\start-auth-server.ps1

   # Or manually
   node backend/server.js
   ```

3. **Start Frontend** (in another terminal)

   ```bash
   npm run dev:frontend
   ```

4. **Access the Application**
   - Login Page: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard
   - API Health: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:3000

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### OAuth Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`

#### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3001/auth/facebook/callback`

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    firstName TEXT,
    lastName TEXT,
    avatar TEXT,
    provider TEXT DEFAULT 'local',
    providerId TEXT,
    isEmailVerified BOOLEAN DEFAULT FALSE,
    emailVerificationToken TEXT,
    resetPasswordToken TEXT,
    resetPasswordExpires INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME,
    isActive BOOLEAN DEFAULT TRUE
);
```

### Scan History Table

```sql
CREATE TABLE scan_history (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    scanType TEXT NOT NULL,
    targetUrl TEXT,
    targetIp TEXT,
    scanResults TEXT,
    scanStatus TEXT DEFAULT 'completed',
    riskLevel TEXT,
    threatsFound INTEGER DEFAULT 0,
    scanDuration INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

### User Preferences Table

```sql
CREATE TABLE user_preferences (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    emailNotifications BOOLEAN DEFAULT TRUE,
    securityAlerts BOOLEAN DEFAULT TRUE,
    marketingEmails BOOLEAN DEFAULT FALSE,
    theme TEXT DEFAULT 'light',
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    FOREIGN KEY (userId) REFERENCES users(id)
);
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/register` - Create new account
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout user
- `GET /auth/google` - Google OAuth login
- `GET /auth/facebook` - Facebook OAuth login

### User Management

- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `GET /auth/preferences` - Get user preferences
- `PUT /auth/preferences` - Update user preferences

### Scan History

- `GET /scans/history` - Get scan history (paginated)
- `POST /scans/save` - Save scan results

### Health Check

- `GET /health` - Server health status

## 💻 Frontend Usage

### Basic Authentication

```typescript
import { authAPI } from "@/lib/auth";

// Register new user
const response = await authAPI.register({
	firstName: "John",
	lastName: "Doe",
	email: "john@example.com",
	password: "securepassword",
});

// Login user
const loginResponse = await authAPI.login({
	email: "john@example.com",
	password: "securepassword",
});

// Check authentication status
const isAuthenticated = authAPI.isAuthenticated();
```

### Using React Hook

```typescript
import { useAuth } from "@/lib/auth";

function MyComponent() {
	const { isAuthenticated, login, logout, getProfile } = useAuth();

	// Component logic here
}
```

### Saving Scan Results

```typescript
import { authAPI } from "@/lib/auth";

await authAPI.saveScanResult({
	scanType: "vulnerability_scan",
	targetUrl: "https://example.com",
	scanResults: {
		/* scan data */
	},
	riskLevel: "medium",
	threatsFound: 3,
	scanDuration: 120,
});
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **CORS Protection**: Configured for specific origins
- **Helmet Security**: Security headers and protections
- **Input Validation**: Email format and password strength
- **SQL Injection Protection**: Parameterized queries
- **Session Security**: Secure cookie configuration

## 🧪 Testing

### Test Authentication Server

```bash
# Health check
curl http://localhost:3001/health

# Test registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"testpassword123"}'
```

### PowerShell Testing

```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get

# Test registration
$body = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method Post -Body $body -ContentType "application/json"
```

## 🚀 Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong, unique JWT and session secrets
3. Configure proper CORS origins
4. Set up HTTPS/SSL certificates
5. Use production database (PostgreSQL/MySQL)

### Security Checklist

- [ ] Strong JWT secret (256-bit)
- [ ] Secure session configuration
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] SQL injection protection
- [ ] XSS protection headers

## 📝 Troubleshooting

### Common Issues

1. **Port 3001 already in use**

   ```powershell
   # Find process using port
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
   # Kill the process or use different port
   ```

2. **Dependencies installation fails**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Database connection issues**

   - Check if `backend/auth.db` is created
   - Verify write permissions in backend directory

4. **OAuth login not working**
   - Verify OAuth credentials in `.env`
   - Check redirect URIs match configuration

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=auth:*
```

## 📄 License

This authentication system is part of the FlexGen AI project. Please refer to the main project license for usage terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Note**: This authentication system is designed to replace the previous Flask-based authentication with a more scalable Node.js solution. The system supports high concurrency and provides a better foundation for production deployments.
