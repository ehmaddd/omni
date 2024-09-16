import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import DashNav from '../components/DashNav';
import './Events.css';

const Events = () => {
    const { userId } = useParams();
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('user');
    const navigate = useNavigate();
    
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        event_name: '',
        event_type: 'Birthday',
        event_date_time: '',
        recurrence: 'None',
        location: '',
        notes: '',
    });

    useEffect(() => {
        // Redirect if no token is present
        if (!token) {
            console.log('No token found, redirecting to login');
            navigate('/login');
            return;
        }

        if (userId !== storedUserId) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/login');
            return;
        }

        // Optionally, verify token validity with your backend
        const verifyToken = async () => {
            try {
                const response = await fetch('http://localhost:5000/verify-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Token validation failed');
                }
                const result = await response.json();
                console.log('Token verification result:', result);
                if (!result.valid) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        verifyToken();
    }, [token, navigate, userId, storedUserId]);

    useEffect(() => {
        if (token) {
            fetchEvents();
        }
    }, [token]);

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            fetchEvents();
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    if (!token) {
        return <p>Loading...</p>;
    }

    return (
        <>
          <DashNav />
          <div className="nav-bar">
              <h1 className="nav-title">Events</h1>
          </div>
          <div className="event-form">
                <form onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="event_name">Event Name</label>
                      <input
                          type="text"
                          id="event_name"
                          name="event_name"
                          placeholder="Event Name"
                          value={formData.event_name}
                          onChange={handleChange}
                          required
                      />
                    </div>
                    <div>
                      <label htmlFor="event_type">Event Type</label>
                      <select
                          id="event_type"
                          name="event_type"
                          value={formData.event_type}
                          onChange={handleChange}
                      >
                          <option value="Birthday">Birthday</option>
                          <option value="Funeral">Funeral</option>
                          <option value="Anniversary">Anniversary</option>
                          <option value="Function">Function</option>
                          <option value="Marriage">Marriage</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="event_date_time">Event Date & Time</label>
                      <input
                          type="datetime-local"
                          id="event_date_time"
                          name="event_date_time"
                          value={formData.event_date_time}
                          onChange={handleChange}
                          required
                      />
                    </div>
                    <div>
                      <label htmlFor="recurrence">Recurrence</label>
                      <select
                          id="recurrence"
                          name="recurrence"
                          value={formData.recurrence}
                          onChange={handleChange}
                      >
                          <option value="None">None</option>
                          <option value="Daily">Daily</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="location">Location</label>
                      <input
                          type="text"
                          id="location"
                          name="location"
                          placeholder="Location"
                          value={formData.location}
                          onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="notes">Notes</label>
                      <textarea
                          id="notes"
                          name="notes"
                          placeholder="Notes"
                          value={formData.notes}
                          onChange={handleChange}
                      />
                    </div>
                    <button type="submit">Add Event</button>
                </form>
            </div>
          <div className="event-list">
            <h2>Upcoming Events</h2>
            {events.length > 0 ? (
              events.map(event => (
                <div key={event.event_id}>
                  <h3>{event.event_name}</h3>
                  <p>Type: {event.event_type}</p>
                  <p>Date & Time: {event.event_date_time}</p>
                  <p>Location: {event.location}</p>
                  <p>Notes: {event.notes}</p>
                </div>
              ))
            ) : (
              <p>No events to display.</p>
            )}
          </div>
          <Outlet />
        </>
    );
};

export default Events;
