import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import FetchMoodColor from './components/FetchMoodColor';
import FetchFitness from './components/FetchFitness';
import FetchTodo from './components/FetchTodo';
import DashNav from './components/DashNav';
import './Dashboard.css';

function Dashboard() {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const storedUserId = localStorage.getItem('user');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];  // Get today's date in 'YYYY-MM-DD' format
  const fifteenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 14)).toISOString().split('T')[0];  // Get date 15 days ago

  const [moodDates, setMoodDates] = useState({
    propStartDate: fifteenDaysAgo,  // Default to 15 days ago
    propEndDate: today,  // Default to today
  });

  const handleStartDateChange = (e) => {
    setMoodDates(prevState => ({
      ...prevState,
      propStartDate: e.target.value
    }));
  };

  const handleEndDateChange = (e) => {
    setMoodDates(prevState => ({
      ...prevState,
      propEndDate: e.target.value
    }));
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
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
        } else {
          sessionStorage.setItem('userId', userId);
        }
      } catch (error) {
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate, userId, storedUserId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {token ? (
        <>
          <DashNav />
          <p>Your Dashboard User ID: {userId}</p>
          <div className="dashboard-container">
            <div className="dashboard-column">
              <div className="mood-div">
                <h3 className="mood-heading">Mood Reflection</h3>
                <form className="mood-form">
                  <div className="form-group">
                    <label className='mood-label'>From</label>
                    <input 
                      type="date" 
                      className='mood-start-date' 
                      value={moodDates.propStartDate}
                      onChange={handleStartDateChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label className='mood-label'>To</label>
                    <input 
                      type="date" 
                      className='mood-end-date' 
                      value={moodDates.propEndDate}
                      onChange={handleEndDateChange} 
                    />
                  </div>
                </form>
                <FetchMoodColor propStartDate={moodDates.propStartDate} propEndDate={moodDates.propEndDate} />
              </div>
              <div className="fitness-div">
                <FetchFitness />
              </div>
            </div>
            <div>
              <div className="todo-div">
                <FetchTodo />
              </div>
              <div className="budget-div">
                
              </div>
          </div>
            <div className="events-div">
              
            </div>
          </div>
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
}

export default Dashboard;
