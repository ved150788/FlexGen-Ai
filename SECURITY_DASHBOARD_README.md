# FlexGen.ai Security Dashboard

A comprehensive, real-time security monitoring dashboard that aggregates outputs from all security tools in one unified interface. This dashboard provides security teams with a centralized view of their organization's security posture, eliminating the need to jump between different tools.

## 🚀 Features

### Real-Time Monitoring

- **Live Updates**: WebSocket-powered real-time updates for immediate threat visibility
- **Aggregated Metrics**: Unified view of security data from all tools
- **System Status**: Real-time health monitoring of all security services

### Comprehensive Security Coverage

- **Threat Intelligence**: Real-time threat detection and analysis
- **Vulnerability Management**: Automated vulnerability scanning and tracking
- **API Security**: Continuous API endpoint monitoring and fuzzing
- **Reconnaissance**: Automated domain and infrastructure reconnaissance

### Interactive Dashboard

- **Risk Score Calculation**: Dynamic overall risk assessment
- **Visual Analytics**: Charts and graphs for trend analysis
- **Alert Management**: Centralized security alert handling
- **Activity Timeline**: Recent security activities across all tools

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend APIs   │    │  Security Tools │
│   (Next.js)     │◄──►│   (Node.js)      │◄──►│                 │
│                 │    │                  │    │ • Threat Intel  │
│ Security        │    │ • Metrics API    │    │ • Vuln Scanner  │
│ Dashboard       │    │ • Threats API    │    │ • API Fuzzer    │
│                 │    │ • Alerts API     │    │ • Recon Bot     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │              ┌──────────────────┐
         └──────────────►│  WebSocket       │
                        │  Server          │
                        │  (Python)        │
                        └──────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **Python** 3.8 or higher
- **npm** or **yarn** package manager
- **pip** Python package manager

## 🛠️ Installation & Setup

### Quick Start (Recommended)

#### Windows

```bash
# Run the automated setup script
start_security_dashboard.bat
```

#### Linux/macOS

```bash
# Make the script executable (if needed)
chmod +x start_security_dashboard.sh

# Run the automated setup script
./start_security_dashboard.sh
```

### Manual Setup

1. **Install Dependencies**

   ```bash
   # Install Node.js dependencies
   npm install

   # Install Python dependencies for WebSocket server
   pip install -r websocket_requirements.txt
   ```

2. **Start Backend Services**

   ```bash
   # Start the main API server
   python api_server.py

   # Start the WebSocket server (in a new terminal)
   python websocket_server.py
   ```

3. **Start Frontend**

   ```bash
   # Start the Next.js development server
   npm run dev
   ```

4. **Access the Dashboard**
   - Open your browser and navigate to: `http://localhost:3000/security-dashboard`

## 🌐 Service Endpoints

| Service            | URL                                        | Purpose                    |
| ------------------ | ------------------------------------------ | -------------------------- |
| Frontend           | `http://localhost:3000`                    | Main application           |
| Security Dashboard | `http://localhost:3000/security-dashboard` | Unified security dashboard |
| API Server         | `http://localhost:5000`                    | Backend API services       |
| WebSocket Server   | `ws://localhost:5001`                      | Real-time updates          |

## 📊 Dashboard Components

### 1. Key Metrics Cards

- **Overall Risk Score**: Calculated based on all security factors
- **Active Threats**: Current threat count from intelligence feeds
- **Vulnerabilities**: Total vulnerabilities discovered
- **APIs Monitored**: Number of API endpoints under surveillance

### 2. System Status Panel

Real-time status indicators for:

- Threat Intelligence Service
- Vulnerability Scanner
- API Fuzzer
- Reconnaissance Bot

### 3. Analytics Charts

- **Threat Detection Trends**: Time-series chart of threat discoveries
- **Vulnerability Distribution**: Breakdown by severity levels
- **API Security Status**: Secure vs vulnerable endpoints

### 4. Security Alerts

- Real-time security alerts from all tools
- Severity-based color coding
- Alert status tracking (Active, Investigating, Resolved)

### 5. Recent Activities

- Latest vulnerability scans
- Recent API fuzzing results
- Reconnaissance findings
- Timestamp tracking for all activities

## 🔧 API Endpoints

### Security Dashboard APIs

| Endpoint                                  | Method | Description                 |
| ----------------------------------------- | ------ | --------------------------- |
| `/api/security-dashboard/metrics`         | GET    | Aggregated security metrics |
| `/api/security-dashboard/threats`         | GET    | Threat intelligence data    |
| `/api/security-dashboard/vulnerabilities` | GET    | Vulnerability scan results  |
| `/api/security-dashboard/api-security`    | GET    | API security status         |
| `/api/security-dashboard/reconnaissance`  | GET    | Recon findings              |
| `/api/security-dashboard/alerts`          | GET    | Security alerts             |
| `/api/security-dashboard/status`          | GET    | System status               |

### WebSocket Events

| Event Type          | Description             |
| ------------------- | ----------------------- |
| `new_threat`        | New threat detected     |
| `new_vulnerability` | New vulnerability found |
| `new_alert`         | New security alert      |
| `status_update`     | Service status change   |

## 🎯 Usage Guide

### Monitoring Security Posture

1. **Overall Risk Assessment**: Check the risk score card for immediate security status
2. **Trend Analysis**: Use the charts to identify security trends over time
3. **Alert Management**: Monitor the alerts panel for immediate threats
4. **System Health**: Verify all services are online in the status panel

### Real-Time Updates

- The dashboard automatically refreshes every 30 seconds
- WebSocket connections provide instant updates for critical events
- Manual refresh available via the refresh button

### Interpreting Risk Scores

- **0-30**: Low Risk (Green)
- **31-70**: Medium Risk (Yellow)
- **71-100**: High Risk (Red)

## 🔒 Security Considerations

- **Network Security**: Ensure proper firewall configuration for service ports
- **Access Control**: Implement authentication for production deployments
- **Data Privacy**: Sensitive security data should be encrypted in transit
- **Monitoring**: Set up logging and monitoring for the dashboard services

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**

   - Ensure WebSocket server is running on port 5001
   - Check firewall settings
   - Verify no port conflicts

2. **API Endpoints Not Responding**

   - Confirm API server is running on port 5000
   - Check backend service logs
   - Verify database connectivity

3. **Dashboard Not Loading**
   - Ensure Next.js dev server is running on port 3000
   - Check browser console for errors
   - Verify all dependencies are installed

### Logs and Debugging

- **Frontend Logs**: Browser developer console
- **Backend Logs**: Terminal running `api_server.py`
- **WebSocket Logs**: Terminal running `websocket_server.py`

## 🚀 Production Deployment

### Environment Variables

```bash
NODE_ENV=production
API_BASE_URL=https://your-domain.com
WEBSOCKET_URL=wss://your-domain.com/ws
```

### Build Commands

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is part of the FlexGen.ai security platform. Please refer to the main project license.

## 📞 Support

For support and questions:

- Check the troubleshooting section above
- Review the logs for error messages
- Contact the FlexGen.ai support team

---

**Note**: This dashboard aggregates data from multiple security tools. Ensure all underlying security services are properly configured and running for optimal functionality.
