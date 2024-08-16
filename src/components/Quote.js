import React from 'react';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Quote.css'; // Custom CSS for further styling

const Quote = () => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    // Fetch the quote when the component mounts
    fetch('http://localhost:5000/api/quotes')
      .then((response) => response.json())
      .then((data) => {
        setQuote(data[0].q);
        setAuthor(data[0].a);
      })
      .catch((error) => console.error('Error fetching the quote:', error));
  }, []);

  return (
    <div className="quote-container">
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', backgroundColor: '#f8f9fa' }}>
        <div className="interactive-card text-center shadow-lg p-5">
          <h1 className="card-title mb-4">Quote of the Day</h1>
          {quote ? (
            <blockquote className="blockquote">
              <p className="quote-text mb-4">{quote}</p>
              <footer className="blockquote-footer">
                <cite title="Source Title">{author}</cite>
              </footer>
            </blockquote>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quote;
