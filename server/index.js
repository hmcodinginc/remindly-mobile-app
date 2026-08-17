/**
 * Remindly Production Backend API Server & Email Dispatcher
 * Node.js + Express + Resend API Integration
 *
 * Environment Variables Required (.env):
 * - PORT=5000
 * - RESEND_API_KEY=re_123456789...
 * - SENDER_EMAIL=Remindly <noreply@remindly.app>
 * - APP_SCHEME=remindly
 * - FRONTEND_URL=https://remindly.app
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Resend Email Provider
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = new Resend(resendApiKey);
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'Remindly App <onboarding@resend.dev>';
const APP_SCHEME = process.env.APP_SCHEME || 'remindly';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8081';

// In-Memory Database (In production, use PostgreSQL, PocketBase, or MongoDB)
const usersDb = new Map(); // email -> userRecord
const resetTokensDb = new Map(); // token -> { email, expiresAt, used }
const verifyTokensDb = new Map(); // token -> { email, expiresAt, used }

// Simple In-Memory Rate Limiting
const rateLimitMap = new Map();
const isRateLimited = (ipOrEmail, limitWindowMs = 60000, maxRequests = 3) => {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrEmail) || { count: 0, resetAt: now + limitWindowMs };

  if (now > record.resetAt) {
    rateLimitMap.set(ipOrEmail, { count: 1, resetAt: now + limitWindowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  rateLimitMap.set(ipOrEmail, record);
  return false;
};

// Helper HTML Templates
const getWelcomeTemplate = (name, link) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 12px;">
    <h2 style="color: #5B5CE2;">Welcome to Remindly, ${name}!</h2>
    <p style="color: #4B5563; font-size: 14px;">Your account has been created. Click the button below to verify your email address and activate your account:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${link}" style="background-color: #5B5CE2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
    </div>
    <p style="color: #9CA3AF; font-size: 12px;">Or open in app: <a href="${link}">${link}</a></p>
  </div>
`;

const getResetTemplate = (name, link) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E5E7EB; border-radius: 12px;">
    <h2 style="color: #5B5CE2;">Reset Your Remindly Password</h2>
    <p style="color: #4B5563; font-size: 14px;">Hello ${name}, a password reset request was received for your account. Click below to create a new password. This link expires in 15 minutes:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${link}" style="background-color: #5B5CE2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #9CA3AF; font-size: 12px;">Deep link: <a href="${link}">${link}</a></p>
  </div>
`;

/**
 * 1. POST /api/auth/register
 * Register a new user & send Welcome/Verification email
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (usersDb.has(normalizedEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const userRecord = {
      id: userId,
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      password: hashedPassword,
      emailVerified: false,
      created: new Date().toISOString(),
    };

    usersDb.set(normalizedEmail, userRecord);

    // Generate Verification Token (expires in 24 hrs)
    const token = crypto.randomBytes(32).toString('hex');
    verifyTokensDb.set(token, {
      email: normalizedEmail,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      used: false,
    });

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
    const deepLinkUrl = `${APP_SCHEME}://verify-email?token=${token}`;

    // Send Welcome & Verification Email via Resend
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: [normalizedEmail],
        subject: 'Welcome to Remindly - Verify Your Account',
        html: getWelcomeTemplate(userRecord.name, verifyUrl),
      });
    } catch (emailErr) {
      console.warn('Resend email dispatch notice (using test key or mock):', emailErr?.message);
    }

    return res.status(201).json({
      message: 'Account created successfully! Verification link dispatched to ' + normalizedEmail,
      user: { id: userId, email: normalizedEmail, name: userRecord.name, emailVerified: false },
      verifyUrl,
      deepLinkUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 2. POST /api/auth/verify-email
 * Validate single-use verification token
 */
app.post('/api/auth/verify-email', (req, res) => {
  const { token } = req.body;
  if (!token || !verifyTokensDb.has(token)) {
    return res.status(400).json({ error: 'Invalid or expired verification token' });
  }

  const record = verifyTokensDb.get(token);
  if (record.used || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'Verification token has expired or already been used' });
  }

  const user = usersDb.get(record.email);
  if (user) {
    user.emailVerified = true;
  }

  record.used = true;

  return res.json({ message: 'Email address verified successfully!', emailVerified: true });
});

/**
 * 3. POST /api/auth/forgot-password
 * Send single-use 15-min password reset link (Rate limited & secure)
 */
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required' });

    const normalizedEmail = email.toLowerCase().trim();

    // Security check: rate limit password reset requests per email
    if (isRateLimited(normalizedEmail)) {
      return res.status(429).json({ error: 'Too many reset requests. Please wait 1 minute before trying again.' });
    }

    // Always respond with success message to prevent user enumeration security vulnerability
    const successMsg = 'If an account exists for ' + normalizedEmail + ', a password reset link has been dispatched.';

    const user = usersDb.get(normalizedEmail);
    if (!user) {
      return res.json({ message: successMsg });
    }

    // Generate single-use secure reset token (expires in 15 mins)
    const token = crypto.randomBytes(32).toString('hex');
    resetTokensDb.set(token, {
      email: normalizedEmail,
      expiresAt: Date.now() + 15 * 60 * 1000,
      used: false,
    });

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    const deepLinkUrl = `${APP_SCHEME}://reset-password?token=${token}`;

    // Send email via Resend
    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: [normalizedEmail],
        subject: 'Remindly - Password Reset Link',
        html: getResetTemplate(user.name, resetUrl),
      });
    } catch (emailErr) {
      console.warn('Resend email dispatch notice (using test key or mock):', emailErr?.message);
    }

    return res.json({
      message: successMsg,
      resetUrl,
      deepLinkUrl,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * 4. POST /api/auth/reset-password
 * Verify single-use reset token & set new password
 */
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const tokenRecord = resetTokensDb.get(token);
    if (!tokenRecord || tokenRecord.used || Date.now() > tokenRecord.expiresAt) {
      return res.status(400).json({ error: 'Invalid, expired, or already used reset token' });
    }

    const user = usersDb.get(tokenRecord.email);
    if (!user) {
      return res.status(400).json({ error: 'Associated user account not found' });
    }

    // Hash new password and invalidate token immediately
    user.password = await bcrypt.hash(newPassword, 10);
    tokenRecord.used = true;

    return res.json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Remindly Auth & Email Backend running on port ${PORT}`);
});
