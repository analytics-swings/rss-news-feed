const express = require('express');
const RSSParser = require('rss-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
const parser = new RSSParser();

app.use(cors());

app.get('/api/news', async (req, res) => {
  try {
    const feed = await parser.parseURL('https://www.globenewswire.com/AtomFeed/orgclass/1/feedTitle/GlobeNewswire%20-%20News%20about%20Public%20Companies');
    const newsItems = feed.entries.map(item => ({
      title: item.title,
      published: item.published,
      updated: item.updated,
      link: item.link,
      content: item.content
    }));
    res.json(newsItems);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
