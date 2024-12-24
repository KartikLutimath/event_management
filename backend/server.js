const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL library
const app = express();
const dotenv = require('dotenv');
const PORT = 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
dotenv.config(); // Load environment variables from a .env file
// PostgreSQL Database Connection
const pool = new Pool({
  user: process.env.DB_USER, // Replace with your PostgreSQL username
  host: process.env.DB_HOST, // Replace with your PostgreSQL host
  database: process.env.DB_NAME, // Replace with your PostgreSQL database name
  password: process.env.DB_PASSWORD, // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

// Test the database connection
pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the PostgreSQL database:', err);
    process.exit(1); // Exit the process on error
  }
  console.log('Connected to PostgreSQL database!');
});

//homepage
app.get('/', (req, res) => {
  res.send('Welcome to the Event Management API!');
});

// Events Endpoints
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM events');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Error fetching events from database' });
  }
});

app.post('/api/events', async (req, res) => {
  const { name, description, location, date } = req.body;

  if (!name || !description || !location || !date) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO events (name, description, location, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, location, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting event:', err);
    res.status(500).json({ error: 'Error adding event to database' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, location, date } = req.body;

  if (!name || !description || !location || !date) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const result = await pool.query(
      'UPDATE events SET name = $1, description = $2, location = $3, date = $4 WHERE id = $5 RETURNING *',
      [name, description, location, date, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Error updating event in database' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Error deleting event from database' });
  }
});

// Attendees Endpoints
app.post('/api/attendees', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Attendee name is required!' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO attendees (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding attendee:', err);
    res.status(500).json({ error: 'Error adding attendee to database' });
  }
});

app.get('/api/attendees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attendees');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching attendees:', err);
    res.status(500).json({ error: 'Error fetching attendees from database' });
  }
});

app.delete('/api/attendees/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM attendees WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendee not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting attendee:', err);
    res.status(500).json({ error: 'Error deleting attendee from database' });
  }
});

// Tasks Endpoints
app.post('/api/tasks', async (req, res) => {
  const { name, status, deadline, event_id, attendee_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO tasks (name, status, deadline, event_id, attendee_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, status, deadline, event_id, attendee_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ error: 'Error adding task' });
  }
});

app.get('/api/tasks/:event_id', async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM tasks WHERE event_id = $1', [event_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Error fetching tasks for event' });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: 'Error updating task status' });
  }
});

// Assign Attendee to Event
app.post('/api/assign-attendee', async (req, res) => {
  const { attendeeId, eventId } = req.body;

  try {
    await pool.query('INSERT INTO event_attendees (attendee_id, event_id) VALUES ($1, $2)', [
      attendeeId,
      eventId,
    ]);
    res.status(200).json({ message: 'Attendee assigned to event' });
  } catch (err) {
    console.error('Error assigning attendee to event:', err);
    res.status(500).json({ error: 'Error assigning attendee to event' });
  }
});

// Assign Attendee to Task
app.post('/api/assign-attendee-task', async (req, res) => {
  const { attendeeId, taskId } = req.body;

  try {
    await pool.query('INSERT INTO attendee_tasks (attendee_id, task_id) VALUES ($1, $2)', [
      attendeeId,
      taskId,
    ]);
    res.status(200).json({ message: 'Attendee assigned to task' });
  } catch (err) {
    console.error('Error assigning attendee to task:', err);
    res.status(500).json({ error: 'Error assigning attendee to task' });
  }
});

// Authentication Endpoints
app.post('/api/signup', async (req, res) => {
  const { username, password, security_question } = req.body;

  try {
    await pool.query(
      'INSERT INTO users (username, password, security_question) VALUES ($1, $2, $3)',
      [username, password, security_question]
    );
    res.status(200).json({ message: 'User signed up successfully' });
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).json({ message: 'Error signing up' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/forgot', async (req, res) => {
  const { username, security_answer, new_password } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE username = $2 AND security_question = $3 RETURNING *',
      [new_password, username, security_answer]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found or incorrect security answer' });
    }
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});