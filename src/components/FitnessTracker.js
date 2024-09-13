import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';
import './FitnessTracker.css';

function FitnessTracker() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    blood_group: '',
    eye_sight_left: 0,
    eye_sight_right: 0,
    disability: false,
    heart_problem: false,
    diabetes: false,
    kidney_issue: false,
  });

  // Function to fetch profile data
  const fetchProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/health_profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          age: data.age || '',
          gender: data.gender || '',
          height: data.height || '',
          weight: data.weight || '',
          blood_group: data.blood_group || '',
          eye_sight_left: data.eye_sight_left || '',
          eye_sight_right: data.eye_sight_right || '',
          disability: data.disability || false,
          heart_problem: data.heart_problem || false,
          diabetes: data.diabetes || false,
          kidney_issue: data.kidney_issue || false,
        });

        localStorage.setItem('isKidneyPatient', data.data[0].kidney_issue);
      } else {
        console.error('Failed to fetch profile:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Token and profile verification
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

    const verifyToken = async () => {
      try {
        const response = await fetch('http://localhost:5000/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Token validation failed');

        const result = await response.json();
        if (!result.valid) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          fetchProfile();
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    verifyToken();
  }, [token, navigate, userId, storedUserId]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = {
      user_id: userId,
      gender: formData.gender,
      age: formData.age ? parseInt(formData.age, 10) : null,
      height: formData.height ? parseFloat(formData.height).toFixed(2) : null,
      weight: formData.weight ? parseFloat(formData.weight).toFixed(2) : null,
      blood_group: formData.blood_group,
      eye_sight_left: formData.eye_sight_left,
      eye_sight_right: formData.eye_sight_right,
      disability: formData.disability,
      heart_problem: formData.heart_problem,
      diabetes: formData.diabetes,
      kidney_issue: formData.kidney_issue,
    };

    try {
      const response = await fetch('http://localhost:5000/create_profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        fetchProfile(); // Refresh profile data
      } else {
        console.error('Failed to create or update profile:', await response.json());
      }
    } catch (error) {
      console.error('Error creating or updating profile:', error);
    }
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <DashNav />
      <div className="nav-bar">
        <h1 className="nav-title">{profile ? 'Your Profile' : 'Create Your Profile'}</h1>
        {profile && profile.data && <FitNav id={userId} />}
      </div>

      <div className="fitness-tracker-container">
        {profile && profile.data && profile.data.length > 0 ? (
          <div className="profile-summary-container">
            <h5>Summary</h5>
            {/* <div className="profile-grid">
              {Object.keys(profile.data[0]).map((key, idx) => (
                <div key={idx}>
                  <strong>{key.replace('_', ' ')}:</strong> {profile.data[0][key].toString()}
                </div>
              ))}
            </div> */}
            <table 
  border="1" 
  cellPadding="10" 
  cellSpacing="0" 
  style={{ borderCollapse: 'collapse', width: '100%' }}
>
  <tr>
    <td><strong>Age:</strong> {profile.data[0].age}</td>
    <td><strong>Gender:</strong> {profile.data[0].gender}</td>
  </tr>
  <tr>
    <td><strong>Height:</strong> {profile.data[0].height}</td>
    <td><strong>Weight:</strong> {profile.data[0].weight}</td>
  </tr>
  <tr>
    <td><strong>Blood Group:</strong> {profile.data[0].blood_group}</td>
    <td><strong>Eye Sight (L):</strong> {profile.data[0].eye_sight_left}</td>
  </tr>
  <tr>
    <td><strong>Eye Sight (R):</strong> {profile.data[0].eye_sight_right}</td>
    <td><strong>Physical Disability:</strong> {profile.data[0].disability ? 'Yes' : 'N/A'}</td>
  </tr>
  <tr>
    <td><strong>Heart Problem:</strong> {profile.data[0].heart_problem ? 'Yes' : 'N/A'}</td>
    <td><strong>Diabetes:</strong> {profile.data[0].diabetes ? 'Yes' : 'N/A'}</td>
  </tr>
  <tr>
    <td><strong>Kidney Issue:</strong> {profile.data[0].kidney_issue ? 'Yes' : 'N/A'}</td>
    <td></td>
  </tr>
</table>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="fitness-form">
            <div className="profile-form-group">
              <label>Gender:</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleInputChange}
                  /> 
                  Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleInputChange}
                  /> 
                  Female
                </label>
              </div>
            </div>

            <div className="profile-form-group">
              <label>Age:</label>
              <input type="number" name="age" value={formData.age} min="15" onChange={handleInputChange} required />
            </div>
            <div className="profile-form-group">
              <label>Height (cm):</label>
              <input type="number" name="height" value={formData.height} min="140" onChange={handleInputChange} required />
            </div>
            <div className="profile-form-group">
              <label>Weight (kg):</label>
              <input type="number" name="weight" value={formData.weight} min="40" onChange={handleInputChange} required />
            </div>

            <div className="profile-form-group full-width">
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

            <div className="profile-form-group">
              <label>Eye Sight (Left):</label>
              <div className="slider-group">
                <span className="eye-sight-value">{(formData.eye_sight_left ?? 0).toString()}</span>
                <input
                  type="range"
                  name="eye_sight_left"
                  min="-4"
                  max="4"
                  step="0.25"
                  value={formData.eye_sight_left ?? 0}
                  onChange={handleSliderChange}
                  className="slider"
                />
              </div>
            </div>
            <div className="profile-form-group">
              <label>Eye Sight (Right):</label>
              <div className="slider-group">
                <span className="eye-sight-value">{(formData.eye_sight_right ?? 0).toString()}</span>
                <input
                  type="range"
                  name="eye_sight_right"
                  min="-4"
                  max="4"
                  step="0.25"
                  value={formData.eye_sight_right ?? 0}
                  onChange={handleSliderChange}
                  className="slider"
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label>Health Issues:</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="disability"
                    checked={formData.disability}
                    onChange={handleInputChange}
                  /> 
                  Physical Disability
                </label>
            
                <label>
                  <input
                    type="checkbox"
                    name="heart_problem"
                    checked={formData.heart_problem}
                    onChange={handleInputChange}
                  /> 
                  Heart Problem
                </label>
            
                <label>
                  <input
                    type="checkbox"
                    name="diabetes"
                    checked={formData.diabetes}
                    onChange={handleInputChange}
                  /> 
                  Diabetes
                </label>
            
                <label>
                  <input
                    type="checkbox"
                    name="kidney_issue"
                    checked={formData.kidney_issue}
                    onChange={handleInputChange}
                  /> 
                  Kidney Issue
                </label>
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
