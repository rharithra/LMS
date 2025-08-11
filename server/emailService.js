const nodemailer = require('nodemailer');

// Email configuration - using Gmail SMTP as default
// For production, use environment variables
const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'rharithra9@gmail.com', // Replace with your email
    pass: process.env.EMAIL_PASS || 'oesd oswp rdyo ybro'     // Replace with your app password
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const emailTemplates = {
  leaveApplication: (managerEmail, employeeName, leaveType, startDate, endDate, reason) => ({
    from: emailConfig.auth.user,
    to: managerEmail,
    subject: `New Leave Application from ${employeeName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: #4F46E5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">📋 New Leave Application</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Leave Request Details</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Employee:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${employeeName}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Leave Type:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${leaveType}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Start Date:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${new Date(startDate).toLocaleDateString()}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">End Date:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${new Date(endDate).toLocaleDateString()}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Reason:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${reason}</td>
            </tr>
          </table>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; margin-bottom: 20px;">Please review and approve/reject this leave request in the Employee Management System.</p>
            <a href="http://localhost:3000/leave-requests" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Review Leave Request
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; background-color: #f3f4f6; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">This is an automated email from the Employee Management System</p>
        </div>
      </div>
    `
  }),

  leaveApproval: (employeeEmail, employeeName, leaveType, startDate, endDate, status, managerName) => ({
    from: emailConfig.auth.user,
    to: employeeEmail,
    subject: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)} - ${leaveType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background-color: ${status === 'approved' ? '#10B981' : '#EF4444'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">
            ${status === 'approved' ? '✅ Leave Request Approved' : '❌ Leave Request Rejected'}
          </h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
          <h2 style="color: #374151; margin-top: 0;">Leave Request Update</h2>
          
          <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
            Dear ${employeeName},
          </p>
          
          <p style="color: #6b7280; font-size: 16px; margin-bottom: 20px;">
            Your leave request has been <strong style="color: ${status === 'approved' ? '#10B981' : '#EF4444'};">${status}</strong> by ${managerName}.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Leave Type:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${leaveType}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Start Date:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${new Date(startDate).toLocaleDateString()}</td>
            </tr>
            <tr style="background-color: #ffffff;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">End Date:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${new Date(endDate).toLocaleDateString()}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Status:</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; color: ${status === 'approved' ? '#10B981' : '#EF4444'}; font-weight: bold;">
                ${status.charAt(0).toUpperCase() + status.slice(1)}
              </td>
            </tr>
          </table>
          
          ${status === 'approved' ? 
            '<div style="background-color: #D1FAE5; border: 1px solid #10B981; border-radius: 6px; padding: 15px; margin: 20px 0;"><p style="color: #065F46; margin: 0; font-weight: bold;">🎉 Your leave has been approved! Enjoy your time off.</p></div>' : 
            '<div style="background-color: #FEE2E2; border: 1px solid #EF4444; border-radius: 6px; padding: 15px; margin: 20px 0;"><p style="color: #991B1B; margin: 0; font-weight: bold;">Your leave request has been rejected. Please contact your manager for more details.</p></div>'
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/leave-requests" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Leave Requests
            </a>
          </div>
        </div>
        
        <div style="padding: 15px; background-color: #f3f4f6; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">This is an automated email from the Employee Management System</p>
        </div>
      </div>
    `
  })
};

// Email sending functions
const sendLeaveApplicationEmail = async (managerEmail, employeeName, leaveType, startDate, endDate, reason) => {
  try {
    const mailOptions = emailTemplates.leaveApplication(managerEmail, employeeName, leaveType, startDate, endDate, reason);
    const result = await transporter.sendMail(mailOptions);
    console.log('Leave application email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending leave application email:', error);
    return { success: false, error: error.message };
  }
};

const sendLeaveApprovalEmail = async (employeeEmail, employeeName, leaveType, startDate, endDate, status, managerName) => {
  try {
    const mailOptions = emailTemplates.leaveApproval(employeeEmail, employeeName, leaveType, startDate, endDate, status, managerName);
    const result = await transporter.sendMail(mailOptions);
    console.log('Leave approval email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending leave approval email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration error:', error.message);
    console.log('📧 Please configure your email settings in server/emailService.js');
    return false;
  }
};

module.exports = {
  sendLeaveApplicationEmail,
  sendLeaveApprovalEmail,
  testEmailConfig
}; 