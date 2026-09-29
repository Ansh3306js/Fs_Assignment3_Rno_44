const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const path = require('path');
const Employee = require('./models/Employee');

const app = express();
const PORT = process.env.PORT || 3004;

// Database Connection with In-Memory MongoDB Fallback
async function connectDB() {
  const localUri = 'mongodb://127.0.0.1:27017/erp_admin_system';
  try {
    await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to local MongoDB (erp_admin_system)');
  } catch (err) {
    console.log('Local MongoDB not running. Initializing MongoMemoryServer...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoMemoryServer at ${mongoUri}`);
  }
}
connectDB();

// Setup EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Setup
app.use(session({
  secret: 'admin_erp_secret_key_student_assignment',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Admin Auth Middleware
function isAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  res.redirect('/login');
}

// Nodemailer Transporter Helper
async function sendWelcomeEmail(employeeEmail, empId, rawPassword, name) {
  try {
    // Generate test Ethereal account if no SMTP provided
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    let info = await transporter.sendMail({
      from: '"ERP Admin System" <admin@erp-system.com>',
      to: employeeEmail,
      subject: 'Welcome to ERP System - Account Created',
      html: `
        <h3>Welcome ${name}!</h3>
        <p>Your employee account has been created in the ERP System.</p>
        <p><strong>Employee ID:</strong> ${empId}</p>
        <p><strong>Initial Password:</strong> ${rawPassword}</p>
        <p>Please log in and change your password as soon as possible.</p>
      `
    });

    console.log(`📧 Email sent to ${employeeEmail}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.log('📧 Email Notification (Console Fallback):');
    console.log(`To: ${employeeEmail} | EmpID: ${empId} | Password: ${rawPassword}`);
  }
}

// Route: Root
app.get('/', (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Route: GET Login
app.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin/dashboard');
  res.render('login', { error: null });
});

// Route: POST Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.admin = { username: 'admin', role: 'ERP Super Admin' };
    return res.redirect('/admin/dashboard');
  }
  res.render('login', { error: 'Invalid Admin Credentials!' });
});

// Route: Admin Dashboard (READ Employees)
app.get('/admin/dashboard', isAdmin, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.render('dashboard', { admin: req.session.admin, employees, message: req.query.msg });
  } catch (err) {
    res.status(500).send('Error loading dashboard');
  }
});

// Route: GET Add Employee Form
app.get('/admin/employee/add', isAdmin, (req, res) => {
  res.render('add-employee', { admin: req.session.admin, error: null });
});

// Route: POST Create Employee (CREATE + Generate EmpID & Password + Encrypt + Calculate Salary + Email)
app.post('/admin/employee/add', isAdmin, async (req, res) => {
  try {
    const { name, email, department, designation, basicPay, allowances, deductions } = req.body;

    // Check if email already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.render('add-employee', { admin: req.session.admin, error: 'Employee with this email already exists!' });
    }

    // Generate EmpID (EMP1001, EMP1002...)
    const count = await Employee.countDocuments();
    const empId = `EMP${1001 + count}`;

    // Auto-generate Random Password
    const rawPassword = 'Emp@' + Math.floor(1000 + Math.random() * 9000);

    // Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Calculate Salary
    const bPay = parseFloat(basicPay) || 0;
    const allow = parseFloat(allowances) || 0;
    const deduct = parseFloat(deductions) || 0;
    const calculatedSalary = bPay + allow - deduct;

    const newEmp = new Employee({
      empId,
      name,
      email,
      department,
      designation,
      basicPay: bPay,
      allowances: allow,
      deductions: deduct,
      salary: calculatedSalary,
      password: hashedPassword,
      rawPassword: rawPassword
    });

    await newEmp.save();

    // Send Welcome Email
    await sendWelcomeEmail(email, empId, rawPassword, name);

    res.redirect(`/admin/dashboard?msg=Employee ${empId} added successfully! Initial Password: ${rawPassword}`);
  } catch (err) {
    console.error('Error adding employee:', err);
    res.render('add-employee', { admin: req.session.admin, error: 'Failed to add employee. Please check inputs.' });
  }
});

// Route: GET Edit Employee Form
app.get('/admin/employee/edit/:id', isAdmin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.redirect('/admin/dashboard');
    res.render('edit-employee', { admin: req.session.admin, employee, error: null });
  } catch (err) {
    res.redirect('/admin/dashboard');
  }
});

// Route: POST Update Employee (UPDATE + Recalculate Salary)
app.post('/admin/employee/edit/:id', isAdmin, async (req, res) => {
  try {
    const { name, email, department, designation, basicPay, allowances, deductions } = req.body;
    
    const bPay = parseFloat(basicPay) || 0;
    const allow = parseFloat(allowances) || 0;
    const deduct = parseFloat(deductions) || 0;
    const calculatedSalary = bPay + allow - deduct;

    await Employee.findByIdAndUpdate(req.params.id, {
      name,
      email,
      department,
      designation,
      basicPay: bPay,
      allowances: allow,
      deductions: deduct,
      salary: calculatedSalary
    });

    res.redirect('/admin/dashboard?msg=Employee details updated successfully!');
  } catch (err) {
    const employee = await Employee.findById(req.params.id);
    res.render('edit-employee', { admin: req.session.admin, employee, error: 'Error updating employee.' });
  }
});

// Route: DELETE Employee
app.get('/admin/employee/delete/:id', isAdmin, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard?msg=Employee deleted successfully!');
  } catch (err) {
    res.redirect('/admin/dashboard');
  }
});

// Route: Admin Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Q4 Admin ERP Server running on http://localhost:${PORT}`);
});
