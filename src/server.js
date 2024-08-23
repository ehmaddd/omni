const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const request = require('request');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const PORT = 5000;

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

app.post('/verify-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ valid: false });
  }
  
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ valid: false });
    }
    // Optionally, check if the user is still active or has other validations
    res.json({ valid: true });
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO login (username, password) VALUES ($1, $2)',
      [username, hashedPassword]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM login WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ username, userId: user.id }, 'secret', { expiresIn: '1h' });
    res.json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.get('/protected', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.json({ message: `Hello, ${decoded.username}` });
  });
});

app.get('/api/quotes', (req, res) => {
  const apiUrl = 'https://zenquotes.io/api/random';
  request(apiUrl).pipe(res);
});

// Store Mood Record
app.post('/log-mood', async (req, res) => {
  const { userId, valence, arousal, duration, date, time, trigger } = req.body;
  
  if (!userId || valence === undefined || arousal === undefined || duration === undefined || !date || !time || !trigger) {
      return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
      await pool.query(
          `INSERT INTO mood_logs (user_id, valence, arousal, duration, date, time, triggers)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, valence, arousal, duration, date, time, trigger]
      );
      res.status(201).json({ message: 'Mood log added successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error saving mood log' });
  }
});

// Fetch a specific mood log by its ID
app.get('/mood-logs', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM mood_logs WHERE user_id = $1 ORDER BY date DESC, time DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching mood logs:', err);
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});

// Update a mood log
app.put('/mood-logs/:id', async (req, res) => {
  const { id } = req.params;
  const { valence, arousal, duration, date, time, trigger } = req.body;

  if (valence === undefined || arousal === undefined || duration === undefined || !date || !time || !trigger) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `UPDATE mood_logs
       SET valence = $1, arousal = $2, duration = $3, date = $4, time = $5, triggers = $6
       WHERE id = $7`,
      [valence, arousal, duration, date, time, trigger, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Mood log not found' });
    }
    
    res.json({ message: 'Mood log updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating mood log' });
  }
});

// Delete a mood log
app.delete('/mood-logs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM mood_logs WHERE id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Mood log not found' });
    }
    
    res.json({ message: 'Mood log deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting mood log' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
