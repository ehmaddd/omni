import React, { useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';
import './Nav.css';

function MoodTracker() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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
          <nav className="nav-bar">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="log" className="nav-link">Log Mood</Link>
              </li>
              <li className="nav-item">
                <Link to="viewlog" className="nav-link">View Logs</Link>
              </li>
              <li className="nav-item">
                <Link to="summary" className="nav-link">View Summary</Link>
              </li>
            </ul>
          </nav>
          <Outlet />
          <h1>Mood Tracker</h1>
          <p>Your Mood Track User ID: {userId}</p>
          <Link to="/signout">Sign Out</Link>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </>
  );
}

export default MoodTracker;
