import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav'; // Import FitNav
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import './TrackWeight.css'; // Add a CSS file for the TrackWeight styles

function TrackWeight() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [weightData, setWeightData] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    weight: ''
  });

  const [chartData, setChartData] = useState([]);

  const fetchWeightData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/weight/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWeightData(data);
        processChartData(data);
      } else {
        console.error('Failed to fetch weight data:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch weight data:', error);
    }
  };

  const processChartData = (data) => {
    setChartData(data.map(entry => ({
      date: entry.date,
      weight: entry.weight
    })));
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

    fetchWeightData();
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
      weight: parseFloat(formData.weight)
    };

    try {
      const response = await fetch('http://localhost:5000/record_weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchWeightData(); // Refresh data after successful submission
      } else {
        const errorResponse = await response.json();
        console.error('Failed to record weight:', errorResponse);
      }
    } catch (error) {
      console.error('Error recording weight:', error);
    }
  };

  return (
    <div>
      <DashNav />
      <div className="nav-bar">
        <h1 className="nav-title">Track Weight</h1>
        <FitNav id={userId} />
      </div>
      <div className="track-weight-container">
        <form onSubmit={handleSubmit} className="weight-form">
          <div className="weight-form-elements">
            <div className="weight-form-group">
              <label>Date:</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="weight-form-group">
              <label>Time:</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
            </div>
            <div className="weight-form-group">
              <label>Weight:</label>
              <input type="number" name="weight" value={formData.weight} step="0.1" onChange={handleInputChange} required />
            </div>
          </div>
          <button type="submit" className="weight-btn-submit">Submit</button>
        </form>

        <div className="charts-container">
          <div className="chart">
            <h2>Weight Records</h2>
            <Chart
              type="line"
              options={{
                chart: {
                  id: 'weight-chart',
                },
                xaxis: {
                  categories: chartData.map(entry => format(new Date(entry.date), 'dd/MM')),
                  title: {
                    text: 'Date',
                  },
                  labels: {
                    rotate: -45, // Rotate labels if needed
                  },
                },
                yaxis: {
                  title: {
                    text: 'Weight',
                  },
                },
                title: {
                  text: 'Weight Records',
                  align: 'center',
                },
                stroke: {
                  curve: 'smooth',
                  width: 2,
                },
                markers: {
                  size: 4,
                },
              }}
              series={[
                {
                  name: 'Weight',
                  data: chartData.map(entry => entry.weight),
                },
              ]}
              width="100%"
              height="400px"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackWeight;
