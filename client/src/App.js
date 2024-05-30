import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();

    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const newNews = JSON.parse(event.data);
      setNews(newNews);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => ws.close();
  }, []);

  const renderContent = (content) => {
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    } else if (content._) {
      return <div dangerouslySetInnerHTML={{ __html: content._ }} />;
    } else {
      return <div>Content not available</div>;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>RSS News Feed</h1>
      </header>
      <ul>
        {news.map((item, index) => (
          <li key={index}>
            <h2>{item.title}</h2>
            <p><strong>Published:</strong> {new Date(item.published).toLocaleString()}</p>
            {renderContent(item.content)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
