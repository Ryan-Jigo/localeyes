# LOCALEYES Email Configuration

## Setup Instructions for Real Email Sending

### Option 1: SendGrid (Recommended)

1. **Create SendGrid Account**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Sign up for a free account (100 emails/day free)

2. **Get API Key**
   - Go to Settings → API Keys
   - Create a new API key with "Full Access" permissions
   - Copy the API key

3. **Configure Environment Variables**
   Create a `.env` file in your project root:
   ```bash
   REACT_APP_SENDGRID_API_KEY=your_sendgrid_api_key_here
   REACT_APP_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Update Email Service**
   Replace the import in `src/lib/issues.ts`:
   ```typescript
   // Change this line:
   import { emailService, IssueResolutionEmailData } from './email';
   
   // To this:
   import { realEmailService as emailService, IssueResolutionEmailData } from './realEmail';
   ```

### Option 2: AWS SES

1. **Setup AWS SES**
   - Create AWS account
   - Verify your email domain
   - Get AWS credentials

2. **Install AWS SDK**
   ```bash
   npm install aws-sdk
   ```

3. **Configure Environment Variables**
   ```bash
   REACT_APP_AWS_ACCESS_KEY_ID=your_access_key
   REACT_APP_AWS_SECRET_ACCESS_KEY=your_secret_key
   REACT_APP_AWS_REGION=us-east-1
   REACT_APP_FROM_EMAIL=noreply@yourdomain.com
   ```

### Option 3: SMTP (Nodemailer)

1. **Install Nodemailer**
   ```bash
   npm install nodemailer
   ```

2. **Configure SMTP Settings**
   ```bash
   REACT_APP_SMTP_HOST=smtp.gmail.com
   REACT_APP_SMTP_PORT=587
   REACT_APP_SMTP_USER=your_email@gmail.com
   REACT_APP_SMTP_PASS=your_app_password
   REACT_APP_FROM_EMAIL=noreply@yourdomain.com
   ```

## Testing Email Configuration

After setup, test the configuration:

1. **Check Console Logs**
   - Look for "✅ SendGrid configured successfully"
   - Or "⚠️ SendGrid API key not found"

2. **Test Email Sending**
   - Mark an issue as resolved
   - Check console for "✅ Email sent successfully"
   - Check your email inbox

## Troubleshooting

### Common Issues:

1. **"API key not found"**
   - Make sure `.env` file is in project root
   - Restart the development server after adding environment variables
   - Check that variable names start with `REACT_APP_`

2. **"Email sending failed"**
   - Verify API key is correct
   - Check SendGrid account status
   - Ensure sender email is verified in SendGrid

3. **Emails going to spam**
   - Set up SPF/DKIM records for your domain
   - Use a professional sender email address
   - Avoid spam trigger words in subject/content

## Production Considerations

1. **Rate Limits**
   - SendGrid free tier: 100 emails/day
   - Monitor usage to avoid hitting limits

2. **Email Templates**
   - Customize templates for your brand
   - Test across different email clients

3. **Error Handling**
   - Implement retry logic for failed sends
   - Log email failures for debugging

4. **Compliance**
   - Include unsubscribe links
   - Follow CAN-SPAM Act requirements

