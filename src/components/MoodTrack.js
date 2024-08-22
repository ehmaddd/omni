import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function MoodTrack() {
  const location = useLocation();
  const isChildRoute = location.pathname !== '/dashboard/:userId/mood_tracker';

  return (
    <div>
      {!isChildRoute && (
        <>
          <h1>Mood Tracker</h1>
          <nav>
            <ul>
              <li>
                <Link to="log">Log Mood</Link>
              </li>
              <li>
                <Link to="logs">View Logs</Link>
              </li>
              <li>
                <Link to="summary">View Summary</Link>
              </li>
            </ul>
          </nav>
        </>
      )}
      <Outlet /> {/* Renders nested route components like LogMood */}
    </div>
  );
}

export default MoodTrack;
