import React, { useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';

function LogMood() {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if no token is present
    if (!token) {
      console.log('No token found, redirecting to login');
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
          <h1>Log Mood</h1>
          <p>Your Log Mood User ID: {userId}</p>
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
