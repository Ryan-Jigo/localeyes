// Backend API route for sending emails
import express from 'express';
import { GmailSMTPEmailService, IssueResolutionEmailData } from '../email/gmailSMTPEmailService';

const router = express.Router();

// Initialize email service lazily to ensure environment variables are loaded
let gmailSMTPEmailService: GmailSMTPEmailService | null = null;

function getEmailService(): GmailSMTPEmailService {
  if (!gmailSMTPEmailService) {
    gmailSMTPEmailService = new GmailSMTPEmailService();
  }
  return gmailSMTPEmailService;
}

// POST /api/send-email - Send issue resolution email
router.post('/send-email', async (req, res) => {
  try {
    const emailData: IssueResolutionEmailData = req.body;

    // Validate required fields
    if (!emailData.reporterEmail || !emailData.issueTitle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: reporterEmail and issueTitle' 
      });
    }

    console.log('📧 Sending email to:', emailData.reporterEmail);
    
    const emailService = getEmailService();
    const success = await emailService.sendIssueResolutionEmail(emailData);
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email sent successfully',
        recipient: emailData.reporterEmail
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send email' 
      });
    }
  } catch (error) {
    console.error('❌ Email API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/test-email - Test email configuration
router.get('/test-email', async (req, res) => {
  try {
    const emailService = getEmailService();
    const success = await emailService.testEmailConfiguration();
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: 'Email configuration test successful' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Email configuration test failed' 
      });
    }
  } catch (error) {
    console.error('❌ Email test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Email test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
