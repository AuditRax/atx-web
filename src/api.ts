import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const apiApp = express();

// Parse JSON bodies
apiApp.use(express.json());

// POST endpoint to capture lead
apiApp.post('/api/leads', async (req, res) => {
  const { name, email, mobile, message, calculatorData } = req.body;

  // Basic sanitization
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanMobile = (mobile || '').trim();
  const cleanMessage = (message || '').trim();

  // Validate presence
  if (!cleanName) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  // Validate mobile (10-digit starting with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!cleanMobile) {
    return res.status(400).json({ error: 'Mobile number is required.' });
  } else if (!phoneRegex.test(cleanMobile)) {
    return res.status(400).json({ error: 'Enter a valid 10-digit mobile number (starting with 6-9).' });
  }

  // Validate email structure
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email structure.' });
  }

  const domain = cleanEmail.split('@')[1];

  // Generate Lead details
  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: cleanName,
    email: cleanEmail,
    mobile: cleanMobile,
    message: cleanMessage,
    calculatorData: calculatorData || null,
    timestamp: new Date().toISOString(),
    emailStatus: 'pending',
    emailError: null as string | null
  };

  // Build the HTML email content
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; text-align: center;">
        <h1 style="color: #06b6d4; margin: 0; font-size: 24px; letter-spacing: -0.5px; font-weight: 800;">Audit<span style="color: #ffffff;">Rax</span></h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; tracking: 1.5px; font-weight: 600;">New Lead Notification</p>
      </div>
      <div style="padding: 32px; bg: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Lead Information</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 35%; font-weight: 600;">Full Name:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: bold;">${newLead.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Work Email:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px;"><a href="mailto:${newLead.email}" style="color: #06b6d4; text-decoration: none; font-weight: bold;">${newLead.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Mobile Number:</td>
            <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: bold;">${newLead.mobile}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Submitted Time:</td>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">${new Date(newLead.timestamp).toLocaleString('en-IN')}</td>
          </tr>
        </table>

        ${newLead.message ? `
          <div style="background-color: #f8fafc; border-left: 4px solid #06b6d4; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Message:</p>
            <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${newLead.message}</p>
          </div>
        ` : ''}

        ${newLead.calculatorData ? `
          <h2 style="color: #0f172a; margin-top: 32px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Revenue Leakage Profile</h2>
          <div style="background-color: #0f172a; color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Monthly Orders:</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff; font-size: 13px; font-weight: bold;">${newLead.calculatorData.orders.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">Average Order Value (AOV):</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff; font-size: 13px; font-weight: bold;">₹${newLead.calculatorData.aov.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #94a3b8; font-size: 13px;">RTO Rate:</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff; font-size: 13px; font-weight: bold;">${newLead.calculatorData.rto}%</td>
              </tr>
              <tr style="border-top: 1px solid #334155;">
                <td style="padding: 12px 0 6px 0; color: #a5f3fc; font-size: 14px; font-weight: 600;">Estimated Leakage:</td>
                <td style="padding: 12px 0 6px 0; text-align: right; color: #06b6d4; font-size: 18px; font-weight: 900;">₹${newLead.calculatorData.estimatedLeakage.toLocaleString('en-IN')} / mo</td>
              </tr>
            </table>
          </div>
        ` : ''}

        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">This email is securely forwarded by the AuditRax Lead Capture Service.</p>
        </div>
      </div>
    </div>
  `;

  // Resend credentials
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  const emailTo = process.env.EMAIL_TO || 'connect@auditrax.in';

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: `AuditRax <${emailFrom}>`,
        to: emailTo,
        subject: `🚨 New Lead Request: ${newLead.name} - ${cleanEmail}`,
        html: emailHtml
      });

      if (error) {
        newLead.emailStatus = 'failed';
        newLead.emailError = error.message;
        console.error('[AuditRax Mailer] Real email sending failed (API Error):', error);
      } else {
        newLead.emailStatus = 'sent';
        console.log(`[AuditRax Mailer] Real email successfully sent! Data ID:`, data?.id);
      }
    } catch (err: any) {
      newLead.emailStatus = 'failed';
      newLead.emailError = err.message || 'Unknown Resend error';
      console.error('[AuditRax Mailer] Real email sending failed:', err);
    }
  } else {
    // Simulated Mail forwarding
    newLead.emailStatus = 'simulated_success';
    console.log('\n=============================================================');
    console.log(`[SIMULATED EMAIL FORWARDING] To: ${emailTo}`);
    console.log(`Subject: 🚨 New Lead Request: ${newLead.name} - ${cleanEmail}`);
    console.log(`Status: RESEND_API_KEY missing in .env. Falling back to logger.`);
    console.log(`Lead Details:\n  Name: ${newLead.name}\n  Email: ${newLead.email}\n  Phone: ${newLead.mobile}\n  Message: ${newLead.message}`);
    if (newLead.calculatorData) {
      console.log(`  Leakage profile: ₹${newLead.calculatorData.estimatedLeakage.toLocaleString('en-IN')}/mo`);
    }
    console.log('=============================================================\n');
  }



  return res.status(200).json({ 
    success: true, 
    leadId: newLead.id,
    emailStatus: newLead.emailStatus 
  });
});



export default apiApp;
