import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const FetchEvents = () => {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  // Function to get the date range for the next week
  const getDateRangeForNextWeek = () => {
    const today = new Date();  // Start from today
    const startDate = new Date(today);
    
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 7);  // End 6 days from today
  
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const { startDate, endDate } = getDateRangeForNextWeek();
      
      try {
        const response = await fetch(`http://localhost:5000/fetch_events/${userId}?start_date=${startDate}&end_date=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        setError('Error fetching events.');
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [userId, token]);

  return (
    <div className="upcoming-events" style={{width: '20rem', marginLeft: '2rem'}}>
      <h3 style={{textAlign: 'center', marginTop: '0.5rem', marginBottom: '-20px', backgroundColor: 'gainsboro'}}>Upcoming Events</h3>
      {error && <p className="error">{error}</p>}
      <div className="event-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div className="event-card" key={event.id} style={{marginBottom: '-25px'}}>
              <h3 className="event-title">{event.name}</h3>
              <div className="event-details">
                <p style={{display: 'inline', marginBottom: '-20px', marginLeft: '-10px'}}><strong>Type:</strong> {event.type}</p><br></br>
                <p style={{display: 'inline', marginBottom: '-20px', marginLeft: '-10px'}}><strong>Date & Time:</strong> {new Date(event.datetime).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No upcoming events for the next week.</p>
        )}
      </div>
    </div>
  );
};

export default FetchEvents;
