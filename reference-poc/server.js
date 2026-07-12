// ═══════════════════════════════════════════════════════════════
//  FRED BLACK — Aviation Intelligence Platform
//  Express API server — auth, invites, static file serving
// ═══════════════════════════════════════════════════════════════
require('dotenv').config();

const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const { Pool }   = require('pg');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 10000;
const isProd = process.env.NODE_ENV === 'production';

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname)));   // serves all HTML/CSS/JS

// ── Database ───────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invites (
      id         SERIAL PRIMARY KEY,
      token      TEXT UNIQUE NOT NULL,
      email      TEXT NOT NULL,
      role       TEXT NOT NULL CHECK (role IN ('insurer','operator')),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at    TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id             SERIAL PRIMARY KEY,
      email          TEXT UNIQUE NOT NULL,
      username       TEXT UNIQUE NOT NULL,
      display_name   TEXT NOT NULL,
      password_hash  TEXT NOT NULL,
      role           TEXT NOT NULL CHECK (role IN ('insurer','operator')),
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add email_verified to existing deployments that lack it (always true now)
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT TRUE;
  `);
  // ── Seed demo accounts (idempotent) ───────────────────────────
  for (const acc of Object.values(DEMO_ACCOUNTS)) {
    const ex = await pool.query('SELECT id FROM users WHERE email=$1', [acc.email]);
    if (ex.rows.length === 0) {
      const hash = await bcrypt.hash(process.env.DEMO_PASSWORD || 'FredBlack-Demo-2026!', 12);
      await pool.query(
        `INSERT INTO users (email, username, display_name, password_hash, role, email_verified)
         VALUES ($1,$2,$3,$4,$5, TRUE)`,
        [acc.email, acc.username, acc.displayName, hash, acc.role]
      );
      console.log(`✔ Demo account seeded: ${acc.username} [${acc.role}]`);
    }
  }

  console.log('✔ Database tables ready');
}

// ── Email ──────────────────────────────────────────────────────
// Supports Resend (recommended), any SMTP provider, or console-only (dev).
function getTransport() {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com', port: 465, secure: true,
      auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
    });
  }
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null; // dev-only: log link to console
}

async function sendInviteEmail(to, role, token) {
  const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
  const link   = `${appUrl}/setup.html?t=${token}`;
  const isIns  = role === 'insurer';
  const label  = isIns ? 'Underwriter (Insurer)' : 'Fleet Manager (Operator)';
  const color  = isIns ? '#1A6FE8' : '#F59E0B';
  const bgColor = isIns ? 'rgba(26,111,232,0.18)' : 'rgba(245,158,11,0.18)';

  // Always log to console — useful in dev and as a fallback audit trail
  console.log(`\n📧 Invite link for ${to} [${role}]:\n   ${link}\n`);

  const transport = getTransport();
  if (!transport) return; // dev mode — link is in the console / API response

  await transport.sendMail({
    from:    process.env.EMAIL_FROM || '"FRED BLACK" <noreply@fredblack.app>',
    to,
    subject: `Your FRED BLACK access — ${label}`,
    html: `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#0B0F1A;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:480px;margin:0 auto;">
  <!-- Header -->
  <div style="background:#1A6FE8;border-radius:12px 12px 0 0;padding:22px 28px;display:flex;align-items:center;gap:10px;">
    <span style="font-size:22px;">✈</span>
    <span style="font-size:16px;font-weight:800;letter-spacing:.06em;color:white;">FRED BLACK</span>
  </div>
  <!-- Body -->
  <div style="background:#111827;border:1px solid #1E2D45;border-top:none;border-radius:0 0 12px 12px;padding:32px 28px;">
    <h2 style="margin:0 0 10px;font-size:20px;font-weight:700;color:#F1F5F9;">You've been invited</h2>
    <p style="margin:0 0 18px;font-size:13px;color:#A8BBCE;line-height:1.55;">
      You have been granted access to the FRED BLACK Aviation Intelligence Platform as:
    </p>
    <div style="display:inline-block;background:${bgColor};color:${color};padding:5px 14px;border-radius:20px;
                font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin-bottom:24px;
                border:1px solid ${color}33;">
      ${label}
    </div>
    <p style="margin:0 0 26px;font-size:13px;color:#A8BBCE;line-height:1.55;">
      Click the button below to create your username and password.<br>
      <strong style="color:#F1F5F9;">This link expires in 24 hours</strong> and can only be used once.
    </p>
    <a href="${link}"
       style="display:inline-block;background:#1A6FE8;color:white;padding:13px 28px;
              border-radius:9px;font-weight:600;text-decoration:none;font-size:14px;">
      Set Up My Account →
    </a>
    <p style="margin:24px 0 0;font-size:11px;color:#64748B;word-break:break-all;">
      Or copy this link:<br>${link}
    </p>
  </div>
  <p style="text-align:center;font-size:11px;color:#64748B;margin-top:20px;">
    © 2026 Stone Africa · FRED BLACK Aviation Intelligence
  </p>
</div>
</body></html>`,
  });
}

// ── JWT helpers ────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// ── Demo accounts ──────────────────────────────────────────────
// These are seeded automatically on startup and never expire.
// Access them via /login.html?demo=insurer or ?demo=operator
const DEMO_ACCOUNTS = {
  insurer:  { email: 'demo.insurer@fredblack.demo',  username: 'demo_insurer',  displayName: 'Demo Insurer',  role: 'insurer'  },
  operator: { email: 'demo.operator@fredblack.demo', username: 'demo_operator', displayName: 'Demo Operator', role: 'operator' },
};

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  const token  = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ═══ API ROUTES ════════════════════════════════════════════════

// ── POST /api/invite/send ──────────────────────────────────────
// Generates an invite for the given email + role.
// Protected: only authenticated insurers can invite new users.
// (Remove requireAuth for open-invite demo mode.)
app.post('/api/invite/send', requireAuth, async (req, res) => {
  if (req.user.role !== 'insurer') {
    return res.status(403).json({ error: 'Only insurers can send invites' });
  }

  const { email, role } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!['insurer', 'operator'].includes(role)) {
    return res.status(400).json({ error: 'Role must be insurer or operator' });
  }

  const token     = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await pool.query(
      'INSERT INTO invites (token, email, role, expires_at) VALUES ($1,$2,$3,$4)',
      [token, email.toLowerCase().trim(), role, expiresAt]
    );
    await sendInviteEmail(email, role, token);

    const appUrl   = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
    const invLink  = `${appUrl}/setup.html?t=${token}`;
    const emailSent = getTransport() !== null;
    res.json({
      success:   true,
      // Always return the invite link so the dashboard can display it
      // for copy/paste sharing (useful when no email provider is set)
      inviteLink: invLink,
      emailSent,
      // devLink alias kept for backward-compatibility
      ...(!emailSent && { devLink: invLink }),
    });
  } catch (err) {
    console.error('Invite send error:', err.message);
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// ── POST /api/invite/validate ──────────────────────────────────
// Called by setup.html on load to check the token is still valid.
app.post('/api/invite/validate', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const result = await pool.query(
    `SELECT email, role FROM invites
     WHERE token=$1 AND used_at IS NULL AND expires_at > NOW()`,
    [token]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Link is invalid or has expired' });
  }
  res.json({ email: result.rows[0].email, role: result.rows[0].role });
});

// ── POST /api/auth/setup ───────────────────────────────────────
// Creates the user account from a valid invite token.
app.post('/api/auth/setup', async (req, res) => {
  const { token, username, displayName, password } = req.body;
  if (!token || !username || !displayName || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3–24 alphanumeric characters or underscores' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Re-validate invite inside transaction (prevents race conditions)
    const inv = await client.query(
      `SELECT * FROM invites WHERE token=$1 AND used_at IS NULL AND expires_at > NOW()`,
      [token]
    );
    if (inv.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Link is invalid or has expired' });
    }
    const invite = inv.rows[0];

    // Check for conflicts
    const conflict = await client.query(
      'SELECT id FROM users WHERE LOWER(username)=LOWER($1) OR email=$2',
      [username, invite.email]
    );
    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Username or email is already registered' });
    }

    // Create user — email is verified because they clicked the invite link
    const hash = await bcrypt.hash(password, 12);
    const user = await client.query(
      `INSERT INTO users (email, username, display_name, password_hash, role, email_verified)
       VALUES ($1,$2,$3,$4,$5, TRUE)
       RETURNING id, email, username, display_name AS "displayName", role, email_verified AS "emailVerified"`,
      [invite.email, username.toLowerCase(), displayName.trim(), hash, invite.role]
    );

    // Consume invite
    await client.query('UPDATE invites SET used_at=NOW() WHERE id=$1', [invite.id]);
    await client.query('COMMIT');

    const u = user.rows[0];
    const payload = { sub: u.id, email: u.email, username: u.username, displayName: u.displayName, role: u.role, emailVerified: true };
    res.json({ token: signToken(payload), user: payload });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Setup error:', err.message);
    res.status(500).json({ error: 'Account creation failed' });
  } finally {
    client.release();
  }
});

// ── POST /api/auth/register ────────────────────────────────────
// Self-registration is DISABLED — accounts are created by the admin
// only (via /api/auth/first-setup or /api/invite/send).
app.post('/api/auth/register', (req, res) => {
  res.status(403).json({ error: 'Self-registration is disabled. Contact the administrator to request access.' });
});

// ── POST /api/auth/login ───────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const result = await pool.query(
    `SELECT id, email, username, display_name AS "displayName", password_hash, role, email_verified AS "emailVerified"
     FROM users WHERE email=$1`,
    [email.toLowerCase().trim()]
  );
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const u = result.rows[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

  const payload = { sub: u.id, email: u.email, username: u.username, displayName: u.displayName, role: u.role, emailVerified: true };
  res.json({ token: signToken(payload), user: payload });
});


// ── GET /api/auth/setup-status ─────────────────────────────────
// Returns whether the platform needs its first admin account.
// The login page calls this on load to show the first-run setup form.
app.get('/api/auth/setup-status', async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) AS count FROM users');
  res.json({ needsSetup: parseInt(result.rows[0].count, 10) === 0 });
});

// ── POST /api/auth/first-setup ─────────────────────────────────
// Creates the very first insurer account with no invite required.
// Permanently disabled once any user exists in the database.
app.post('/api/auth/first-setup', async (req, res) => {
  // Guard: only allowed when DB is empty
  const check = await pool.query('SELECT COUNT(*) AS count FROM users');
  if (parseInt(check.rows[0].count, 10) > 0) {
    return res.status(403).json({ error: 'Setup already complete. Please sign in.' });
  }

  const { email, username, displayName, password } = req.body;
  if (!email || !username || !displayName || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return res.status(400).json({ error: 'Username must be 3–24 alphanumeric characters or underscores' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await pool.query(
      `INSERT INTO users (email, username, display_name, password_hash, role, email_verified)
       VALUES ($1,$2,$3,$4,'insurer', TRUE)
       RETURNING id, email, username, display_name AS "displayName", role, email_verified AS "emailVerified"`,
      [email.toLowerCase().trim(), username.toLowerCase(), displayName.trim(), hash]
    );
    const u = user.rows[0];
    console.log(`✔ First admin account created: ${u.email} [insurer]`);
    const payload = { sub: u.id, email: u.email, username: u.username, displayName: u.displayName, role: u.role, emailVerified: true };
    res.json({ token: signToken(payload), user: payload });
  } catch (err) {
    console.error('First-setup error:', err.message);
    res.status(500).json({ error: 'Account creation failed' });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────
// Used by index.html on load to verify the stored JWT is still valid.
app.get('/api/auth/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT id, email, username, display_name AS "displayName", role, email_verified AS "emailVerified"
     FROM users WHERE id=$1`,
    [req.user.sub]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ user: result.rows[0] });
});

// ── POST /api/auth/demo-login ──────────────────────────────────
// Returns a short-lived JWT for a demo account — no password needed.
// Disable by setting DEMO_ENABLED=false in your environment.
app.post('/api/auth/demo-login', async (req, res) => {
  if (process.env.DEMO_ENABLED === 'false') {
    return res.status(403).json({ error: 'Demo access is disabled on this instance.' });
  }
  const { role } = req.body;
  if (!DEMO_ACCOUNTS[role]) {
    return res.status(400).json({ error: 'Role must be "insurer" or "operator".' });
  }
  const acc = DEMO_ACCOUNTS[role];
  try {
    const result = await pool.query(
      `SELECT id, email, username, display_name AS "displayName", role
       FROM users WHERE email=$1`,
      [acc.email]
    );
    if (result.rows.length === 0) {
      return res.status(503).json({ error: 'Demo accounts are not yet initialised. Please try again shortly.' });
    }
    const u = result.rows[0];
    const payload = {
      sub: u.id, email: u.email, username: u.username,
      displayName: u.displayName, role: u.role,
      emailVerified: true, isDemo: true,
    };
    res.json({ token: signToken(payload), user: payload });
  } catch (err) {
    console.error('Demo-login error:', err.message);
    res.status(500).json({ error: 'Demo login failed. Please try again.' });
  }
});

// ── GET / ──────────────────────────────────────────────────────
// Express static serves all files; redirect bare root to login.
app.get('/', (req, res) => res.redirect('/login.html'));

// ═══ BOOT ══════════════════════════════════════════════════════
initDB()
  .then(() => app.listen(PORT, () => console.log(`✈ FRED BLACK server → http://localhost:${PORT}`)))
  .catch(err => { console.error('Fatal: DB init failed —', err.message); process.exit(1); });
