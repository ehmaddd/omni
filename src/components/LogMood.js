import React, { useState } from 'react';
import { useParams, Link, Outlet } from 'react-router-dom';
import DashNav from './DashNav';
import MoodNav from './MoodNav';
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
      <div className="nav-bar">
        <h1 className="nav-title">Mood Logger</h1>
        <MoodNav id={userId} />
        <Outlet />
      </div>

      <div className="mood-logger-container">
        <form onSubmit={handleSubmit} className="mood-logger-form">
          <table className="mood-logger-table">
            <tbody>
              <tr>
                <td className="form-group">
                  <label>Valence Level
                    <br />
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
                </td>
              </tr>
              <tr>
                <td className="form-group">
                  <label>Arousal Level
                    <br />
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
                </td>
              </tr>
              <tr>
                <td className="form-group">
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
                </td>
              </tr>
              <tr>
                <td className="form-group">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className="form-group">
                  <label>Time:</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <td className="form-group">
                  <label>Contextual Trigger:</label>
                  <select
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value)}
                    className="trigger-dropdown"
                  >
                    {triggerOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td>
                  <button type="submit" className="submit-btn">Log Mood</button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </>
  );
}

export default LogMood;
