# Question 4: ERP Admin Panel - Employee Management System

## Description
An ERP Admin Panel using Express.js, Mongoose, and EJS template engine to manage employees with automated ID/password generation, bcrypt password encryption, salary calculation, and automated email notifications via `nodemailer`.

## Features
- **Admin Session Login:** Secure Admin panel login.
- **Employee CRUD:** Create, Read, Update, Delete employee records.
- **Auto EmpID & Password:** Automatically assigns formatted `empId` (e.g. `EMP1001`) and initial password.
- **Encrypted Password:** Encrypts generated passwords using `bcryptjs`.
- **Salary Calculation:** Dynamically calculates Net Salary: `basicPay + allowances - deductions`.
- **Email Notification:** Triggers automated email notification with initial login credentials using `nodemailer`.

## How to Run
1. Navigate to `q4` directory:
   ```bash
   cd q4
   ```
2. Start the server:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3004`.
4. Admin Credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
