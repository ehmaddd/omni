import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashNav from './components/DashNav';

function Dashboard() {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
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
        if (!result.valid) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          // Set userId in session storage
          sessionStorage.setItem('userId', userId);
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    verifyToken();
  }, [token, navigate, userId]);

  return (
    <div>
      {token ? (
        <>
          <DashNav />
          <div>
            <h1>Welcome to your Dashboard</h1>
            <p>Your User ID: {userId}</p>
            <Link to="/signout">Sign Out</Link>
          </div>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}

export default Dashboard;
