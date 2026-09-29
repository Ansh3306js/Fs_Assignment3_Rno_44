const express = require('express');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const Redis = require('ioredis');
const RedisMock = require('ioredis-mock');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3003;

// Initialize Redis Client (Fallback to Mock if local Redis server is not running)
let redisClient;
let storeType = 'Redis Store (Live Server)';

try {
  // Try connecting to default Redis server at localhost:6379 with short retry delay
  redisClient = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 1) {
        return null; // Stop retrying if Redis is not running
      }
      return 200;
    }
  });

  redisClient.on('error', (err) => {
    console.log('⚠️ Local Redis server not detected. Switching to Mock Redis Session Store for demo.');
    redisClient = new RedisMock();
    storeType = 'Redis Store (Mock Redis Engine)';
  });
} catch (e) {
  redisClient = new RedisMock();
  storeType = 'Redis Store (Mock Redis Engine)';
}

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Middleware with Connect-Redis Store
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'redis_store_secret_key_student_assignment',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Authentication Middleware for Protected Routes
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Demo user credentials
const DEMO_USER = {
  username: 'admin',
  password: 'redispassword',
  name: 'Priya Verma',
  email: 'priya.verma@example.com',
  role: 'Database Administrator'
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
  res.render('dashboard', { user: req.session.user, storeType });
});

// Protected Route 2: Analytics / Reports
app.get('/reports', isAuthenticated, (req, res) => {
  res.render('reports', { user: req.session.user, storeType });
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
  console.log(`Q3 Redis Session App running on http://localhost:${PORT}`);
});
