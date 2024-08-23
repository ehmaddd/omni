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
  const [filteredMoodLogs, setFilteredMoodLogs] = useState([]); // New state for filtered logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for date range filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State for counter input
  const [recordCount, setRecordCount] = useState(10);

  useEffect(() => {
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
          fetchMoodLogs(); // Fetch all mood logs initially
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    verifyToken();
  }, [token, navigate, userId, storedUserId]);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

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

      // Refresh the mood logs list or handle success
      fetchMoodLogs(); // Call the function to refresh logs
    } catch (error) {
      console.error('Error deleting mood log:', error);
    }
  };

  // Function to fetch mood logs with optional date range filtering
  const fetchMoodLogs = async (startDate = '', endDate = '', limit = 10) => {
    try {
      let url = `http://localhost:5000/mood-logs?userId=${userId}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      url += `&limit=${parseInt(limit, 10)}`; // Ensure limit is an integer

      console.log('Fetching mood logs with URL:', url); // Log the URL being fetched

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching mood logs');
      }

      const data = await response.json();
      console.log('Fetched data:', data); // Log the fetched data
      data.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
      setMoodLogs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mood logs:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Function to handle the date range filter
  const handleFilter = () => {
    fetchMoodLogs(startDate, endDate, recordCount);
  };

  // Function to handle showing a specific number of records
  const handleShowRecords = () => {
    const limitedLogs = moodLogs.slice(0, recordCount); // Limit the mood logs based on recordCount
    setFilteredMoodLogs(limitedLogs);
  };

  useEffect(() => {
    // Update filtered logs when moodLogs or recordCount changes
    handleShowRecords();
  }, [moodLogs, recordCount]);

  return (
    <>
      <DashNav />
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <div className="nav-bar">
            <h1 className="nav-title">View Log</h1>
            <MoodNav id={userId} />
          </div>
          <Outlet />
          <div className="filter-container">
            <div className="filter-left">
              <label htmlFor="startDate">From:</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label htmlFor="endDate">To:</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button onClick={handleFilter}>Filter</button>
            </div>
            <div className="filter-right">
              <label htmlFor="recordCount">Show:</label>
              <input
                id="recordCount"
                type="number"
                min="1"
                value={recordCount}
                onChange={(e) => setRecordCount(e.target.value)}
              />
            </div>
          </div>
          <div className="mood-logs-container">
            {filteredMoodLogs.length > 0 ? (
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
                  {filteredMoodLogs.map((log) => (
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
                          onClick={() => deleteMoodLog(log.id)}
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
