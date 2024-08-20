import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Signout from './Signout';

function Dashboard() {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
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
        <p>Redirecting...</p> // This is optional, just to indicate loading or redirection
      )}
    </div>
  );
}

export default Dashboard;
