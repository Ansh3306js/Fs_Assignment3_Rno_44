const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware with FileStore
app.use(session({
  store: new FileStore({
    path: path.join(__dirname, 'sessions'),
    ttl: 3600, // session live for 1 hour (in seconds)
    retries: 0
  }),
  secret: 'file_store_secret_key_student_assignment',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour in ms
}));

// Authentication Middleware for Protected Routes
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Dummy user credentials
const DEMO_USER = {
  username: 'student',
  password: 'password123',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  role: 'Full Stack Developer'
};

// Route: Root redirect
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Route: GET Login
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Route: POST Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    req.session.user = {
      username: DEMO_USER.username,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      role: DEMO_USER.role
    };
    return res.redirect('/dashboard');
  }

  res.render('login', { error: 'Invalid Username or Password!' });
});

// Protected Route 1: Dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

// Protected Route 2: Profile
app.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// Route: Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Q2 File Session Store App running on http://localhost:${PORT}`);
});
