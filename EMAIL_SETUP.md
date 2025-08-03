# Email Notification Setup

## Prerequisites

1. **Gmail Account** (or other email provider)
2. **App Password** (for Gmail, you need to enable 2FA and generate an app password)

## Setup Steps

### 1. Install Dependencies

```bash
npm install nodemailer
```

### 2. Create Environment Variables

Create a `.env` file in the root directory:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
JWT_SECRET=your-secret-key
```

### 3. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security > 2-Step Verification
3. Click on "App passwords"
4. Generate a new app password for "Mail"
5. Use this password in your `.env` file

### 4. Alternative Email Providers

#### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: 'your-email@outlook.com',
    pass: 'your-password'
  }
});
```

#### Yahoo
```javascript
const transporter = nodemailer.createTransporter({
  service: 'yahoo',
  auth: {
    user: 'your-email@yahoo.com',
    pass: 'your-app-password'
  }
});
```

### 5. Test Email Configuration

Add this route to test email functionality:

```javascript
app.get('/api/test-email', async (req, res) => {
  try {
    await sendEmail(
      'test@example.com',
      'leaveRequest',
      ['John Doe', 'Manager Name', 'Annual Leave', 5]
    );
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Email test failed' });
  }
});
```

## Email Templates

The system includes three email templates:

### 1. Leave Request Notification (to Manager)
- **Subject:** "New Leave Request Submitted"
- **Content:** Employee details, leave type, duration
- **Action:** Manager logs in to approve/reject

### 2. Leave Approved Notification (to Employee)
- **Subject:** "Leave Request Approved"
- **Content:** Approval details, leave balance update
- **Style:** Green theme with checkmark

### 3. Leave Rejected Notification (to Employee)
- **Subject:** "Leave Request Rejected"
- **Content:** Rejection details, reason (if provided)
- **Style:** Red theme with X mark

## Security Notes

1. **Never commit your `.env` file** to version control
2. **Use app passwords** instead of your main password
3. **Enable 2FA** on your email account
4. **Test thoroughly** before deploying to production

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**
   - Check your email and password
   - Ensure you're using an app password for Gmail

2. **"Less secure app access" error**
   - Enable 2FA and use app passwords
   - Don't use your main password

3. **"Connection timeout" error**
   - Check your internet connection
   - Verify email provider settings

### Testing:

1. **Start the server:** `npm start`
2. **Test email:** Visit `/api/test-email`
3. **Submit leave request** and check manager's email
4. **Approve/reject leave** and check employee's email

## Production Deployment

For production, consider:

1. **Email service providers** like SendGrid, Mailgun, or AWS SES
2. **Environment-specific configurations**
3. **Email templates** stored in database
4. **Email queuing** for high-volume applications
5. **Email tracking** and analytics 