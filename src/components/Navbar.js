import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Nav = () => {
  return (
    <nav className="navbar">
      <ul className="nav-ul">
        <li>
          <Link to="/">Calculator</Link>
        </li>
        <li>
          <Link to="/quote">Quote</Link>
        </li>
        <li>
          <Link to="/weather">Weather</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
