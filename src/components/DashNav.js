import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const DashNav = () => {
  return (
    <nav className="navbar">
      <ul className="nav-ul">
        <li>
          <Link to="/">Mood Tracker</Link>
        </li>
        <li>
          <Link to="/quote">Fitness Section</Link>
        </li>
        <li>
          <Link to="/weather">ToDo List</Link>
        </li>
      </ul>
    </nav>
  );
};

export default DashNav;