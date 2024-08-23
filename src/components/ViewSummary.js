import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';
import MoodNav from './MoodNav';
import MoodChart from './MoodChart';
import './ViewSummary.css'; // Import the CSS file

function ViewSummary() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          fetchMoodLogs(); // Fetch mood logs
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

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
        setError(error.message);
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
        <p>Error: {error}</p>
      ) : (
        <>
          <div className="nav-bar">
            <h1 className="nav-title">View Summary</h1>
            <MoodNav id={userId} />
          </div>
          <Outlet />
          <MoodChart data={moodLogs} />
        </>
      )}
    </>
  );
}

export default ViewSummary;
