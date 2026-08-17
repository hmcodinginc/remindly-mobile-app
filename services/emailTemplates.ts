/**
 * Professional HTML Email Templates for Remindly Mobile App
 * Compatible with Resend, SendGrid, Amazon SES, or Mailgun.
 */

const LOGO_URL = 'https://remindly.app/assets/logo.png';
const PRIMARY_COLOR = '#5B5CE2';
const BG_COLOR = '#F7F8FA';
const CARD_BG = '#FFFFFF';
const TEXT_COLOR = '#171717';
const MUTED_TEXT = '#6B7280';

const getEmailWrapper = (content: string, previewText: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Remindly</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: ${BG_COLOR};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: ${TEXT_COLOR};
    }
    .wrapper {
      width: 100%;
      background-color: ${BG_COLOR};
      padding: 40px 0;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: ${CARD_BG};
      border-radius: 16px;
      border: 1px solid #E5E7EB;
      padding: 36px 32px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      color: ${PRIMARY_COLOR};
      letter-spacing: -0.5px;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      background-color: #EEF2FF;
      color: ${PRIMARY_COLOR};
      font-size: 12px;
      font-weight: 700;
      margin-top: 6px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: ${TEXT_COLOR};
      margin: 0 0 10px 0;
    }
    .paragraph {
      font-size: 15px;
      line-height: 24px;
      color: ${MUTED_TEXT};
      margin: 0 0 20px 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      background-color: ${PRIMARY_COLOR};
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(91, 92, 226, 0.25);
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #F3F4F6;
      font-size: 12px;
      color: #9CA3AF;
      line-height: 18px;
    }
    .footer a {
      color: ${PRIMARY_COLOR};
      text-decoration: none;
    }
    .link-fallback {
      font-size: 12px;
      color: #9CA3AF;
      word-break: break-all;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">${previewText}</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo-text">Remindly</h1>
        <span class="badge">Subscriptions & Reminders</span>
      </div>
      ${content}
      <div class="footer">
        <p>Sent by <strong>Remindly Mobile App</strong> • Stay organized effortlessly.</p>
        <p>If you didn't request this email, you can safely ignore it.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getWelcomeEmailHtml = (name: string, verifyUrl: string): string => {
  const content = `
    <h2 class="title">Welcome to Remindly, ${name}!</h2>
    <p class="paragraph">
      Thank you for creating your account. Remindly helps you track recurring subscriptions, bill renewals, and daily tasks seamlessly.
    </p>
    <p class="paragraph">
      To complete your setup and ensure you receive timely renewal reminders, please verify your email address.
    </p>
    <div class="btn-container">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </div>
    <div class="link-fallback">
      Or copy and paste this link into your browser / app:<br>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </div>
  `;
  return getEmailWrapper(content, `Welcome to Remindly, ${name}! Verify your email address.`);
};

export const getVerifyEmailHtml = (name: string, verifyUrl: string): string => {
  const content = `
    <h2 class="title">Verify Your Email</h2>
    <p class="paragraph">
      Hello ${name}, please verify your email address to secure your account and enable instant local alerts.
    </p>
    <div class="btn-container">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </div>
    <div class="link-fallback">
      Link: <a href="${verifyUrl}">${verifyUrl}</a>
    </div>
  `;
  return getEmailWrapper(content, 'Verify your email address for Remindly.');
};

export const getForgotPasswordEmailHtml = (name: string, resetUrl: string): string => {
  const content = `
    <h2 class="title">Reset Your Password</h2>
    <p class="paragraph">
      Hello ${name}, we received a request to reset the password for your Remindly account.
    </p>
    <p class="paragraph">
      Click the button below to choose a new password. This reset link is single-use and valid for <strong>15 minutes</strong>.
    </p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div class="link-fallback">
      Or open in app:<br>
      <a href="${resetUrl}">${resetUrl}</a>
    </div>
    <p class="paragraph" style="font-size: 13px; color: #EF4444; margin-top: 20px;">
      If you did not request a password reset, please ignore this message. Your password will remain unchanged.
    </p>
  `;
  return getEmailWrapper(content, 'Reset link for your Remindly account password.');
};

export const getPasswordChangedEmailHtml = (name: string): string => {
  const content = `
    <h2 class="title">Password Changed Successfully</h2>
    <p class="paragraph">
      Hello ${name}, your Remindly password was successfully updated.
    </p>
    <p class="paragraph">
      You can now log in to the mobile app with your new password. If you did not make this change, please contact our support team immediately.
    </p>
  `;
  return getEmailWrapper(content, 'Your Remindly password has been changed.');
};
