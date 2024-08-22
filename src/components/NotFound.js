import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {

  return (
    <>
      <h1>404</h1>
      <Link to="/">HOME</Link>
    </>
  );
}

export default NotFound;