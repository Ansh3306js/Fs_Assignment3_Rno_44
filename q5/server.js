const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const Employee = require('./models/Employee');
const Leave = require('./models/Leave');

const app = express();
const PORT = process.env.PORT || 3005;
const JWT_SECRET = 'q5_employee_jwt_secret_key_student';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// DB Connection with Fallback
async function connectDB() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/employee_portal_db', { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to Local MongoDB (employee_portal_db)');
  } catch (err) {
    console.log('Local MongoDB unavailable. Starting MongoMemoryServer for Q5...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log('Connected to MongoMemoryServer');
  }

  // Seed sample employee if DB is empty
  const count = await Employee.countDocuments();
  if (count === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await Employee.create({
      empId: 'EMP1001',
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      department: 'Software Development',
      designation: 'Senior Frontend Developer',
      basicPay: 60000,
      allowances: 12000,
      deductions: 5000,
      salary: 67000,
      password: hashedPassword
    });
    console.log('Seed employee created: EmpID: EMP1001 | Password: password123');
  }
}
connectDB();

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
}

// API Route: Employee Login
app.post('/api/login', async (req, res) => {
  try {
    const { empIdOrEmail, password } = req.body;

    const employee = await Employee.findOne({
      $or: [{ empId: empIdOrEmail }, { email: empIdOrEmail }]
    });

    if (!employee) {
      return res.status(400).json({ message: 'Employee not found' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Password' });
    }

    // Sign JWT Token
    const token = jwt.sign(
      { id: employee._id, empId: employee.empId, email: employee.email, name: employee.name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      employee: {
        empId: employee.empId,
        name: employee.name,
        email: employee.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

// API Route: Get Employee Profile (Page 1)
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// API Route: Get Employee Leaves (Page 2 - List)
app.get('/api/leaves', authenticateToken, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leaves' });
  }
});

// API Route: Apply for Leave (Page 2 - Add)
app.post('/api/leaves', authenticateToken, async (req, res) => {
  try {
    const { date, reason, grant } = req.body;
    if (!date || !reason) {
      return res.status(400).json({ message: 'Date and Reason are required' });
    }

    const newLeave = new Leave({
      employee: req.user.id,
      empId: req.user.empId,
      date,
      reason,
      grant: grant || 'No'
    });

    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (err) {
    res.status(500).json({ message: 'Error applying for leave' });
  }
});

// Serve frontend for single page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Q5 Employee React Portal running on http://localhost:${PORT}`);
});
