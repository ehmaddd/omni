import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'; // Import social media icons from react-icons
import './FloatingSocialMenu.css'; // Import the CSS file for styling

const FloatingSocialMenu = () => {
  return (
    <div className="floating-social-media-menu">
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-button facebook">
        <FaFacebook />
        <span className="tooltip">Facebook</span>
      </a>
      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-button twitter">
        <FaTwitter />
        <span className="tooltip">Twitter</span>
      </a>
      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-button linkedin">
        <FaLinkedin />
        <span className="tooltip">LinkedIn</span>
      </a>
      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-button instagram">
        <FaInstagram />
        <span className="tooltip">Instagram</span>
      </a>
    </div>
  );
};

export default FloatingSocialMenu;
