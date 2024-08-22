import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import './LogMood.css';
import DashNav from '../components/DashNav';

function LogMood() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [valence, setValence] = useState(5);
  const [arousal, setArousal] = useState(5);
  const [duration, setDuration] = useState('');
  const [triggers, setTriggers] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  const triggerOptions = [
    'Work',
    'Family',
    'Friends',
    'Health',
    'Finance',
    'Others',
  ];

  const handleTriggerChange = (e) => {
    const value = e.target.value;
    setTriggers(
      triggers.includes(value)
        ? triggers.filter((trigger) => trigger !== value)
        : [...triggers, value]
    );
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
    // Handle form submission (e.g., send to backend)
  };

  useEffect(() => {
    // Redirect if no token is present
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    if (userId !== storedUserId) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
      return;
    }

    // Optionally, verify token validity with your backend
    const verifyToken = async () => {
      try {
        const response = await fetch('http://localhost:5000/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Token validation failed');
        }
        const result = await response.json();
        console.log('Token verification result:', result);
        if (!result.valid) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <>
      {token ? (
        <>
          <DashNav />
          <p>Your Log Mood User ID: {userId}</p>

          <div className="mood-logger-container">
      <h1>Mood Logger</h1>
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
          <div className="trigger-options">
            {triggerOptions.map((trigger) => (
              <label key={trigger} className="checkbox-label">
                <input
                  type="checkbox"
                  value={trigger}
                  onChange={handleTriggerChange}
                  checked={triggers.includes(trigger)}
                />
                {trigger}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="submit-btn">Log Mood</button>
      </form>
    </div>
  );


          <nav>
            <ul>
              <Link to={`/dashboard/${userId}/mood_tracker`}>Back</Link>
              <li><Link to={`/dashboard/${userId}/mood_tracker/viewlog`}>View Logs</Link></li>
              <li><Link to="summary">View Summary</Link></li>
            </ul>
          </nav>
        <Outlet />
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </>
  );
}

export default LogMood;
