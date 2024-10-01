import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import './TrackFever.css';

function TrackFever() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [feverData, setFeverData] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    temperature: ''
  });

  const [chartData, setChartData] = useState([]);

  const fetchFeverData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/fetch_fevers/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFeverData(data);
        processChartData(data);
      } else {
        console.error('Failed to fetch fever data:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch fever data:', error);
    }
  };

  const processChartData = (data) => {
    setChartData(data.map(entry => ({
      date: entry.date,
      temperature: entry.temperature
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

    fetchFeverData();
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
      temperature: parseFloat(formData.temperature)
    };

    try {
      const response = await fetch('http://localhost:5000/record_fever', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchFeverData(); // Refresh data after successful submission
      } else {
        const errorResponse = await response.json();
        console.error('Failed to record fever:', errorResponse);
      }
    } catch (error) {
      console.error('Error recording fever:', error);
    }
  };

  return (
    <div>
      <DashNav />
      <div className="nav-bar">
        <h1 className="nav-title">Track Fever</h1>
        <FitNav id={userId} />
      </div>
      <div className="track-fever-container">
        <form onSubmit={handleSubmit} className="fever-form">
          <div className="form-row">
            <div className="form-group">
              <label>Date:</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Time:</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Temperature (°F):</label>
              <input type="number" name="temperature" value={formData.temperature} step="0.1" onChange={handleInputChange} required />
            </div>
          </div>
          <button type="submit" className="btn-submit">Submit</button>
        </form>

        <div className="charts-container">
          <div className="chart">
            <h2>Fever Records</h2>
            <Chart
              type="line"
              options={{
                chart: {
                  id: 'fever-chart',
                },
                xaxis: {
                  categories: chartData.map(entry => format(new Date(entry.date), 'dd/MM')),
                  title: {
                    text: 'Date',
                  },
                  labels: {
                    rotate: -45,
                  },
                },
                yaxis: {
                  title: {
                    text: 'Temperature (°F)',
                  },
                },
                title: {
                  text: 'Fever Records',
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
                  name: 'Temperature',
                  data: chartData.map(entry => entry.temperature),
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

export default TrackFever;
