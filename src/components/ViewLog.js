import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';
import MoodNav from './MoodNav';
import './ViewLog.css'; // Import the CSS file

function ViewLog() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

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
        } else {
          fetchMoodLogs(); // Fetch mood logs if token is valid
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    // Fetch mood logs from backend
    const fetchMoodLogs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/mood-logs?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error fetching mood logs');
        }

        const data = await response.json();
        setMoodLogs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mood logs:', error);
        setError(error.message); // Set error message
        setLoading(false);
      }
    };

    verifyToken();

  }, [token, navigate, userId, storedUserId]);

  return (
    <>
      <DashNav />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p> // Display error message
      ) : (
        <>
          <div className="nav-bar">
            <h1 className="nav-title">View Log</h1>
            <MoodNav id={userId} />
          </div>
          <Outlet />
          <div className="mood-logs-container">
            {moodLogs.length > 0 ? (
              <ul>
                {moodLogs.map((log, index) => (
                  <li key={index}>
                    <strong>Date:</strong> {log.date}<br />
                    <strong>Time:</strong> {log.time}<br />
                    <strong>Valence:</strong> {log.valence}<br />
                    <strong>Arousal:</strong> {log.arousal}<br />
                    <strong>Duration:</strong> {log.duration} minutes<br />
                    <strong>Trigger:</strong> {log.triggers}<br />
                    <hr />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No mood logs found</p>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default ViewLog;
