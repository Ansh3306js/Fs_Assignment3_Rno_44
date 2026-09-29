const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Backend API Call 1: Open-Meteo Weather API Proxy
app.get('/api/weather', async (req, res) => {
  try {
    const lat = req.query.lat || '28.6139'; // Default New Delhi
    const lon = req.query.lon || '77.2090';

    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    res.json({
      success: true,
      source: 'Backend API Call to Open-Meteo',
      data: response.data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch weather from external API' });
  }
});

// Backend API Call 2: Exchange Rate API Proxy
app.get('/api/currency', async (req, res) => {
  try {
    const base = req.query.base || 'USD';
    const response = await axios.get(`https://open.er-api.com/v6/latest/${base}`);
    res.json({
      success: true,
      source: 'Backend API Call to ER-API',
      rates: response.data.rates,
      last_updated: response.data.time_last_update_utc
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch currency rates' });
  }
});

// Backend API Call 3: Advice/Quotes API Proxy
app.get('/api/advice', async (req, res) => {
  try {
    const response = await axios.get('https://api.adviceslip.com/advice');
    res.json({
      success: true,
      source: 'Backend API Call to AdviceSlip API',
      advice: response.data.slip.advice
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch advice quote' });
  }
});

// Fallback to React Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Q6 Free Utility API Hub running on http://localhost:${PORT}`);
});
