# Email Setup for Flexgen.ai Contact Forms

This document provides instructions for setting up the email functionality for the contact forms on the Flexgen.ai website.

## Required Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
# Email Configuration for Contact Form
EMAIL_ENABLED=false
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@flexgen.ai
EMAIL_TO=contact@flexgen.ai
```

## Configuration Options

1. Set `EMAIL_ENABLED` to `true` once you've configured all other values.
2. Use appropriate SMTP settings for your email provider:

### Gmail

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Note**: For Gmail, you'll need to use an App Password, not your regular password. You can create one in your Google Account settings under Security > App passwords.

### Microsoft Office 365 / Outlook

```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-outlook-email@example.com
EMAIL_PASSWORD=your-password
```

### Testing with Mailtrap

For development/testing purposes, you can use [Mailtrap](https://mailtrap.io/):

```
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

## Troubleshooting

1. Check your email provider's security settings - you may need to allow "less secure apps" or generate app-specific passwords.
2. Make sure your server's IP is not blocked by your email provider.
3. If emails are not being sent but the form submission succeeds, check the server logs for detailed error messages.

## Verifying Setup

To verify your email setup is working:

1. Set `EMAIL_ENABLED=true` in your `.env.local` file
2. Submit a test message via any of the contact forms
3. You should receive an email notification at the address specified in `EMAIL_TO`
4. Check the server logs for any error messages if emails are not being received

## Contact Form Locations

The website has multiple contact forms that all use this email configuration:

1. Main contact form: `/app/components/forms/ContactForm.tsx`
2. Modal contact form: `/app/components/forms/ModalContactForm.tsx`
3. Common modal contact form: `/app/components/common/ModalContactForm.tsx`

These forms all use the API endpoint `/app/api/contact/route.ts` which handles form validation and email sending.
