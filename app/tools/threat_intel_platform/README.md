# FlexGen Threat Intelligence Platform

A lightweight, real-time Threat Intelligence platform that ingests live data from OSINT and dark web sources, enriches indicators, and provides a basic UI and API to explore threat intelligence.

## Features

- **OSINT Data Collection**: Automated crawlers for AlienVault OTX, Abuse.ch MalwareBazaar, and ThreatFox
- **IOC Normalization**: Standardized storage and tagging of various indicator types (IPs, domains, URLs, hashes)
- **Confidence Scoring**: Automatic confidence calculation based on source quality and context
- **Web Dashboard**: Intuitive UI to explore and filter threat intelligence
- **REST API**: API access to all threat data with filtering capabilities
- **Scheduled Updates**: Configurable scheduling for regular data refreshes

## Setup

### Prerequisites

- Python 3.8+
- SQLite (default) or PostgreSQL for production
- API Keys for relevant services (AlienVault OTX)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/flexgen/threat-intel-platform.git
cd threat-intel-platform
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with configuration:

```
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
DATABASE_URI=sqlite:///threat_intelligence.db
ALIENVAULT_API_KEY=your_otx_api_key
ENABLE_PASTEBIN_CRAWLER=false
ENABLE_REDDIT_CRAWLER=false
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
```

### Running the Application

Start the Flask development server:

```bash
python app.py
```

The application will be available at http://localhost:5000.

For production deployment, use Gunicorn:

```bash
gunicorn wsgi:app
```

## Usage

### Web Interface

The platform includes a web interface with three main sections:

1. **Dashboard**: Overview of data statistics and recent indicators
2. **IOC Explorer**: Search, filter, and export indicators of compromise
3. **Feed Status**: Status and history of data collection runs

### API Access

The REST API is available at `/api/v1/` with the following endpoints:

- `GET /api/v1/iocs`: List all IOCs with optional filtering
- `GET /api/v1/ioc/<id>`: Get details for a specific IOC
- `GET /api/v1/ioc/search?value=<value>`: Search IOCs by value
- `GET /api/v1/stats`: Get platform statistics

Authentication is required using either:

- JWT token (via `/api/v1/auth/token`)
- API key (via `/api/v1/auth/api-key`)

Include the API key in requests with the `X-API-Key` header.

## Crawler Configuration

Crawlers run on the following default schedules:

- AlienVault OTX: Every 6 hours
- MalwareBazaar: Every 12 hours
- ThreatFox: Every 8 hours

These schedules can be modified in `app/scheduler.py`.

## Development

### Project Structure

```
threat-intel-platform/
├── app/                        # Main application package
│   ├── __init__.py            # Flask app factory
│   ├── models/                # Database models
│   ├── routes/                # API and web routes
│   ├── crawlers/              # OSINT data collectors
│   ├── utils/                 # Utility functions
│   ├── static/                # CSS, JS, etc.
│   └── templates/             # HTML templates
├── app.py                      # Application entry point
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

### Adding New Crawlers

1. Create a new crawler file in `app/crawlers/`
2. Implement the crawler with a `run()` method
3. Register the crawler in `app/crawlers/manager.py`
4. Add scheduling in `app/scheduler.py`

## License

[MIT License](LICENSE)
