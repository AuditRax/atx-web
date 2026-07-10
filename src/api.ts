import express from 'express';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const apiApp = express();

// Parse JSON bodies
apiApp.use(express.json());

// In ES modules, __dirname can be derived:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let LEADS_FILE = path.resolve(__dirname, '../leads.json');
let inMemoryLeads: any[] = [];
let useInMemory = false;

// Ensure leads.json exists
function ensureLeadsFile() {
  try {
    // Check if LEADS_FILE exists or attempt to create it to verify write access
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
    } else {
      // Test write access to existing file
      fs.accessSync(LEADS_FILE, fs.constants.W_OK);
    }
  } catch (error) {
    console.warn('LEADS_FILE is not writable, falling back to /tmp/leads.json:', error);
    try {
      LEADS_FILE = '/tmp/leads.json';
      if (!fs.existsSync(LEADS_FILE)) {
        fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2));
      }
      console.log('Successfully configured writable fallback: /tmp/leads.json');
    } catch (tmpError) {
      console.error('Failed to write to /tmp/leads.json, falling back to in-memory storage:', tmpError);
      useInMemory = true;
    }
  }
}
ensureLeadsFile();

// Safe reader
function readLeads(): any[] {
  if (useInMemory) {
    return inMemoryLeads;
  }
  ensureLeadsFile();
  try {
    const data = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read leads.json, returning empty array:', error);
    return useInMemory ? inMemoryLeads : [];
  }
}

// Safe writer
function writeLeads(leads: any[]) {
  if (useInMemory) {
    inMemoryLeads = leads;
    return;
  }
  ensureLeadsFile();
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (error) {
    console.error('Failed to write leads.json, switching to in-memory fallback:', error);
    useInMemory = true;
    inMemoryLeads = leads;
  }
}

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

  // Validate corporate email domain
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Business email address is required.' });
  }
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email structure.' });
  }

  const forbiddenDomains = ['gmail.com', 'icloud.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'live.com', 'aol.com', 'zoho.com'];
  const domain = cleanEmail.split('@')[1];
  if (forbiddenDomains.includes(domain)) {
    return res.status(400).json({ 
      error: 'Please use your company domain email. Free email providers are restricted.' 
    });
  }

  // Save Lead details
  const leads = readLeads();
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

  // SMTP credentials
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || 'leads@auditrax.in';

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"AuditRax Lead Engine" <${smtpFrom}>`,
        to: 'utkarsh.auditrax@gmail.com',
        subject: `🚨 [New Lead] ${newLead.name} - ${domain.toUpperCase()}`,
        html: emailHtml
      });

      newLead.emailStatus = 'sent';
      console.log(`[AuditRax Mailer] Real email successfully sent to utkarsh.auditrax@gmail.com for ${cleanEmail}`);
    } catch (err: any) {
      newLead.emailStatus = 'failed';
      newLead.emailError = err.message || 'Unknown SMTP error';
      console.error('[AuditRax Mailer] Real email sending failed:', err);
    }
  } else {
    // Simulated Mail forwarding
    newLead.emailStatus = 'simulated_success';
    console.log('\n=============================================================');
    console.log(`[SIMULATED EMAIL FORWARDING] To: utkarsh.auditrax@gmail.com`);
    console.log(`Subject: 🚨 [New Lead] ${newLead.name} - ${domain.toUpperCase()}`);
    console.log(`Status: SMTP credentials missing in .env. Falling back to logger.`);
    console.log(`Lead Details:\n  Name: ${newLead.name}\n  Email: ${newLead.email}\n  Phone: ${newLead.mobile}\n  Message: ${newLead.message}`);
    if (newLead.calculatorData) {
      console.log(`  Leakage profile: ₹${newLead.calculatorData.estimatedLeakage.toLocaleString('en-IN')}/mo`);
    }
    console.log('=============================================================\n');
  }

  leads.unshift(newLead);
  writeLeads(leads);

  return res.status(200).json({ 
    success: true, 
    leadId: newLead.id,
    emailStatus: newLead.emailStatus 
  });
});

// GET endpoint to fetch submitted leads for Admin view
apiApp.get('/api/leads', (req, res) => {
  const secretKey = req.query.secret || req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY || 'auditrax_admin_secure';

  if (secretKey !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin secret.' });
  }

  const leads = readLeads();
  return res.status(200).json({ leads });
});

// POST endpoint to test SMTP configuration
apiApp.post('/api/leads/test-smtp', async (req, res) => {
  const secretKey = req.query.secret || req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY || 'auditrax_admin_secure';

  if (secretKey !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin secret.' });
  }

  const { host, port, user, pass, from } = req.body;

  if (!host || !user || !pass) {
    return res.status(400).json({ error: 'Host, user, and password are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || '587'),
      secure: parseInt(port) === 465,
      auth: { user, pass }
    });

    await transporter.verify();

    // Send a test email
    await transporter.sendMail({
      from: from || user,
      to: 'utkarsh.auditrax@gmail.com',
      subject: '🛠️ [AuditRax] SMTP Connection Test',
      text: 'Congratulations! Your SMTP settings on AuditRax are configured correctly and fully functional.'
    });

    return res.status(200).json({ success: true, message: 'SMTP credentials verified. Test email sent to utkarsh.auditrax@gmail.com!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to verify SMTP settings.' });
  }
});

// POST endpoint to clear leads (for admin convenience)
apiApp.post('/api/leads/clear', (req, res) => {
  const secretKey = req.query.secret || req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_SECRET_KEY || 'auditrax_admin_secure';

  if (secretKey !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin secret.' });
  }

  writeLeads([]);
  return res.status(200).json({ success: true, message: 'Leads database cleared successfully.' });
});

export default apiApp;
