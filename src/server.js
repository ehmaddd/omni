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


//   MOOD START --------------------------------


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
  const { userId, startDate, endDate } = req.query;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    let query = 'SELECT * FROM mood_logs WHERE user_id = $1';
    const queryParams = [userId];

    if (startDate && endDate) {
      query += ' AND date BETWEEN $2 AND $3';
      queryParams.push(startDate, endDate);
    } else if (startDate) {
      query += ' AND date >= $2';
      queryParams.push(startDate);
    } else if (endDate) {
      query += ' AND date <= $2';
      queryParams.push(endDate);
    }

    query += ' ORDER BY date DESC, time DESC';

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching mood logs:', err);
    res.status(500).json({ message: 'Error fetching mood logs' });
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

// MOOD END ---------------------------------------

// Define a new route for storing health data
app.post('/create_profile', async (req, res) => {
  const {
    user_id,
    age,
    height,
    weight,
    blood_group,
    eye_sight_left,
    eye_sight_right,
    disability,
    heart_problem,
    diabetes,
    kidney_issue
  } = req.body;

  async function createOrUpdateProfile(profileData) {
    // Assuming you save profile data to the database
    const { user_id, age, height, weight, blood_group, eye_sight_left, eye_sight_right, disability, heart_problem, diabetes, kidney_issue } = profileData;
    
    // Example logic: update the profile if it exists or create a new one
    const result = await pool.query(
      `INSERT INTO health_profile (user_id, age, height, weight, blood_group, eye_sight_left, eye_sight_right, disability, heart_problem, diabetes, kidney_issue)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [user_id, age, height, weight, blood_group, eye_sight_left, eye_sight_right, disability, heart_problem, diabetes, kidney_issue]
  );
  return result;
}

  // Validate required fields
  if (!user_id || !age || !height || !weight || !blood_group || !eye_sight_left || !eye_sight_right) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Process the profile creation or update here
    // Example: Save to database or perform business logic
    // Assuming you have a function `createOrUpdateProfile`
    await createOrUpdateProfile({
      user_id,
      age,
      height,
      weight,
      blood_group,
      eye_sight_left,
      eye_sight_right,
      disability,
      heart_problem,
      diabetes,
      kidney_issue
    });

    res.status(200).json({ message: 'Profile created or updated successfully' });
  } catch (error) {
    console.error('Error saving health data:', error);
    res.status(500).json({ message: 'Error saving health data' });
  }
});

// Record Sugar Levels
app.get('/health_profile/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM health_profile WHERE user_id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Health log not found' });
    }
    
    // Sending the fetched data back to the frontend
    res.json({
      message: 'Health log fetched successfully',
      data: result.rows, // Including the fetched data in the response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching health log' }); // Correcting the error message
  }
});

app.post('/record_sugar', async (req, res) => {
  const { user_id, date, time, type, sugar_level } = req.body;

  if (!user_id || !date || !time || !type || sugar_level === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await pool.query(
      `INSERT INTO sugar_levels (user_id, date, time, type, sugar_level)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, date, time, type, sugar_level]
    );
    res.status(201).json({ message: 'Sugar level recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error recording sugar level' });
  }
});

// Fetch Sugar Levels
app.get('/sugar_levels/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    let query = 'SELECT * FROM sugar_levels WHERE user_id = $1';
    const queryParams = [userId];
    query += ' ORDER BY date DESC, time DESC';

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sugar levels:', err);
    res.status(500).json({ message: 'Error fetching sugar levels' });
  }
});

app.get('/bp_levels/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM bp_levels WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blood pressure data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to record a new blood pressure entry
app.post('/record_bp', async (req, res) => {
  const { user_id, date, time, systolic, diastolic } = req.body;

  if (!user_id || !date || !time || !systolic || !diastolic) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO bp_levels (user_id, date, time, systolic, diastolic) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, date, time, systolic, diastolic]
    );
    res.status(201).json({ message: 'Blood pressure entry recorded successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error recording blood pressure data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
