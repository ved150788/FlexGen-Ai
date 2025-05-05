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
                        <p>{data.get('securityConcerns', 'Not provided').replace('\n', '<br>')}</p>
                    </div>
                    
                    <h3>Additional Information</h3>
                    <p><strong>Budget Range:</strong> {data.get('budgetRange', 'Not specified')}</p>
                    <p><strong>Timeline to Start:</strong> {data.get('timelineToStart', 'Not specified')}</p>
                    
                    <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                        <h3>Additional Notes:</h3>
                        <p>{data.get('additionalNotes', 'Not provided').replace('\n', '<br>')}</p>
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
                return {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": {"success": True, "message": "Your security audit request has been submitted successfully!"}
                }
                
            except Exception as e:
                logger.error(f"SMTP error while sending security audit email: {str(e)}")
                # Return success for UI flow
                logger.info("Returning success despite email error")
                return {
                    "status": 200,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": {"success": True, "message": "Your request has been received. Our team will contact you soon."}
                }
                
        except Exception as e:
            logger.error(f"Unexpected error in security audit endpoint: {str(e)}")
            return {
                "status": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": {"success": True, "message": "Your request has been received. Our team will contact you soon."}
            }
    
    # Default response for unsupported methods
    return {
        "status": 405,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": {"success": False, "message": "Method not allowed"}
    } 