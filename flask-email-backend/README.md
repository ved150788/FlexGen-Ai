# FlexGen Email Backend

A Flask-based backend for handling email functionality for the FlexGen.ai website contact forms and security audit requests.

## Features

- Contact form email handling
- Security audit request processing
- Cross-origin request handling (CORS)
- HTML and plain text email formatting

## Setup

### Prerequisites

- Python 3.8 or higher
- SMTP email account credentials (Gmail recommended)

### Installation

1. Clone the repository
2. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your email credentials:

```
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_RECEIVER=recipient_email@example.com
```

For Gmail, you'll need to use an App Password. [Learn how to create one](https://support.google.com/accounts/answer/185833?hl=en).

## Usage

### Development Mode

Run the server locally for development:

```bash
python app.py
```

The server will start at http://localhost:5000.

### Production Deployment

For production, use a proper WSGI server. This project includes configurations for both Gunicorn and uWSGI.

#### Using Gunicorn

```bash
gunicorn --bind 0.0.0.0:5000 wsgi:application
```

#### Using uWSGI

```bash
uwsgi --ini production.ini
```

#### Using Systemd (Linux)

Create a systemd service file at `/etc/systemd/system/flexgen-email.service`:

```
[Unit]
Description=FlexGen Email Backend Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/flexgen.ai/flask-email-backend
Environment="PATH=/path/to/flexgen.ai/flask-email-backend/venv/bin"
ExecStart=/path/to/flexgen.ai/flask-email-backend/venv/bin/gunicorn --workers 4 --bind 0.0.0.0:5000 wsgi:application

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable flexgen-email
sudo systemctl start flexgen-email
```

#### Using Docker

A Dockerfile is included for containerized deployment:

```bash
docker build -t flexgen-email .
docker run -p 5000:5000 --env-file .env flexgen-email
```

## API Endpoints

- `GET /`: Check if the server is running
- `POST /contact`: Handle contact form submissions
- `POST /security-audit`: Process security audit requests

## Security Considerations

- Always use HTTPS in production
- Set up proper firewalls and access controls
- Consider using a reverse proxy like Nginx
- Keep your Python dependencies updated
- Store your .env file outside of version control
