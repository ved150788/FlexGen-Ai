import smtplib
from email.message import EmailMessage
import os
import json
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Email configuration
EMAIL = os.getenv("MAIL_USERNAME")
PASSWORD = os.getenv("MAIL_PASSWORD")
TO = os.getenv("MAIL_RECEIVER")

def handler(request):
    # Handle request based on method
    if request.method == "OPTIONS":
        # Handle CORS preflight request
        return {
            "status": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            "body": ""
        }
    
    if request.method == "POST":
        try:
            # Parse request body
            data = json.loads(request.body)
            
            # Extract data
            name = data.get("name")
            email = data.get("email")
            message = data.get("message")
            phone = data.get("phone", "Not provided")
            subject = data.get("subject", "New contact form submission")
            
            logger.info(f"Received contact form submission from {email}")
            
            # Validate required fields
            if not name or not email or not message:
                logger.warning("Contact form validation failed - missing required fields")
                return {
                    "status": 400,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": {"error": "All fields are required"}
                }
            
            # Create email message
            msg = EmailMessage()
            msg["Subject"] = f"Website Contact: {name}"
            msg["From"] = EMAIL
            msg["To"] = TO
            
            # Create HTML and plain text content
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Phone:</strong> {phone}</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                        <h3>Message:</h3>
                        <p>{message.replace('\n', '<br>')}</p>
                    </div>
                </body>
            </html>
            """
            
            text_content = f"""
            New Contact Form Submission
            
            Name: {name}
            Email: {email}
            Phone: {phone}
            Subject: {subject}
            
            Message:
            {message}
            """
            
            # Set email content
            msg.set_content(text_content)
            msg.add_alternative(html_content, subtype="html")
            
            # Send email
            try:
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                    smtp.login(EMAIL, PASSWORD)
                    smtp.send_message(msg)
                    
                logger.info(f"Contact email sent successfully for {email}")
                return {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": {"message": "Your message has been sent successfully!"}
                }
                
            except Exception as e:
                logger.error(f"SMTP error while sending contact email: {str(e)}")
                return {
                    "status": 500,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": {"error": f"Email sending failed: {str(e)}"}
                }
                
        except Exception as e:
            logger.error(f"Unexpected error in contact endpoint: {str(e)}")
            return {
                "status": 500,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": {"error": "An unexpected error occurred"}
            }
    
    # Default response for unsupported methods
    return {
        "status": 405,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": {"error": "Method not allowed"}
    } 