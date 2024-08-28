import React from 'react';
import { Link } from 'react-router-dom';
import './FitNav.css'; // Import the CSS file for styling

const FitNav = (props) => {
  const { id } = props;
  const isKidneyPatient = JSON.parse(localStorage.getItem('isKidneyPatient'));

  return (
    <nav className="nav-links">
      <ul className="nav-list">
        <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_sugar`}>Track Sugar</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_bp`}>Track BP</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_weight`}>Track Weight</Link>
        </li>
        {isKidneyPatient && (
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_creatinine`}>Track Creatinine</Link>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default FitNav;
