import React from 'react';
import { useParams, Link } from 'react-router-dom';

function Dashboard() {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  console.log(token);

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Your User ID: {userId}</p>
      <Link to="/signout">Sign Out</Link>
    </div>
  );
}

export default Dashboard;
