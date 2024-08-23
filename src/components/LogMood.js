import React, { useState } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import DashNav from './DashNav';
import './LogMood.css';

function LogMood() {
  const [valence, setValence] = useState(5);
  const [arousal, setArousal] = useState(5);
  const [duration, setDuration] = useState('');
  const [triggers, setTriggers] = useState([]);
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

  const handleTriggerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setTriggers(selectedOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const moodLog = {
      valence,
      arousal,
      duration,
      date,
      time,
      triggers,
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
      <p>Your User ID in Log Mood is : {userId}</p>
      <form onSubmit={handleSubmit} className="mood-logger-form">
        <div className="form-group">
          <label>Valence Level: {valence}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={valence}
            onChange={(e) => setValence(e.target.value)}
            className="slider"
          />
        </div>

        <div className="form-group">
          <label>Arousal Level: {arousal}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={arousal}
            onChange={(e) => setArousal(e.target.value)}
            className="slider"
          />
        </div>

        <div className="form-group">
          <label>Estimated Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration in minutes"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Contextual Triggers</label>
          <select
            multiple
            value={triggers}
            onChange={handleTriggerChange}
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
