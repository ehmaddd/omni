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
      } else {
        console.error('Failed to fetch profile:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data when component mounts
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile(); // Call the fetchProfile function to load the profile data
  }, [userId, token, navigate]);

  // Handle form data changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle slider changes
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Prepare request body with type conversions
    const requestBody = {
      user_id: userId,
      age: formData.age ? parseInt(formData.age, 10) : null,
      height: formData.height ? parseFloat(formData.height).toFixed(2) : null,
      weight: formData.weight ? parseFloat(formData.weight).toFixed(2) : null,
      blood_group: formData.blood_group,
      eye_sight_left: formData.eye_sight_left, // Keep as string
      eye_sight_right: formData.eye_sight_right, // Keep as string
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
        const createdProfile = await response.json();
        setProfile(createdProfile); // Update state with new profile data
  
        // Redirect to profile display or reset the form after successful submission
        fetchProfile(); // Refresh profile data to ensure UI updates
      } else {
        const errorResponse = await response.json();
        console.error('Failed to create or update profile:', errorResponse);
      }
    } catch (error) {
      console.error('Error creating or updating profile:', error);
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
        {profile && profile.data && (
          <FitNav id={userId} isKidneyPatient={profile.data[0].kidney_issue} />
        )}
      </div>
  
      <div className="fitness-tracker-container">
        {profile && profile.data && profile.data.length > 0 ? (
          <div className="profile-summary-container">
            <div className="profile-display">
              <h5>Summary</h5>
              <div className="profile-grid">
                <div><strong>Age:</strong> {profile.data[0].age} yrs</div>
                <div><strong>Height:</strong> {profile.data[0].height} cm</div>
                <div><strong>Weight:</strong> {profile.data[0].weight} kg</div>
                <div><strong>Blood Group:</strong> {profile.data[0].blood_group}</div>
                <div><strong>Eye Sight (Left):</strong> {profile.data[0].eye_sight_left}</div>
                <div><strong>Eye Sight (Right):</strong> {profile.data[0].eye_sight_right}</div>
                <div><strong>Disability:</strong> {profile.data[0].disability ? 'Yes' : 'No'}</div>
                <div><strong>Heart Problem:</strong> {profile.data[0].heart_problem ? 'Yes' : 'No'}</div>
                <div><strong>Diabetes:</strong> {profile.data[0].diabetes ? 'Yes' : 'No'}</div>
                <div><strong>Kidney Issue:</strong> {profile.data[0].kidney_issue ? 'Yes' : 'No'}</div>
              </div>
            </div>
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
                <input type="checkbox" name="kidney_issue" checked={formData.kidney_issue} onChange={handleInputChange} />
                <label>Kidney Issue</label>
              </div>
              <div className="checkbox-item">
                <input type="checkbox" name="disability" checked={formData.disability} onChange={handleInputChange} />
                <label>Disability</label>
              </div>
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
  
}

export default FitnessTracker;
