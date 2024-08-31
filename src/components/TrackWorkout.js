import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';
import './TrackWorkout.css';

function TrackWorkout() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [workoutData, setWorkoutData] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '',
    activity: '',
    category: '', // Add category field
    cburned: ''
  });

  const fetchWorkoutData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/fetch_workout/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWorkoutData(data);
      } else {
        console.error('Failed to fetch workout data:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch workout data:', error);
    }
  };

  useEffect(() => {
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

    fetchWorkoutData();
  }, [token, navigate, userId, storedUserId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      user_id: userId,
      date: formData.date,
      time: formData.time,
      duration: formData.duration,
      activity: formData.activity,
      category: formData.category,   
      cburned: formData.cburned
    };

    try {
      const response = await fetch('http://localhost:5000/store_workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchWorkoutData();
      } else {
        const errorResponse = await response.json();
        console.error('Failed to record workout:', errorResponse);
      }
    } catch (error) {
      console.error('Error recording workout:', error);
    }
  };

  return (
    <>
      <DashNav />
      <div className="nav-bar">
        <h1 className="nav-title">Track Workout</h1>
        <FitNav id={userId} />
      </div>
      <div className="track-workout-container">
        <div className="track-bp-container">
          <form onSubmit={handleSubmit} className="workout-form">
          <div className="form-sub-group">
            <div className="form-group">
              <label>Activity:</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="">Select Category</option>
                <option value="Walking">Walking</option>
                <option value="Jogging">Jogging</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="Boating">Boating</option>
                <option value="Sports">Sports</option>
                <option value="Athletics">Athletics</option>
                <option value="Yoga">Yoga</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (mins):</label>
              <input type="number" name="duration" value={formData.duration} step="1" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Burned Calories:</label>
              <input type="number" name="cburned" value={formData.cburned} step="1" onChange={handleInputChange} required />
            </div>
          </div>
          <div className="form-sub-group">
      <div className="form-group">
        <label>Date:</label>
        <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Time:</label>
        <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
      </div>
    </div>
    <button type="submit" className="btn-submit">Submit</button>
  </form>
        </div>
      </div>
    </>
  );
}

export default TrackWorkout;
