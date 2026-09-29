# Question 5: Employee Site with JWT Auth (React.js + Express + Mongoose)

## Description
A MERN stack Employee Self-Service portal featuring JWT (JSON Web Token) authentication, employee profile display, and leave application management with React.js frontend.

## Features
- **JWT Employee Authentication:** Secure token-based login.
- **Page 1 (Employee Profile):** Displays complete employee information, department, designation, and salary breakdown.
- **Page 2 (Application for Leave):**
  - **Add Leave:** Form to apply for leave with fields: `date`, `reason`, `grant` (Yes/No).
  - **List Leaves:** Tabular list of all applied leave applications and their status.
- **Logout:** Clears JWT token from state and local storage.

## How to Run
1. Navigate to `q5` directory:
   ```bash
   cd q5
   ```
2. Start server:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3005`.
4. Demo Login Credentials:
   - **Emp ID:** `EMP1001`
   - **Password:** `password123`
