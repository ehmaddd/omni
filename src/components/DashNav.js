import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const DashNav = () => {
  const userId = sessionStorage.getItem('userId');
  const navigate = useNavigate();

  if (!userId) {
    navigate('/login'); // Optionally handle cases where userId is not set
    return null;
  }

  return (
    <nav className="navbar">
      <ul className="nav-ul">
        <li>
          <Link to={`/dashboard/${userId}`}>Dashboard</Link>
        </li>
        <li>
          <Link to={`/dashboard/${userId}/mood_tracker`}>Mood Tracker</Link>
        </li>
        <li>
          <Link to={`/dashboard/${userId}/fitness`}>Fitness Section</Link>
        </li>
        <li>
          <Link to={`/dashboard/${userId}/weather`}>ToDo List</Link>
        </li>
      </ul>
    </nav>
  );
};

export default DashNav;
