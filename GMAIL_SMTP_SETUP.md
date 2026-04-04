# Gmail SMTP Setup Instructions

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. This is required to generate App Passwords

## Step 2: Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **2-Step Verification**
3. Scroll down to **App passwords**
4. Click **Select app** → Choose **Mail**
5. Click **Select device** → Choose **Other (custom name)**
6. Enter "LOCALEYES" as the device name
7. Click **Generate**
8. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```bash
REACT_APP_GMAIL_USER=your-gmail@gmail.com
REACT_APP_GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Example:**
```bash
REACT_APP_GMAIL_USER=john.doe@gmail.com
REACT_APP_GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

## Step 4: Restart Development Server

```bash
npm run dev
```

## Step 5: Test Email Sending

1. Login as Authority (PWD department)
2. Mark any issue as "Resolved"
3. Check console for "✅ Email sent successfully"
4. Check the reporter's email inbox

## Troubleshooting

### Common Issues:

1. **"Gmail credentials not found"**
   - Make sure `.env` file is in project root
   - Restart dev server after adding environment variables
   - Check that variable names start with `REACT_APP_`

2. **"Authentication failed"**
   - Verify App Password is correct (16 characters)
   - Make sure 2-Factor Authentication is enabled
   - Check that Gmail address is correct

3. **"Email sending failed"**
   - Check Gmail account status
   - Verify App Password hasn't expired
   - Check console for detailed error messages

4. **Emails going to spam**
   - Gmail may flag automated emails
   - Check spam folder
   - Consider using a professional email address

## Security Notes

- **Never commit `.env` file to version control**
- **App Passwords are safer than regular passwords**
- **Each app password is unique and can be revoked**
- **Use a dedicated Gmail account for the application**

## Production Considerations

- Use a dedicated Gmail account for the application
- Consider using Gmail Workspace for professional emails
- Monitor email sending limits (Gmail: 500 emails/day for free accounts)
- Implement email queuing for high volume

## Alternative: Use a Dedicated Email Service

For production applications, consider:
- **SendGrid** (100 emails/day free)
- **Mailgun** (10,000 emails/month free)
- **AWS SES** (62,000 emails/month free)
- **Postmark** (100 emails/month free)

These services are more reliable and have better deliverability than SMTP.

