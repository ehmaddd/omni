import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Nav = () => {
  return (
    <nav className="navbar">
      <ul className="nav-ul">
        <li>
          <Link to="/quote">Quote</Link>
        </li>
        <li>
          <Link to="/weather">Weather</Link>
        </li>
        <li>
          <Link to="/prayer">Prayer Time</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
