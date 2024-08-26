import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';
import './FitnessTracker.css'; // Add a CSS file for the fitness tracker styles

function FitnessTracker() {
  const { userId } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    blood_group: '',
    eye_sight_left: 0,
    eye_sight_right: 0,
    disability: false,
    heart_problem: false,
    diabetes: false,
    kidney_issue: false, // Add this line
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/health_profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setProfile(data);
            setFormData({
              ...data,
              eye_sight_left: parseInt(data.eye_sight_left, 10),
              eye_sight_right: parseInt(data.eye_sight_right, 10),
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/health_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, ...formData }),
      });
      if (response.ok) {
        const createdProfile = await response.json();
        setProfile(createdProfile);
      } else {
        console.error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const currentPage = profile ? 'Your Profile' : 'Create Your Profile';

  return (
    <div>
      <DashNav />
      <div className="nav-bar">
        <h1 className="nav-title">{currentPage}</h1>
        <FitNav id={userId} />
      </div>

      <div className="fitness-tracker-container">
        {profile ? (
          <div className="profile-display">
            <p><strong>Age:</strong> {profile.age}</p>
            <p><strong>Height:</strong> {profile.height} cm</p>
            <p><strong>Weight:</strong> {profile.weight} kg</p>
            <p><strong>Blood Group:</strong> {profile.blood_group}</p>
            <p><strong>Eye Sight (Left):</strong> {profile.eye_sight_left}</p>
            <p><strong>Eye Sight (Right):</strong> {profile.eye_sight_right}</p>
            <p><strong>Disability:</strong> {profile.disability ? 'Yes' : 'No'}</p>
            <p><strong>Heart Problem:</strong> {profile.heart_problem ? 'Yes' : 'No'}</p>
            <p><strong>Diabetes:</strong> {profile.diabetes ? 'Yes' : 'No'}</p>
            <p><strong>Kidney Issue:</strong> {profile.kidney_issue ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fitness-form">
            <div className="form-group">
              <label>Age:</label>
              <input type="number" name="age" value={formData.age} min="15" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Height (cm):</label>
              <input type="number" name="height" value={formData.height} min="140" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Weight (kg):</label>
              <input type="number" name="weight" value={formData.weight} min="40" onChange={handleInputChange} required />
            </div>
            <div className="form-group full-width">
              <label>Blood Group:</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleInputChange} required>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Eye Sight (Left):</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  name="eye_sight_left" 
                  min="0" 
                  max="20" 
                  step="0.1" 
                  value={formData.eye_sight_left} 
                  onChange={handleSliderChange} 
                  className="slider"
                />
                <span className="slider-value">{formData.eye_sight_left}</span>
              </div>
            </div>
            <div className="form-group">
              <label>Eye Sight (Right):</label>
              <div className="slider-container">
                <input 
                  type="range" 
                  name="eye_sight_right" 
                  min="0" 
                  max="20" 
                  step="0.1" 
                  value={formData.eye_sight_right} 
                  onChange={handleSliderChange} 
                  className="slider"
                />
                <span className="slider-value">{formData.eye_sight_right}</span>
              </div>
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input type="checkbox" name="heart_problem" checked={formData.heart_problem} onChange={handleInputChange} />
                  <label>Heart Problem</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" name="diabetes" checked={formData.diabetes} onChange={handleInputChange} />
                  <label>Diabetes</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" name="disability" checked={formData.disability} onChange={handleInputChange} />
                  <label>Physical Disability</label>
                </div>
                <div className="checkbox-item">
                  <input type="checkbox" name="kidney_issue" checked={formData.kidney_issue} onChange={handleInputChange} />
                  <label>Kidney Issue</label>
                </div>
              </div>
            </div>
            <button type="submit" className="submit-btn">Create Profile</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default FitnessTracker;
