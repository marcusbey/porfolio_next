import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

// Define Resend API response type
interface ErrorResponse {
  name: string;
  message: string;
}

interface ResendEmailResponse {
  data: {
    id: string;
  } | null;
  error: ErrorResponse | null;
}

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const CONTACT_FORM_EMAIL = process.env.CONTACT_FORM_EMAIL;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Initialize Resend
let resend: Resend | null = null;
try {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not defined');
    throw new Error('RESEND_API_KEY is not defined');
  }
  
  if (!RESEND_API_KEY.startsWith('re_')) {
    console.error('Invalid API key format. Must start with "re_"');
    throw new Error('Invalid API key format. Must start with "re_"');
  }
  
  resend = new Resend(RESEND_API_KEY);
  console.log('Resend initialized successfully');
} catch (error) {
  console.error('Error initializing Resend:', error);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Received request:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // Set CORS headers for development
  const origin = req.headers.origin || '';
  const allowedOrigins = [API_URL, 'http://localhost:3000'];
  
  if (IS_DEVELOPMENT || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!resend) {
    console.error('Resend client not initialized');
    return res.status(500).json({
      success: false,
      message: 'Email service not initialized',
      error: 'Internal server error'
    });
  }

  try {
    console.log('Processing request body:', req.body);
    const { email, message } = req.body;

    if (!email || !message) {
      console.error('Missing required fields:', { email: !!email, message: !!message });
      return res.status(400).json({ message: 'Email and message are required' });
    }

    if (!CONTACT_FORM_EMAIL) {
      console.error('CONTACT_FORM_EMAIL is missing in environment:', { 
        CONTACT_FORM_EMAIL_SET: !!CONTACT_FORM_EMAIL,
        IS_DEVELOPMENT,
        NODE_ENV: process.env.NODE_ENV
      });
      return res.status(500).json({ 
        message: 'Email service configuration error',
        details: 'Recipient email is missing'
      });
    }

    const recipientEmail = CONTACT_FORM_EMAIL;
    console.log('Email configuration:', {
      from: 'Contact Form <hi@romainboboe.com>',
      to: recipientEmail,
      replyTo: email,
      IS_DEVELOPMENT,
      RESEND_API_KEY_SET: !!RESEND_API_KEY,
      RESEND_API_KEY_VALID: RESEND_API_KEY?.startsWith('re_')
    });

    // Email configuration based on environment
    const emailData = {
      from: IS_DEVELOPMENT 
        ? 'Romain BOBOE <onboarding@resend.dev>'  // Use Resend's testing domain in development
        : 'Contact Form <hi@romainboboe.com>',    // Use custom domain in production
      to: IS_DEVELOPMENT 
        ? 'rboboe@gmail.com'  // Send only to verified email in development
        : recipientEmail,     // Send to configured email in production
      replyTo: email,
      subject: `${IS_DEVELOPMENT ? '[TEST] ' : ''}📨 New Message from RomainBOBOE.com`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; display: flex; align-items: center; gap: 15px; }
              .header svg { width: 32px; height: 32px; }
              .content { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 0.875rem; }
              ${IS_DEVELOPMENT ? '.dev-banner { background: #fde68a; color: #92400e; padding: 10px; text-align: center; margin-bottom: 20px; }' : ''}
            </style>
          </head>
          <body>
            <div class="container">
              ${IS_DEVELOPMENT ? '<div class="dev-banner">⚠️ This is a test email from development environment</div>' : ''}
              <div class="header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #06b6d4;">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <h1 style="margin: 0;">New Message from Your Website</h1>
              </div>
              <div class="content">
                <p>Hello Romain,</p>
                <p>You've received a new message from your website contact form.</p>
                
                <h2 style="color: #1f2937;">Sender Details</h2>
                <p><strong>Email:</strong> ${email}</p>
                
                <h2 style="color: #1f2937;">Message</h2>
                <p style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
                  ${message.replace(/\n/g, '<br>')}
                </p>
                
                <p style="margin-top: 20px;">
                  To reply, you can either:
                  <ul>
                    <li>Use the reply-to address set in this email</li>
                    <li>Click "Reply" in your email client</li>
                  </ul>
                </p>
              </div>
              <div class="footer">
                <p>This message was sent from the contact form on RomainBOBOE.com</p>
                ${IS_DEVELOPMENT ? '<p style="color: #92400e;">Note: In development mode, emails are only sent to verified addresses.</p>' : ''}
              </div>
            </div>
          </body>
        </html>
      `
    };

    console.log('Sending email with data:', {
      to: emailData.to,
      from: emailData.from,
      replyTo: emailData.replyTo,
      subject: emailData.subject,
      environment: process.env.NODE_ENV,
      apiKeyPrefix: RESEND_API_KEY?.substring(0, 5),
      isDevelopment: IS_DEVELOPMENT,
      resendInitialized: !!resend
    });

    const result = await resend.emails.send(emailData);
    console.log('Resend API Full Response:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('Resend API Error:', {
        error: result.error,
        errorMessage: result.error.message,
        errorName: result.error.name
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error.message
      });
    }

    console.log('Email sent successfully:', {
      id: result.data?.id,
      to: recipientEmail,
      from: emailData.from
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: result.data?.id
    });
  } catch (error: any) {
    console.error('General error in API route:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
}
