# Question 6: Free API Integration Hub (Frontend & Backend)

## Description
A full stack web application demonstrating calling free public APIs from both the **Backend** (Express server proxy using `axios`) and the **Frontend** (React client `fetch()`).

## Features & Free APIs Used
1. **Live Weather Forecast Utility (Backend):**
   - API: [Open-Meteo API](https://open-meteo.com)
   - Route: `/api/weather?lat=...&lon=...`
2. **Currency Exchange Converter (Backend):**
   - API: [Open ER-API](https://open.er-api.com)
   - Route: `/api/currency?base=USD`
3. **Daily Advice Generator (Backend):**
   - API: [AdviceSlip API](https://api.adviceslip.com)
   - Route: `/api/advice`
4. **Programmer Joke Generator (Direct Frontend):**
   - API: [Official Joke API](https://official-joke-api.appspot.com/random_joke)
   - Called directly from React in browser.

## How to Run
1. Navigate to `q6` directory:
   ```bash
   cd q6
   ```
2. Start server:
   ```bash
   node server.js
   ```
3. Open `http://localhost:3006`.
