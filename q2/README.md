# Question 2: Express Login Application with File Session Store

## Description
An Express.js authentication application using `express-session` backed by `session-file-store` to save session data to local files.

## Features
- **Login:** Form authentication with sample credentials.
- **File Session Store:** Sessions stored in `./sessions/` directory on disk.
- **Protected Routes:**
  1. `/dashboard` - Access restricted to logged-in users.
  2. `/profile` - Access restricted to logged-in users.
- **Logout:** Destroys session file and clears session cookies.

## How to Run
1. Navigate to `q2` directory:
   ```bash
   cd q2
   ```
2. Start the app:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3002`.
4. Login with:
   - **Username:** `student`
   - **Password:** `password123`
