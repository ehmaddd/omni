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
    id: userId,
    name: '',
    type: 'Birthday',
    date_time: '',
    recurrence: 'None',
    location: '',
    notes: '',
  });

  // State to track the filter selection
  const [filter, setFilter] = useState('this_week'); // Default filter is 'this_week'

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
      fetchEvents(filter);  // Fetch events based on the selected filter
    }
  }, [token, filter]);  // Re-fetch events whenever the filter changes

  const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;
  
    switch (filter) {
      case 'this_week':
        const startOfWeek = now.getDate() - now.getDay(); // Sunday
        startDate = new Date(now.setDate(startOfWeek));
        endDate = new Date(now.setDate(startOfWeek + 6)); // Saturday
        break;
  
      case 'next_week':
        const nextStartOfWeek = now.getDate() - now.getDay() + 7; // Next Sunday
        startDate = new Date(now.setDate(nextStartOfWeek));
        endDate = new Date(now.setDate(nextStartOfWeek + 6)); // Next Saturday
        break;
  
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 2);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // Last day of the month
        break;
  
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 2);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1); // Last day of the previous month
        break;
  
      case 'next_month':
        startDate = new Date(now.getFullYear(), now.getMonth() + 1, 2);
        endDate = new Date(now.getFullYear(), now.getMonth() + 2, 1); // Last day of next month
        break;
  
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 2);
        endDate = new Date(now.getFullYear(), 11, 32); // December 31
        break;
  
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        break;
    }
  
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const fetchEvents = async (filter) => {
    const { startDate, endDate } = getDateRange(filter);
    
    try {
        const response = await fetch(`http://localhost:5000/fetch_events/${userId}?start_date=${startDate}&end_date=${endDate}`, {
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
      const response = await fetch('http://localhost:5000/store_event', {
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
      fetchEvents(filter);  // Refresh events after submission
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Dropdown change handler
  const handleFilterChange = (e) => {
    setFilter(e.target.value);  // Update filter when user selects a new one
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
      <div className="filter-section">
        <label htmlFor="filter">Filter Events:</label>
        <select id="filter" value={filter} onChange={handleFilterChange}>
          <option value="this_week">This Week</option>
          <option value="next_week">Next Week</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="next_month">Next Month</option>
          <option value="this_year">This Year</option>
        </select>
      </div>
      <div className="event-form">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="event_name">Event Name</label>
            <input
              type="text"
              id="event_name"
              name="name"
              placeholder="Event Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="event_type">Event Type</label>
            <select
              id="event_type"
              name="type"
              value={formData.type}
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
              id="date_time"
              name="date_time"
              value={formData.date_time}
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
        <h2>Filtered Events</h2>
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id}>
              <h3>{event.name}</h3>
              <p>Type: {event.type}</p>
              <p>Date & Time: {event.datetime}</p>
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
