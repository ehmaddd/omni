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