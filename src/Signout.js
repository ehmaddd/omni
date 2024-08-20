import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Signout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the token from localStorage
    localStorage.removeItem('token');

    // Redirect to the login page
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      <h2>Signing you out...</h2>
    </div>
  );
}

export default Signout;
