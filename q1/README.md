# Question 1: User Registration Form with Express & EJS

## Description
A full Express.js user registration application using EJS templates, `express-validator` for input validation, and `multer` for file uploads (single profile picture + multiple extra photos).

## Features
- **Form Fields:** Username, Email, Password, Confirm Password, Gender (radio), Hobbies (checkboxes), Profile Pic (single), Other Pics (multiple).
- **Validations:** Server-side validation using `express-validator` & `multer`.
- **Error Handling:** Displays field errors while retaining previous input values.
- **Success View:** Displays all data and uploaded images in a formatted tabular view.
- **File Download Route:** Download any uploaded image using `/download/:filename`.

## How to Run
1. Navigate to `q1` folder:
   ```bash
   cd q1
   ```
2. Install dependencies (if not installed):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
4. Open browser at `http://localhost:3001`.
