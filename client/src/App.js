import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch('/api/news')
      .then(response => response.json())
      .then(data => setNews(data))
      .catch(error => console.error('Error fetching news:', error));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>RSS News Feed</h1>
      </header>
      <ul>
        {news.map((item, index) => (
          <li key={index}>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <h2>{item.title}</h2>
              <p>{new Date(item.published).toLocaleString()}</p>
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
