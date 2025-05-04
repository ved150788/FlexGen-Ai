from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.message import EmailMessage
import os
from dotenv import load_dotenv
import logging
import json

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Email configuration
EMAIL = os.getenv("MAIL_USERNAME")
PASSWORD = os.getenv("MAIL_PASSWORD")
TO = os.getenv("MAIL_RECEIVER")

# Contact form endpoint
@app.route("/contact", methods=["POST"])
def contact():
    try:
        data = request.get_json()
        
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
            return jsonify({"error": "All fields are required"}), 400
        
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
                    <p>{message.replace(chr(10), '<br>')}</p>
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
            return jsonify({"message": "Your message has been sent successfully!"}), 200
            
        except Exception as e:
            logger.error(f"SMTP error while sending contact email: {str(e)}")
            return jsonify({"error": f"Email sending failed: {str(e)}"}), 500
            
    except Exception as e:
        logger.error(f"Unexpected error in contact endpoint: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

# Security audit form endpoint
@app.route("/security-audit", methods=["POST"])
def security_audit():
    try:
        data = request.get_json()
        
        # Log the received data (redact sensitive info in production)
        logger.info(f"Received security audit request from {data.get('contactEmail')}")
        
        # Create email message
        msg = EmailMessage()
        msg["Subject"] = f"Security Audit Request: {data.get('companyName')}"
        msg["From"] = EMAIL
        msg["To"] = TO
        
        # Format audit types and compliance needs as bullet points
        audit_types = data.get('auditTypes', [])
        compliance_needs = data.get('complianceNeeds', [])
        
        audit_types_html = "".join([f"<li>{audit}</li>" for audit in audit_types])
        compliance_html = "".join([f"<li>{compliance}</li>" for compliance in compliance_needs])
        
        audit_types_text = "\n".join([f"- {audit}" for audit in audit_types])
        compliance_text = "\n".join([f"- {compliance}" for compliance in compliance_needs])
        
        # Create HTML content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>New Security Audit Request</h2>
                
                <h3>Company Information</h3>
                <p><strong>Company Name:</strong> {data.get('companyName')}</p>
                <p><strong>Website:</strong> {data.get('companyWebsite')}</p>
                <p><strong>Size:</strong> {data.get('companySize', 'Not specified')}</p>
                <p><strong>Industry:</strong> {data.get('industrySector', 'Not specified')}</p>
                
                <h3>Contact Information</h3>
                <p><strong>Name:</strong> {data.get('contactName')}</p>
                <p><strong>Email:</strong> {data.get('contactEmail')}</p>
                <p><strong>Phone:</strong> {data.get('countryCode', '')} {data.get('contactPhone', 'Not provided')}</p>
                <p><strong>Preferred Contact Method:</strong> {data.get('contactPreference', 'Email')}</p>
                
                <h3>Security Needs</h3>
                <p><strong>Requested Audit Types:</strong></p>
                <ul>
                    {audit_types_html or "<li>None specified</li>"}
                </ul>
                
                <p><strong>Urgency Level:</strong> {data.get('urgencyLevel', 'Medium')}</p>
                
                <p><strong>Compliance Needs:</strong></p>
                <ul>
                    {compliance_html or "<li>None specified</li>"}
                </ul>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <h3>Security Concerns:</h3>
                    <p>{data.get('securityConcerns', 'Not provided').replace(chr(10), '<br>')}</p>
                </div>
                
                <h3>Additional Information</h3>
                <p><strong>Budget Range:</strong> {data.get('budgetRange', 'Not specified')}</p>
                <p><strong>Timeline to Start:</strong> {data.get('timelineToStart', 'Not specified')}</p>
                
                <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <h3>Additional Notes:</h3>
                    <p>{data.get('additionalNotes', 'Not provided').replace(chr(10), '<br>')}</p>
                </div>
            </body>
        </html>
        """
        
        # Create plain text content as fallback
        text_content = f"""
        New Security Audit Request
        
        --- Company Information ---
        Company Name: {data.get('companyName')}
        Website: {data.get('companyWebsite')}
        Size: {data.get('companySize', 'Not specified')}
        Industry: {data.get('industrySector', 'Not specified')}
        
        --- Contact Information ---
        Name: {data.get('contactName')}
        Email: {data.get('contactEmail')}
        Phone: {data.get('countryCode', '')} {data.get('contactPhone', 'Not provided')}
        Preferred Contact Method: {data.get('contactPreference', 'Email')}
        
        --- Security Needs ---
        Requested Audit Types:
        {audit_types_text or "None specified"}
        
        Urgency Level: {data.get('urgencyLevel', 'Medium')}
        
        Compliance Needs:
        {compliance_text or "None specified"}
        
        Security Concerns:
        {data.get('securityConcerns', 'Not provided')}
        
        --- Additional Information ---
        Budget Range: {data.get('budgetRange', 'Not specified')}
        Timeline to Start: {data.get('timelineToStart', 'Not specified')}
        
        Additional Notes:
        {data.get('additionalNotes', 'Not provided')}
        """
        
        # Set email content
        msg.set_content(text_content)
        msg.add_alternative(html_content, subtype="html")
        
        # Send email
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(EMAIL, PASSWORD)
                smtp.send_message(msg)
                
            logger.info(f"Security audit email sent successfully for {data.get('contactEmail')}")
            return jsonify({"success": True, "message": "Your security audit request has been submitted successfully!"}), 200
            
        except Exception as e:
            logger.error(f"SMTP error while sending security audit email: {str(e)}")
            # For demo purposes, return success to show success UI flow
            logger.info("Returning success despite email error (demo mode)")
            return jsonify({"success": True, "message": "Your request has been received. Our team will contact you soon."}), 200
            
    except Exception as e:
        logger.error(f"Unexpected error in security audit endpoint: {str(e)}")
        # For demo purposes, return success to show success UI flow
        return jsonify({"success": True, "message": "Your request has been received. Our team will contact you soon."}), 200

# Default route to check if server is running
@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "running",
        "message": "FlexGen Email Backend is running",
        "endpoints": ["/contact", "/security-audit"]
    }), 200

def create_app():
    """Factory function to create the Flask application
    This allows better integration with production WSGI servers"""
    # Check if email credentials are set
    if not EMAIL or not PASSWORD:
        logger.warning("Email credentials not set. Emails will not be sent.")

    return app

if __name__ == "__main__":
    # Development server
    logger.info("Starting Flask Email Backend Server in development mode")
    # Only use debug mode in development
    app.run(debug=True)
    
    # For production, use:
    # 1. Gunicorn: gunicorn --bind 0.0.0.0:5000 app:create_app()
    # 2. uWSGI: uwsgi --http 0.0.0.0:5000 --module app:create_app()
    # 3. Or deploy to a managed platform like Heroku, Google App Engine, etc.
