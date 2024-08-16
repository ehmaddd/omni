const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors())

app.get('/api/quotes', (req, res) => {
  const apiUrl = 'https://zenquotes.io/api/random';
  request(apiUrl).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
