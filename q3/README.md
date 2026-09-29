# Question 3: Express Login Application with Redis Session Store

## Description
An Express.js web application demonstrating session management backed by Redis (`connect-redis`).

## Features
- **Redis Session Store:** Uses `connect-redis` with Redis client (with automatic fallback to mock Redis engine if local Redis server is not running).
- **Authentication:** Form-based login and logout.
- **Protected Routes:**
  1. `/dashboard` - Access restricted to authenticated users.
  2. `/reports` - Access restricted to authenticated users.
- **Logout:** Clears session and cookies cleanly.

## How to Run
1. Navigate to `q3` directory:
   ```bash
   cd q3
   ```
2. Start the server:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3003`.
4. Login credentials:
   - **Username:** `admin`
   - **Password:** `redispassword`
