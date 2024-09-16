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
          <Link to={`/dashboard/${userId}/mood_tracker`}>Mood</Link>
        </li>
        <li>
          <Link to={`/dashboard/${userId}/fitness_tracker`}>Fitness</Link>
        </li>
        <li>
          <Link to={`/dashboard/${userId}/todo`}>ToDoList</Link>
        </li>
        <li>
          <Link to={`/dashboard/${userId}/budget`}>Budget</Link>
        </li>
        <li>
        <Link to={`/dashboard/${userId}/events`}>Events</Link>
        </li>
        <li>
          <Link to="/signout" class="signout-button">Sign Out</Link>
        </li>
      </ul>
    </nav>
  );
};

export default DashNav;
