import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function Dashboard() {
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
    <div>
      {token ? (
        <div>
          <h1>Welcome to your Dashboard</h1>
          <p>Your User ID: {userId}</p>
          <Link to="/signout">Sign Out</Link>
        </div>
      ) : (
        <p>Redirecting...</p> // This indicates that a redirect is in progress
      )}
    </div>
  );
}

export default Dashboard;
