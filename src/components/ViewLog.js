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
        // Sort logs to show the most recent ones first
        data.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
        setMoodLogs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mood logs:', error);
        setError(error.message); // Set error message
        setLoading(false);
      }
    };

    // Delete a mood log
    const deleteMoodLog = async (logId) => {
      try {
        const response = await fetch(`http://localhost:5000/mood-logs/${logId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error deleting mood log');
        }

        // Remove deleted log from the state
        setMoodLogs(moodLogs.filter(log => log.id !== logId));
      } catch (error) {
        console.error('Error deleting mood log:', error);
        setError(error.message); // Set error message
      }
    };

    verifyToken();
  }, [token, navigate, userId, storedUserId, moodLogs]);

  // Function to format the date into a short form
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

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
              <table className="mood-logs-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Date</th>
                    <th>Valence</th>
                    <th>Arousal</th>
                    <th>Duration</th>
                    <th>Trigger</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {moodLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.time}</td>
                      <td>{formatDate(log.date)}</td>
                      <td>{log.valence}</td>
                      <td>{log.arousal}</td>
                      <td>{log.duration} minutes</td>
                      <td>{log.triggers}</td>
                      <td>
                        <button 
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
