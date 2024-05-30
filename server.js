const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());

let clients = [];

wss.on('connection', (ws) => {
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

const fetchAndBroadcastNews = async () => {
  try {
    const response = await axios.get('https://www.globenewswire.com/AtomFeed/orgclass/1/feedTitle/GlobeNewswire%20-%20News%20about%20Public%20Companies');
    const xml = response.data;

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      const feed = result.feed;
      const newsItems = (Array.isArray(feed.entry) ? feed.entry : [feed.entry]).map(item => ({
        ...item,
        title: item.title._,
        published: new Date(item.published).toISOString(),
      }));

      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(newsItems));
        }
      });
    });
  } catch (error) {
    console.error('Error fetching news:', error);
  }
};

// Initial fetch and broadcast
fetchAndBroadcastNews();
// Fetch news and broadcast every minute
setInterval(fetchAndBroadcastNews, 60000);

app.get('/api/news', async (req, res) => {
  try {
    const response = await axios.get('https://www.globenewswire.com/AtomFeed/orgclass/1/feedTitle/GlobeNewswire%20-%20News%20about%20Public%20Companies');
    const xml = response.data;

    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(500).send(err.toString());
      }

      const feed = result.feed;
      const newsItems = (Array.isArray(feed.entry) ? feed.entry : [feed.entry]).map(item => ({
        ...item,
        title: item.title._,
        published: new Date(item.published).toISOString(),
      }));

      res.json(newsItems);
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
