require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');
// const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://a9-a9-tracker.f7g8uz.easypanel.host',
  process.env.FRONTEND_URL // Pega qualquer valor vindo do Easypanel
].filter(Boolean); // Remove valores nulos ou vazios

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origem (como mobile apps ou curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  },
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Supabase Client
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_KEY;
// const supabase = createClient(supabaseUrl || '', supabaseKey || '');
// const supabase = null;

const db = require('./db');

// Routes
const ploomesService = require('./services/ploomes');
const axios = require('axios');

app.get('/', (req, res) => {
  res.send('Ploomes Tracker API Running');
});

// --- PDF PROXY ---

app.get('/api/proxy-pdf', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL is required');

  try {
    let exportUrl = url;

    // Convert Google Slides URL to PDF export URL if needed
    if (exportUrl.includes('docs.google.com/presentation')) {
      if (exportUrl.includes('/edit')) {
        exportUrl = exportUrl.split('/edit')[0] + '/export/pdf';
      } else if (exportUrl.includes('/pub')) {
        // Some pub links can also be exported
        exportUrl = exportUrl.split('/pub')[0] + '/export/pdf';
      } else if (!exportUrl.endsWith('/export/pdf')) {
        // Fallback or cleaned base
        exportUrl = exportUrl.split('?')[0].replace(/\/$/, '') + '/export/pdf';
      }
    }

    console.log(`Proxying PDF from: ${exportUrl}`);

    const response = await axios({
      method: 'get',
      url: exportUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Pass along content type but force application/pdf if it's a stream
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Access-Control-Allow-Origin', '*');

    response.data.pipe(res);
  } catch (error) {
    console.error('PDF Proxy Error:', error.message);
    res.status(500).send('Failed to fetch PDF from source. Ensure the presentation is public (Anyone with the link).');
  }
});

// --- USERS API ---

app.get('/api/users', (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/users', (req, res) => {
  const user = db.addUser(req.body);
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const user = db.updateUser(req.params.id, req.body);
  if (user) res.json(user);
  else res.status(404).json({ error: 'User not found' });
});

app.delete('/api/users/:id', (req, res) => {
  db.deleteUser(req.params.id);
  res.json({ success: true });
});

// --- AUTH API ---

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Não autenticado' });
};

// Google OAuth login route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: true
  }),
  (req, res) => {
    // Successful authentication, redirect to admin panel
    res.redirect(`${process.env.FRONTEND_URL}/admin`);
  }
);

// Get current user info
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// Logout route
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao destruir sessão' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logout realizado com sucesso' });
    });
  });
});

// --- ADMIN API ---

app.get('/api/clients', isAuthenticated, (req, res) => {
  const clients = db.getClients();
  // Sort by ID descending (most recent first, assuming ID is timestamp-based)
  const sortedClients = [...clients].sort((a, b) => b.id.localeCompare(a.id));
  res.json(sortedClients);
});

app.post('/api/clients', isAuthenticated, (req, res) => {
  const client = db.addClient(req.body);
  res.json(client);
});

app.put('/api/clients/:id', isAuthenticated, (req, res) => {
  const client = db.updateClient(req.params.id, req.body);
  if (client) res.json(client);
  else res.status(404).json({ error: 'Client not found' });
});

app.delete('/api/clients/:id', isAuthenticated, (req, res) => {
  db.deleteClient(req.params.id);
  res.json({ success: true });
});

app.get('/api/presentations', isAuthenticated, (req, res) => {
  const presentations = db.getPresentations();
  const enhancedPresentations = presentations.map(pres => {
    const logs = db.getLogsByToken(pres.token);
    const completeLog = logs.find(l => l.type === 'COMPLETE');
    const stayLogs = logs.filter(l => l.type === 'STAY');

    // Find the latest STAY log for the last slide/page if complete
    let lastPageViewTime = null;
    if (completeLog) {
      // Find the STAY log with the highest slideIndex
      const finalStay = stayLogs.reduce((prev, current) =>
        (Number(prev.slideIndex || 0) > Number(current.slideIndex || 0)) ? prev : current
        , { slideIndex: 0 });
      lastPageViewTime = finalStay.duration || null;
    }

    return {
      ...pres,
      isCompleted: !!completeLog,
      completedAt: completeLog ? completeLog.timestamp : null,
      lastPageViewTime
    };
  });

  // Sort by ID descending (most recent first)
  const sortedPresentations = enhancedPresentations.sort((a, b) => b.id.localeCompare(a.id));
  res.json(sortedPresentations);
});

app.get('/api/stats/summary', isAuthenticated, (req, res) => {
  try {
    const clients = db.getClients();
    const presentations = db.getPresentations();
    const dbData = db.readDB();
    const allLogs = dbData.logs || [];
    const totalViews = allLogs.filter(l => l.type === 'OPEN').length;
    res.json({
      clients: clients.length,
      presentations: presentations.length,
      views: totalViews
    });
  } catch (error) {
    console.error('Stats Summary Error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

app.get('/api/presentations/:id', (req, res) => {
  // Not used but kept for consistency
  res.status(501).send('Not implemented');
});

app.post('/api/presentations', isAuthenticated, (req, res) => {
  const presentation = db.addPresentation(req.body);
  res.json(presentation);
});

app.put('/api/presentations/:id', isAuthenticated, (req, res) => {
  const presentation = db.updatePresentation(req.params.id, req.body);
  if (presentation) res.json(presentation);
  else res.status(404).json({ error: 'Presentation not found' });
});

app.delete('/api/presentations/:id', isAuthenticated, (req, res) => {
  db.deletePresentation(req.params.id);
  res.json({ success: true });
});

app.get('/api/stats/:token', isAuthenticated, (req, res) => {
  const { token } = req.params;
  const logs = db.getLogsByToken(token);
  const presentation = db.getPresentationByToken(token);
  res.json({ presentation, logs });
});

// --- TRACKING API ---

app.post('/api/track/open', async (req, res) => {
  const { token, userAgent } = req.body;
  console.log(`Open Event: ${token}`, { userAgent });
  db.logAccess({ type: 'OPEN', token, userAgent });
  res.json({ success: true });
});

app.post('/api/track/stay', async (req, res) => {
  const { token, slideIndex, duration } = req.body;
  console.log(`Stay Event (Update): ${token} - Slide ${slideIndex} for ${duration}ms`);
  db.updateStayDuration(token, slideIndex, duration);
  res.json({ success: true });
});

app.post('/api/track/complete', async (req, res) => {
  const { token } = req.body;
  console.log(`Complete Event: ${token}`);
  db.logAccess({ type: 'COMPLETE', token });

  // Trigger Ploomes Automation
  const presentation = db.getPresentationByToken(token);
  if (presentation && presentation.ploomesDealId) {
    // Calculate total duration from logs if possible, or just notify completion
    // For now, simple notification
    const message = `Apresentação '${presentation.title}' foi concluída pelo cliente.`;
    await ploomesService.postDealComment(presentation.ploomesDealId, message);
  }

  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Backend Server listening on port ${port}`);
});
