// Backend Gmail SMTP email service using Nodemailer
import nodemailer from 'nodemailer';

export interface IssueResolutionEmailData {
  reporterEmail: string;
  reporterName?: string;
  issueTitle: string;
  issueDescription: string;
  issueLocation: string;
  department: string;
  resolvedDate: string;
}

class GmailSMTPEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      // Get credentials from environment variables
      const gmailUser = process.env.GMAIL_USER || '';
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || '';

      console.log('🔍 Debug - GMAIL_USER:', gmailUser ? 'Set' : 'Not set');
      console.log('🔍 Debug - GMAIL_APP_PASSWORD:', gmailAppPassword ? 'Set' : 'Not set');

      if (!gmailUser || !gmailAppPassword) {
        console.warn('⚠️ Gmail credentials not found. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword
        }
      });

      this.isConfigured = true;
      console.log('✅ Gmail SMTP configured successfully');
    } catch (error) {
      console.error('❌ Failed to configure Gmail SMTP:', error);
    }
  }

  async sendIssueResolutionEmail(data: IssueResolutionEmailData): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('📧 DEMO MODE: Gmail SMTP not configured. Showing email content instead:');
      console.log('='.repeat(60));
      console.log(`To: ${data.reporterEmail}`);
      console.log(`Subject: ✅ Issue Resolved: ${data.issueTitle} - LOCALEYES`);
      console.log('='.repeat(60));
      console.log(this.createEmailText(data));
      console.log('='.repeat(60));
      console.log('📧 To enable real email sending, configure Gmail credentials in .env file');
      return true; // Return true for demo purposes
    }

    try {
      const { reporterEmail, reporterName, issueTitle, issueDescription, issueLocation, department, resolvedDate } = data;
      
      const displayName = reporterName || reporterEmail.split('@')[0];
      
      const mailOptions = {
        from: `"LOCALEYES Team" <${process.env.GMAIL_USER}>`,
        to: reporterEmail,
        subject: `Issue Resolved: ${issueTitle} - LOCALEYES`,
        html: this.createEmailHTML(data),
        text: this.createEmailText(data),
        replyTo: process.env.GMAIL_USER,
        headers: {
          'X-Mailer': 'LOCALEYES-Platform',
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'List-Unsubscribe': `<mailto:${process.env.GMAIL_USER}?subject=unsubscribe>`,
          'X-Auto-Response-Suppress': 'All'
        }
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${reporterEmail}`);
      console.log('Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  private createEmailHTML(data: IssueResolutionEmailData): string {
    const { reporterEmail, reporterName, issueTitle, issueDescription, issueLocation, department, resolvedDate } = data;
    const displayName = reporterName || reporterEmail.split('@')[0];
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Issue Resolved - LOCALEYES</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .email-card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .issue-card { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .status-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; margin-bottom: 15px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; padding: 20px; background: #f8fafc; }
            .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
            .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; }
            .detail-row { margin: 10px 0; }
            .detail-label { font-weight: bold; color: #374151; }
            .detail-value { color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-card">
              <div class="header">
                <h1>🎉 Issue Resolved!</h1>
                <p>Great news, ${displayName}! Your reported issue has been successfully resolved.</p>
              </div>
              
              <div class="content">
                <div class="highlight">
                  <strong>✅ Status Update:</strong> Your issue has been marked as <strong>RESOLVED</strong> by the ${department} department.
                </div>
                
                <div class="issue-card">
                  <h3 style="margin-top: 0; color: #1f2937;">📋 Issue Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Title:</span>
                    <span class="detail-value">${issueTitle}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${issueDescription}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${issueLocation}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Department:</span>
                    <span class="detail-value">${department}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Resolved on:</span>
                    <span class="detail-value">${resolvedDate}</span>
                  </div>
                </div>
                
                <div style="text-align: center;">
                  <p style="background: #e0f2fe; padding: 15px; border-radius: 6px; color: #0369a1;">
                    <strong>📱 Access Your Dashboard:</strong><br>
                    Visit the LOCALEYES platform to view all your reported issues and track their status.
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p>Thank you for using LOCALEYES to help improve your community!</p>
                <p>If you have any questions or concerns, please contact us.</p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p><strong>LOCALEYES</strong> - SPOT IT. REPORT IT. FIX IT.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private createEmailText(data: IssueResolutionEmailData): string {
    const { reporterEmail, reporterName, issueTitle, issueDescription, issueLocation, department, resolvedDate } = data;
    const displayName = reporterName || reporterEmail.split('@')[0];
    
    return `
Dear ${displayName},

🎉 Great news! Your reported issue has been successfully resolved.

ISSUE DETAILS:
• Title: ${issueTitle}
• Description: ${issueDescription}
• Location: ${issueLocation}
• Department: ${department}
• Resolved on: ${resolvedDate}

Status: ✅ RESOLVED

The ${department} department has successfully addressed your concern. Thank you for using LOCALEYES to help improve your community!

📱 Access Your Dashboard:
Visit the LOCALEYES platform to view all your reported issues and track their status.

Best regards,
LOCALEYES Team

---
LOCALEYES - SPOT IT. REPORT IT. FIX IT.
This is an automated message. Please do not reply to this email.
    `.trim();
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.error('❌ Gmail SMTP not configured');
      return false;
    }

    try {
      const testMailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER, // Send test email to yourself
        subject: 'LOCALEYES Email Test',
        html: '<p>This is a test email from LOCALEYES Gmail SMTP service.</p>',
        text: 'This is a test email from LOCALEYES Gmail SMTP service.'
      };

      const info = await this.transporter.sendMail(testMailOptions);
      console.log('✅ Test email sent successfully');
      console.log('Message ID:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Test email failed:', error);
      return false;
    }
  }
}

export { GmailSMTPEmailService };
export const gmailSMTPEmailService = new GmailSMTPEmailService();
