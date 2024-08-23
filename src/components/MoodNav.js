import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MoodNav.css';

const MoodNav = (props) => {

  const { id } = props;


  return (
      <nav className="nav-links">
        <ul className="nav-list">
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${id}/mood_tracker/log`}>Log Mood</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${id}/mood_tracker/viewlog`}>View Logs</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to={`/dashboard/${id}/mood_tracker/summary`}>View Summary</Link>
          </li>
        </ul>
      </nav>
  );
};

export default MoodNav;





