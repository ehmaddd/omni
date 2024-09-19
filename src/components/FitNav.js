import React from 'react';
import { Link } from 'react-router-dom';
import './FitNav.css'; // Import the CSS file for styling

const FitNav = (props) => {
  const { id } = props;

  return (
    <nav className="nav-links">
      <ul className="nav-list">
      <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_workout`}>Track Workout</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_sugar`}>Track Sugar</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_bp`}>Track BP</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_weight`}>Track Weight</Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_fever`}>Track Fever</Link>
        </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${id}/fitness_tracker/track_creatinine`}>Track Creatinine</Link>
          </li>
      </ul>
    </nav>
  );
};

export default FitNav;
