import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import './TrackBp.css'; // Add a CSS file for the TrackBp styles

function TrackBp() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [bpData, setBpData] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    systolic: '',
    diastolic: ''
  });

  const [chartData, setChartData] = useState({
    systolic: [],
    diastolic: []
  });

  const fetchBpData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/bp_levels/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBpData(data);
        processChartData(data);
      } else {
        console.error('Failed to fetch blood pressure data:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch blood pressure data:', error);
    }
  };

  const processChartData = (data) => {
    setChartData({
      systolic: data.map(entry => ({ date: entry.date, level: entry.systolic })),
      diastolic: data.map(entry => ({ date: entry.date, level: entry.diastolic }))
    });
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

    fetchBpData();
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
      systolic: parseFloat(formData.systolic),
      diastolic: parseFloat(formData.diastolic)
    };

    try {
      const response = await fetch('http://localhost:5000/record_bp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchBpData(); // Refresh data after successful submission
      } else {
        const errorResponse = await response.json();
        console.error('Failed to record blood pressure:', errorResponse);
      }
    } catch (error) {
      console.error('Error recording blood pressure:', error);
    }
  };

  return (
    <div>
      <DashNav />
      <div className="nav-bar">
            <h1 className="nav-title">Track Blood Pressure</h1>
            <FitNav id={userId} />
          </div>
      <div className="track-bp-container">

      <form onSubmit={handleSubmit} className="bp-form">
        <div className="form-group">
          <label>Date:</label>
          <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Time:</label>
          <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Systolic:</label>
          <input type="number" name="systolic" value={formData.systolic} step="0.1" onChange={handleInputChange} required />
        </div>
        <div className="form-group">
          <label>Diastolic:</label>
          <input type="number" name="diastolic" value={formData.diastolic} step="0.1" onChange={handleInputChange} required />
        </div>
        <button type="submit" className="btn-submit">Submit</button>
      </form>

        <div className="charts-container">
          <div className="chart">
            <h2>Systolic Blood Pressure</h2>
            <Chart
              type="line"
              options={{
                chart: {
                  id: 'systolic-bp-chart',
                },
                xaxis: {
                  categories: chartData.systolic.map(entry => format(new Date(entry.date), 'dd/MM')),
                  title: {
                    text: 'Date',
                  },
                  labels: {
                    rotate: -45, // Rotate labels if needed
                  },
                },
                yaxis: {
                  title: {
                    text: 'Systolic Level',
                  },
                },
                title: {
                  text: 'Systolic Blood Pressure',
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
                  name: 'Systolic Level',
                  data: chartData.systolic.map(entry => entry.level),
                },
              ]}
              width="100%"
              height="400px"
            />
          </div>

          <div className="chart">
            <h2>Diastolic Blood Pressure</h2>
            <Chart
              type="line"
              options={{
                chart: {
                  id: 'diastolic-bp-chart',
                },
                xaxis: {
                  categories: chartData.diastolic.map(entry => format(new Date(entry.date), 'dd/MM')),
                  title: {
                    text: 'Date',
                  },
                  labels: {
                    rotate: -45, // Rotate labels if needed
                  },
                },
                yaxis: {
                  title: {
                    text: 'Diastolic Level',
                  },
                },
                title: {
                  text: 'Diastolic Blood Pressure',
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
                  name: 'Diastolic Level',
                  data: chartData.diastolic.map(entry => entry.level),
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

export default TrackBp;
