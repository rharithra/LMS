# 📧 Email Notification Setup Guide

The Leave Management System now supports real-time email notifications for leave applications and approvals! 

## 🚀 Quick Setup

### Step 1: Get Email Credentials

**For Gmail (Recommended):**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Generate an "App Password" specifically for this application:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and generate a password
   - Copy the generated 16-character password

**For Other Email Providers:**
- Use your SMTP settings (host, port, username, password)

### Step 2: Configure Email Settings

Open `server/emailService.js` and update the email configuration:

```javascript
const emailConfig = {
  service: 'gmail', // Change if using other provider
  auth: {
    user: 'your-email@gmail.com',    // Replace with your email
    pass: 'your-app-password'        // Replace with your app password
  }
};
```

**Alternative: Use Environment Variables (Recommended for Production)**

Create a `.env` file in the root directory:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Step 3: Test Configuration

1. Start the server: `npm run backend`
2. Look for this message in the console:
   ```
   📧 Testing email configuration...
   ✅ Email service is ready to send emails
   ```

If you see an error instead, check your credentials and try again.

## 📬 How Email Notifications Work

### Leave Application
- **Trigger**: When an employee submits a leave request
- **Recipients**: All managers and admins in the system
- **Content**: Beautiful HTML email with leave details and action button

### Leave Approval/Rejection
- **Trigger**: When a manager approves or rejects a leave request  
- **Recipients**: The employee who submitted the request
- **Content**: Styled notification with approval status and details

## 🎨 Email Templates

The system includes professional HTML email templates with:
- ✅ Responsive design
- 🎨 Company branding colors
- 📊 Formatted leave details table
- 🔗 Direct links to the application
- 📱 Mobile-friendly layout

## 🔧 Customization

### Change Email Templates
Edit the templates in `server/emailService.js`:
- `emailTemplates.leaveApplication` - For new leave requests
- `emailTemplates.leaveApproval` - For approval/rejection notifications

### Add More Recipients
Modify the recipient logic in `server/server.js`:
- Leave applications: Line ~1300
- Leave approvals: Line ~1480

### Use Different Email Provider
Update the `emailConfig` object in `server/emailService.js`:

```javascript
const emailConfig = {
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your-email@domain.com',
    pass: 'your-password'
  }
};
```

## 🚨 Troubleshooting

### "Invalid login" error with Gmail
- Make sure 2FA is enabled on your Google account
- Use an App Password, not your regular password
- Check that "Less secure app access" is disabled (use App Passwords instead)

### Emails not sending
- Check your internet connection
- Verify email credentials are correct
- Check spam folder for test emails
- Review server console for error messages

### "Connection timeout" errors
- Check firewall settings
- Try different SMTP port (587, 465, or 25)
- Verify SMTP server address

## 📋 Testing Checklist

1. ✅ Server starts without email configuration errors
2. ✅ Employee can submit leave request
3. ✅ Manager receives email notification for new leave request
4. ✅ Manager can approve/reject leave
5. ✅ Employee receives email notification of approval/rejection
6. ✅ Emails appear correctly formatted in various email clients

## 🛡️ Security Best Practices

- ✅ Use App Passwords instead of main account passwords
- ✅ Store email credentials in environment variables
- ✅ Never commit email credentials to version control
- ✅ Use different email accounts for development and production
- ✅ Regularly rotate email passwords

---

**Need Help?** Check the server console logs for detailed error messages when emails fail to send. 