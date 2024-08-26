import React from 'react';
import { Link } from 'react-router-dom';
import './FitNav.css'; // Import the CSS file for styling

const FitNav = () => {
  return (
    <nav className="nav-links">
      <ul className="nav-list">
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard/track_sugar">Track Sugar</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard/track_bp">Track BP</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard/track_weight">Track Weight</Link>
        </li>
        {/* Conditionally render the Creatinine link if kidney patient */}
        {/* This can be handled with state or props based on user profile */}
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard/track_creatinine">Track Creatinine</Link>
        </li>
      </ul>
    </nav>
  );
};

export default FitNav;
