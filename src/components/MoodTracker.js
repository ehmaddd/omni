import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';
import MoodNav from '../components/MoodNav';
import MoodGrid from '../components/MoodGrid';
import './Nav.css'; // Ensure to import the CSS file

function MoodTracker() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [moodData, setMoodData] = useState([]);

  const fetchMoodData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/fetch_mood_data?userId=${userId}&year=${year}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch mood data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching mood data:', error);
      throw error;
    }
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

    const loadData = async () => {
      try {
        const data = await fetchMoodData();
        setMoodData(data);
      } catch (error) {
        console.error('Error loading mood data:', error);
      }
    };

    verifyToken();
    loadData();
  }, [token, navigate, userId, storedUserId]);

  return (
    <>
      {token ? (
        <>
          <DashNav />
          <div className="nav-bar">
            <h1 className="nav-title">Mood Tracker</h1>
            <MoodNav id={userId} />
          </div>
          <MoodGrid data={moodData} />
          <Outlet />
          <p>Your Mood Track User ID: {userId}</p>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </>
  );
}

export default MoodTracker;
