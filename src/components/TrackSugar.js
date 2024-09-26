import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav'; // Import FitNav
import Chart from 'react-apexcharts';
import { format } from 'date-fns';
import './TrackSugar.css'; // Add a CSS file for the TrackSugar styles

function TrackSugar() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [sugarData, setSugarData] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: 'Random',
    sugar_level: ''
  });

  const [chartData, setChartData] = useState({
    random: [],
    fasting: []
  });

  const fetchSugarData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/sugar_levels/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSugarData(data);
        processChartData(data);
      } else {
        console.error('Failed to fetch sugar data:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch sugar data:', error);
    }
  };

  const processChartData = (data) => {
    const randomLevels = data.filter(entry => entry.type === 'Random');
    const fastingLevels = data.filter(entry => entry.type === 'Fasting');

    setChartData({
      random: randomLevels.map(entry => ({ date: entry.date, level: entry.sugar_level })),
      fasting: fastingLevels.map(entry => ({ date: entry.date, level: entry.sugar_level }))
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

    fetchSugarData();
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
      type: formData.type,
      sugar_level: parseFloat(formData.sugar_level)
    };

    try {
      const response = await fetch('http://localhost:5000/record_sugar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchSugarData(); // Refresh data after successful submission
      } else {
        const errorResponse = await response.json();
        console.error('Failed to record sugar level:', errorResponse);
      }
    } catch (error) {
      console.error('Error recording sugar level:', error);
    }
  };

  return (
    <div>
      <DashNav />
        <div className="nav-bar">
          <h1 className="nav-title">Track Sugar Level</h1>
          <FitNav id={userId} />
        </div>
      <div className="track-sugar-container">
        <form onSubmit={handleSubmit} className="sugar-form">
          <div className="sugar-form-group">
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
          <div className="sugar-form-group">
            <label>Time:</label>
            <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
          </div>
          <div className="sugar-form-group">
            <label>Type:</label>
            <select name="type" value={formData.type} onChange={handleInputChange} required>
              <option value="Random">Random</option>
              <option value="Fasting">Fasting</option>
            </select>
          </div>
          <div className="sugar-form-group">
            <label>Sugar Level:</label>
            <input type="number" name="sugar_level" value={formData.sugar_level} step="0.1" onChange={handleInputChange} required />
          </div>
          <button type="submit" className="btn-submit">Submit</button>
        </form>

        <div className="sugar-charts-container">
          <h2>Random Sugar Levels</h2>
          <div className="sugar-chart">
            <Chart
              type="line"
              className="sugar-chart"
              options={{
                chart: {
                  id: 'random-sugar-chart',
                },
                xaxis: {
                  categories: chartData.random.map(entry => format(new Date(entry.date), 'dd/MM')),
                  title: {
                    text: 'Date',
                  },
                  labels: {
                    rotate: -45, // Rotate labels if needed
                  },
                },
                yaxis: {
                  title: {
                    text: 'Sugar Level',
                  },
                },
                title: {
                  text: 'Random Sugar Levels',
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
                  name: 'Sugar Level',
                  data: chartData.random.map(entry => entry.level),
                },
              ]}
              width="100%"
              height="400px"
            />
          </div>
          <h2>Fasting Sugar Levels</h2>
          <div className="sugar-chart">
            <Chart
              type="line"
              className="sugar-chart"
              options={{
                chart: {
                  id: 'fasting-sugar-chart',
                },
                xaxis: {
                  categories: chartData.fasting.map(entry => format(new Date(entry.date), 'dd/MM')),
                  title: {
                    text: 'Date',
                  },
                  labels: {
                    rotate: -45, // Rotate labels if needed
                  },
                },
                yaxis: {
                  title: {
                    text: 'Sugar Level',
                  },
                },
                title: {
                  text: 'Fasting Sugar Levels',
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
                  name: 'Sugar Level',
                  data: chartData.fasting.map(entry => entry.level),
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

export default TrackSugar;
