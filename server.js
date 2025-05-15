const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

// Golf status scraping (Cheerio)
app.get('/api/scrape', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.brabantgolf.nl/?p=1275');
    const $ = cheerio.load(data);

    const result = [];

    $('p').each((i, el) => {
      const text = $(el).text();
      if (
        text.includes("Baan") ||
        text.includes("Greens") ||
        text.includes("Driving Range") ||
        text.includes("Qualifying") ||
        text.includes("Putting Green") ||
        text.includes("Clubhuis")
      ) {
        const [label, status] = text.split(':');
        if (label && status) {
          result.push({ label: label.trim(), status: status.trim() });
        }
      }
    });

    res.json(result);
  } catch (err) {
    console.error('❌ Scraping error:', err);
    res.status(500).json({ error: 'Scraping failed.' });
  }
});

// Events scraping with Axios + Cheerio (no Puppeteer)
app.get('/api/events', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.brabantgolf.nl/?p=1275');
    const $ = cheerio.load(data);

    const events = [];

    // Find events container, adjust selector if needed
    $('.em-events-widget li').each((i, el) => {
      const anchor = $(el).find('a').first();
      if (!anchor.length) return;

      const title = anchor.text().trim();

      // Dates might be inside nested <ul><li> elements
      const dates = [];
      $(el).find('ul li').each((j, dateEl) => {
        dates.push($(dateEl).text().trim());
      });

      events.push({ title, dates });
    });

    res.json(events);
  } catch (err) {
    console.error('❌ Events scraping error:', err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});