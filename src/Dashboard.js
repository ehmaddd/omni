import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashNav from './components/DashNav';

function Dashboard() {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const storedUserId = localStorage.getItem('user');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
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
          sessionStorage.setItem('userId', userId);
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate, userId, storedUserId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {token ? (
        <>
          <DashNav />
          <div>
            <h1>Welcome to your Dashboard</h1>
            <p>Your Dashboard User ID: {userId}</p>
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
