import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav'; // Import FitNav
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import './TrackCreatinine.css'; // Ensure you have corresponding CSS for styles

function TrackCreatinine() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [creatinineData, setCreatinineData] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    creatinine_level: ''
  });

  const [chartData, setChartData] = useState([]);

  const fetchCreatinineData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/fetch_creatinine/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCreatinineData(data);
        processChartData(data);
      } else {
        console.error('Failed to fetch creatinine data:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch creatinine data:', error);
    }
  };

  const processChartData = (data) => {
    setChartData(data.map(entry => ({
      date: entry.date,
      creatinine_level: entry.creatinine_level
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

    fetchCreatinineData();
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
      creatinine_level: parseFloat(formData.creatinine_level)
    };

    try {
      const response = await fetch('http://localhost:5000/record_creatinine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchCreatinineData(); // Refresh data after successful submission
      } else {
        const errorResponse = await response.json();
        console.error('Failed to record creatinine level:', errorResponse);
      }
    } catch (error) {
      console.error('Error recording creatinine level:', error);
    }
  };

  return (
    <div>
      <DashNav />
      <div className="nav-bar">
        <h1 className="nav-title">Track Creatinine Level</h1>
        <FitNav id={userId} />
      </div>
      <div className="track-creatinine-container">
        <form onSubmit={handleSubmit} className="creatinine-form">
          <div className="form-group">
            <label htmlFor="date">Date:</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="time">Time:</label>
            <input type="time" id="time" name="time" value={formData.time} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="creatinine_level">Creatinine Level:</label>
            <input type="number" id="creatinine_level" name="creatinine_level" value={formData.creatinine_level} step="0.01" onChange={handleInputChange} required />
          </div>
          <button type="submit" className="btn-submit">Submit</button>
        </form>

        <div className="charts-container">
          <div className="chart">
            <Chart
              type="line"
              options={{
                chart: {
                  id: 'creatinine-chart',
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
                    text: 'Creatinine Level',
                  },
                },
                title: {
                  text: 'Creatinine Levels',
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
                  name: 'Creatinine Level',
                  data: chartData.map(entry => entry.creatinine_level),
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

export default TrackCreatinine;
