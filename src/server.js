const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const request = require('request');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { toHaveFormValues } = require('@testing-library/jest-dom/matchers');
const PORT = 5000;

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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

// Fetch a specific mood log by its ID
app.get('/fetch_mood_data', async (req, res) => {
  const { userId, year } = req.query;

  if (!userId || !year) {
    return res.status(400).json({ message: 'User ID and year are required' });
  }

  try {
    // Convert year to integer and ensure it's valid
    const yearInt = parseInt(year, 10);
    if (isNaN(yearInt) || yearInt < 1900 || yearInt > new Date().getFullYear()) {
      return res.status(400).json({ message: 'Invalid year provided' });
    }

    // Construct the date range for the specified year
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    // Prepare SQL query
    let query = 'SELECT * FROM mood_logs WHERE user_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date DESC, time DESC';
    const queryParams = [userId, startDate, endDate];

    // Execute query
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching mood logs:', err);
    res.status(500).json({ message: 'Error fetching mood logs' });
  }
});


// MOOD END ---------------------------------------

// Define a new route for storing health data
app.post('/create_profile', async (req, res) => {
  const {
    user_id,
    dob,
    gender,
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
    const { user_id, dob, gender, height, weight, blood_group, eye_sight_left, eye_sight_right, disability, heart_problem, diabetes, kidney_issue } = profileData;
    
    // Example logic: update the profile if it exists or create a new one
    const result = await pool.query(
      `INSERT INTO health_profile (user_id, dob, gender, height, weight, blood_group, eye_sight_left, eye_sight_right, disability, heart_problem, diabetes, kidney_issue)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [user_id, dob, gender, height, weight, blood_group, eye_sight_left, eye_sight_right, disability, heart_problem, diabetes, kidney_issue]
  );
  return result;
}

  // Validate required fields
  if (!user_id || !dob || !height || !weight || !blood_group || !eye_sight_left || !eye_sight_right) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Process the profile creation or update here
    // Example: Save to database or perform business logic
    // Assuming you have a function `createOrUpdateProfile`
    await createOrUpdateProfile({
      user_id,
      dob,
      gender,
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

app.get('/fetch_specific_health/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT gender, height, weight FROM health_profile WHERE user_id = $1',
      [userId]
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


app.get('/weight/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      'SELECT date, time, weight FROM weights WHERE user_id = $1 ORDER BY date, time',
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching weight data:', err);
    res.status(500).send('Server error');
  }
});

app.post('/record_weight', async (req, res) => {
  const { user_id, date, time, weight } = req.body;

  try {
    await pool.query('BEGIN');

    await pool.query(
      'INSERT INTO weights (user_id, date, time, weight) VALUES ($1, $2, $3, $4)',
      [user_id, date, time, weight]
    );
    await pool.query(
      'UPDATE health_profile SET weight=$2 WHERE user_id=$1',
      [user_id, weight]
    );

    await pool.query('COMMIT');

    res.status(200).send('Weight recorded successfully');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error recording weight:', err);
    res.status(500).send('Server error');
  }
});

app.get('/fetch_fevers/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
      const result = await pool.query('SELECT * FROM fever_records WHERE user_id = $1', [userId]);
      res.json(result.rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

app.post('/record_fever', async (req, res) => {
  try {
      const { user_id, date, time, temperature } = req.body;

      // SQL query to insert data into the fever_records table
      const result = await pool.query(
          'INSERT INTO fever_records (user_id, date, time, temperature) VALUES ($1, $2, $3, $4) RETURNING *',
          [user_id, date, time, temperature]
      );

      res.json(result.rows[0]);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
  }
});

app.get('/fetch_creatinine/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Query to fetch the creatinine record by ID
    const result = await pool.query(
      'SELECT * FROM creatinine_records WHERE user_id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Creatinine record not found' });
    }
    
    res.json({
      message: 'Creatinine record fetched successfully',
      data: result.rows,
    });
  } catch (err) {
    console.error('Error fetching creatinine record:', err);
    res.status(500).json({ message: 'Error fetching creatinine record' });
  }
});

app.post('/record_creatinine', async (req, res) => {
  const { user_id, date, time, creatinine_level } = req.body;

  // Validate required fields
  if (!user_id || !date || !time || creatinine_level === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Query to insert a new creatinine record
    await pool.query(
      `INSERT INTO creatinine_records (user_id, date, time, creatinine_level)
       VALUES ($1, $2, $3, $4)`,
      [user_id, date, time, creatinine_level]
    );
    
    res.status(201).json({ message: 'Creatinine level recorded successfully' });
  } catch (err) {
    console.error('Error recording creatinine level:', err);
    res.status(500).json({ message: 'Error recording creatinine level' });
  }
});

// WORKOUT START ----------------------------

// Store Workout Record
app.post('/store_workout', async (req, res) => {
  const { user_id, date, time, duration, category, cburned } = req.body;

  // Validate required fields
  if (!user_id || !date || !time || !duration || !category || cburned === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if a workout record with the same user_id, date, and time already exists
    const existingRecord = await pool.query(
      'SELECT * FROM workouts WHERE user_id = $1 AND date = $2 AND time = $3',
      [user_id, date, time]
    );

    if (existingRecord.rowCount > 0) {
      // If a record already exists, respond with a message
      return res.status(409).json({ message: 'Workout record already exists for this date and time' });
    }

    // Insert the new workout record into the database
    await pool.query(
      'INSERT INTO workouts (user_id, date, time, duration, type, calories) VALUES ($1, $2, $3, $4, $5, $6)',
      [user_id, date, time, duration, category, cburned]
    );
    res.status(201).json({ message: 'Workout recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error recording workout' });
  }
});

// Fetch Workout Logs
app.get('/fetch_workout/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, type, date::timestamptz AT TIME ZONE \'UTC\' AT TIME ZONE \'your_time_zone\' as date, time, duration, calories, user_id FROM workouts WHERE userId = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching workout logs' });
  }
});

app.get('/fetch_todos/:userId', async (req, res) => {
  const { userId } = req.params;
  const { date } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 AND date = $2 ORDER BY date DESC',
      [userId, date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching workout logs' });
  }
});

app.post('/complete_task/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const status = 'complete';
  try {
    const result = await pool.query(
      'UPDATE todos SET status=$1 WHERE id=$2',
      [status, taskId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating' });
  }
});

app.delete('/delete_task/:taskId', async (req, res) => {
  const { taskId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM todos WHERE id=$1',
      [taskId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting' });
  }
});

app.post('/store_task/', async (req, res) => {
  const { user_id, date, priority, task } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO todos (user_id, task, priority, date) VALUES($1, $2, $3, $4)',
      [user_id, task, priority, date]
    )
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error storing' });
  }

});

app.post('/shift_task/', async (req, res) => {
  const { id, date } = req.body;
  try {
    const result = await pool.query(
      'UPDATE todos SET date=$2 WHERE id=$1',
      [id, date]
    )
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error storing' });
  }
});

app.post('/store_income', async (req, res) => {
  const { userId, year, month, amount } = req.body;
  if (!userId || !year || !month || isNaN(amount)) {
      return res.status(400).json({ error: 'Missing required fields or invalid data' });
  }

  try {
      const client = await pool.connect();
      try {
          // Check if an expense with the same date and category already exists
          const result = await client.query(
              `SELECT * FROM income_record WHERE user_id = $1 AND year = $2 AND month = $3`,
              [userId, year, month]
          );

          if (result.rows.length > 0) {
              // Update existing expense
              await client.query(
                  `UPDATE income_record
                   SET amount = amount + $1
                   WHERE user_id = $2 AND year = $3 AND month = $4`,
                  [amount, userId, year, month]
              );
          } else {
              // Insert new expense
              await client.query(
                  `INSERT INTO income_record (user_id, year, month, amount)
                   VALUES ($1, $2, $3, $4)`,
                  [userId, year, month, amount]
              );
          }

          res.status(201).json({ message: 'Income added/updated successfully' });
      } finally {
          client.release();
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
  }
});

app.get('/expenses/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const result = await pool.query(
      `SELECT date + INTERVAL '1 day' AS date, category, amount, description
       FROM daily_expenses
       WHERE user_id = $1 AND EXTRACT(YEAR FROM date) = $2 AND EXTRACT(MONTH FROM date) = $3
       ORDER BY date ASC`,
      [userId, year, month]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.post('/store_expenses', async (req, res) => {
  const { user_id, date, category, amount, description } = req.body;
  if (!user_id || !date || !category || isNaN(amount)) {
      return res.status(400).json({ error: 'Missing required fields or invalid data' });
  }

  try {
      const client = await pool.connect();
      try {
          // Check if an expense with the same date and category already exists
          const result = await client.query(
              `SELECT * FROM daily_expenses WHERE user_id = $1 AND date = $2 AND category = $3`,
              [user_id, date, category]
          );

          if (result.rows.length > 0) {
              // Update existing expense
              await client.query(
                  `UPDATE daily_expenses
                   SET amount = amount + $1, description = COALESCE($2, description)
                   WHERE user_id = $3 AND date = $4 AND category = $5`,
                  [amount, description, user_id, date, category]
              );
          } else {
              // Insert new expense
              await client.query(
                  `INSERT INTO daily_expenses (user_id, date, category, amount, description)
                   VALUES ($1, $2, $3, $4, $5)`,
                  [user_id, date, category, amount, description]
              );
          }

          res.status(201).json({ message: 'Expense added/updated successfully' });
      } finally {
          client.release();
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
  }
});

app.get('/fetch_income/:userId/:year/:month', async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    const result = await pool.query(
      `SELECT amount FROM income_record 
       WHERE user_id = $1 AND year=$2 AND month=$3`,
      [userId, year, month]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching income' });
  }
});

app.get('/fetch_events/:userId', async (req, res) => {
  const { userId } = req.params;
  const { start_date, end_date } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 
         AND datetime BETWEEN $2 AND $3
       ORDER BY datetime ASC`,
      [userId, start_date, end_date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

app.post('/store_event', async (req, res) => {
  const { id, name, type, date_time, recurrence, location, notes } = req.body;
  if (!id || !name || !type || !date_time|| !recurrence || !location) {
      return res.status(400).json({ error: 'Missing required fields or invalid data' });
  }

  try {
      const client = await pool.connect();
      try {
          // Check if an event with the same date and category already exists
          const result = await client.query(
              `SELECT * FROM events WHERE user_id = $1 AND name = $2 AND datetime = $3`,
              [id, name, date_time]
          );

          if (result.rows.length > 0) {
              res.status(500).json({ message: 'Event already exist' });
          } else {
              // Insert new expense
              await client.query(
                  `INSERT INTO events (user_id, name, type, datetime, recurrence, location, notes)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                  [id, name, type, date_time, recurrence, location, notes]
              );
              res.status(201).json({ message: 'Event added successfully' });
          }
      } finally {
          client.release();
      }
  } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
  }
});

app.get('/fetch_events/:userId', async (req, res) => {
  const { userId } = req.params;
  const { start_date, end_date } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE user_id = $1 
         AND datetime BETWEEN $2 AND $3
       ORDER BY datetime ASC`,
      [userId, start_date, end_date]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
