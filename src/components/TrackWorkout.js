import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';
import Chart from 'react-apexcharts';
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
    category: '',
    cburned: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

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

  const checkDuplicate = () => {
    return workoutData.some(workout => 
      workout.date === formData.date && 
      workout.time === formData.time && 
      workout.activity === formData.activity
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form Data:', formData); // Debugging statement
  
    // Create the request body
    const requestBody = {
      user_id: userId,
      date: formData.date,
      time: formData.time,
      category: formData.category,
      duration: parseFloat(formData.duration),
      cburned: parseFloat(formData.cburned),
    };
  
    try {
      // Send the POST request
      const response = await fetch('http://localhost:5000/store_workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Correctly interpolate the token
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        // Fetch the updated workout data
        fetchWorkoutData();
      } else {
        const errorResponse = await response.json();
        console.error('Failed to record workout:', errorResponse);
      }
    } catch (error) {
      console.error('Error recording workout:', error);
    }
  };

  // Process data for charts
  const processChartData = () => {
    // Extract dates, durations, and calories burned
    const dates = workoutData.map(entry => new Date(entry.date).toLocaleDateString());
    const durations = workoutData.map(entry => entry.duration || 0);
    const caloriesBurned = workoutData.map(entry => entry.calories || 0);
  
    // Process categories
    const categoryCounts = workoutData.reduce((acc, entry) => {
      const category = entry.type ? entry.type : 'No Category';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  
    const categories = Object.keys(categoryCounts);
    const categoryFrequencies = Object.values(categoryCounts);
  
    return { dates, durations, caloriesBurned, categories, categoryFrequencies };
  };

  const chartData = processChartData();

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
            {errorMessage && <p className="error-message">{errorMessage}</p>}
              <div className="form-group">
                <label className="track-workout-label">Activity:</label>
                <select name="category" className="workout-category" value={formData.category} onChange={handleInputChange} required>
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
                <label className="track-workout-label">Duration (mins):</label>
                <input type="number" name="duration" className="duration-input" value={formData.duration} step="1" onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="track-workout-label">Burned Calories:</label>
                <input type="number" name="cburned" className="calories-input"  value={formData.cburned} step="1" onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="track-workout-label">Date:</label>
                <input type="date" className="workout-date-input " name="date" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label className="track-workout-label">Time:</label>
                <input type="time" className="workout-time-input" name="time" value={formData.time} onChange={handleInputChange} required />
              </div>
            <button type="submit" className="btn-submit">Submit</button>
          </form>
        </div>
        <div className="workout-charts-container">
          <h2>Workout Duration Over Time</h2>
          <div className="chart">
            <Chart
              type="line"
              className="workout-chart"
              options={{
                chart: {
                  id: 'duration-chart',
                },
                xaxis: {
                  categories: chartData.dates || [],
                  title: {
                    text: 'Date',
                  },
                },
                yaxis: {
                  title: {
                    text: 'Duration (mins)',
                  },
                },
                title: {
                  text: 'Workout Duration',
                  align: 'center',
                },
                stroke: {
                  curve: 'smooth',
                },
                markers: {
                  size: 4,
                },
              }}
              series={[
                {
                  name: 'Duration',
                  data: chartData.durations || [],
                },
              ]}
              width="100%"
              height="400px"
            />
          </div>
          <h2>Calories Burned Over Time</h2>
          <div className="chart">
            <Chart
              type="line"
              className="workout-chart"
              options={{
                chart: {
                  id: 'calories-chart',
                },
                xaxis: {
                  categories: chartData.dates || [],
                  title: {
                    text: 'Date',
                  },
                },
                yaxis: {
                  title: {
                    text: 'Calories Burned',
                  },
                },
                title: {
                  text: 'Calories Burned',
                  align: 'center',
                },
                stroke: {
                  curve: 'smooth',
                },
                markers: {
                  size: 4,
                },
              }}
              series={[
                {
                  name: 'Calories Burned',
                  data: chartData.caloriesBurned || [],
                },
              ]}
              width="100%"
              height="400px"
            />
          </div>
          <h2>Workout Categories</h2>
          <div className="chart">
            <Chart
              type="pie"
              className="workout-chart"
              options={{
                chart: {
                  id: 'category-chart',
                },
                labels: chartData.categories || [],
                title: {
                  text: 'Workout Categories',
                  align: 'center',
                },
                legend: {
                  position: 'bottom',
                },
              }}
              series={chartData.categoryFrequencies || []}
              width="100%"
              height="400px"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default TrackWorkout;
