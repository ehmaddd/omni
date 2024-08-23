import React, { useState } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import DashNav from './DashNav';
import './LogMood.css';

function LogMood() {
  const [valence, setValence] = useState(0);
  const [arousal, setArousal] = useState(0);
  const [duration, setDuration] = useState('');
  const [trigger, setTrigger] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');

  const triggerOptions = [
    'Work',
    'Family',
    'Friends',
    'Health',
    'Finance',
    'Others',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const moodLog = {
      valence,
      arousal,
      duration,
      date,
      time,
      trigger,
    };
    console.log('Mood Log:', moodLog);
    // Handle form submission (e.g., send to backend)
  };

  return (
    <>
      <DashNav />
      <nav className="nav-bar">
        <ul className="nav-list">
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${userId}/mood_tracker`}>Back</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${userId}/mood_tracker/viewlog`}>View Logs</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${userId}/mood_tracker/summary`}>View Summary</Link>
          </li>
        </ul>
        <Outlet />
      </nav>

      <div className="mood-logger-container">
        <h1>Mood Logger</h1>
        <form onSubmit={handleSubmit} className="mood-logger-form">
          <div className="form-group">
            <label>Valence Level
              <br/>
              <span style={{ color: 'grey' }}>(Positivity/Negativity)</span>
            </label>
            <input
              type="range"
              min="-10"
              max="10"
              value={valence}
              onChange={(e) => setValence(e.target.value)}
              className="slider"
            />
            <span className="value-display">{valence}</span> {/* Display valence */}
          </div>

          <div className="form-group">
            <label>Arousal Level
              <br/>
              <span style={{ color: 'grey' }}>(Intensity)</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={arousal}
              onChange={(e) => setArousal(e.target.value)}
              className="slider"
            />
            <span className="value-display">{arousal}</span> {/* Display arousal */}
          </div>

          <div className="form-group">
            <label>Estimated Duration (minutes):</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration in minutes"
              min="0"
              max="60"
              step="1"
            />
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Time:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Contextual Triggers:</label>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="trigger-dropdown"
            >
              {triggerOptions.map((trigger) => (
                <option key={trigger} value={trigger}>
                  {trigger}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn">Log Mood</button>
        </form>
      </div>
    </>
  );
}

export default LogMood;
