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
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    dob: '',
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

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'; // Return 'N/A' if dob is not provided
  
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // Adjust age if the birthday has not occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };

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
          dob: data.data[0].dob || '',
          gender: data.data[0].gender || '',
          height: data.data[0].height || '',
          weight: data.data[0].weight || '',
          blood_group: data.data[0].blood_group || '',
          eye_sight_left: data.data[0].eye_sight_left || '',
          eye_sight_right: data.data[0].eye_sight_right || '',
          disability: data.data[0].disability || false,
          heart_problem: data.data[0].heart_problem || false,
          diabetes: data.data[0].diabetes || false,
          kidney_issue: data.data[0].kidney_issue || false,
        });

        localStorage.setItem('isKidneyPatient', data.data[0].kidney_issue);
        localStorage.setItem('isHeartPatient', data.data[0].heart_problem);
        localStorage.setItem('isDiabetesPatient', data.data[0].diabetes);

      } else {
        console.error('Failed to fetch profile:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeightData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/weight/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWeight(data[data.length-1].weight);
      } else {
        console.error('Failed to fetch weight data:', await response.text());
      }
    } catch (error) {
      console.error('Failed to fetch weight data:', error);
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
          await fetchWeightData();
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
      dob: formData.dob,
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
          <div className="profile-table">
            <div className="profile-row">
              <div className="profile-cell"><strong>Age:</strong> {calculateAge(formData.dob)}</div>
              <div className="profile-cell"><strong>Gender:</strong> {formData.gender}</div>
            </div>
            <div className="profile-row">
              <div className="profile-cell"><strong>Height:</strong> {formData.height}</div>
              <div className="profile-cell"><strong>Weight:</strong> {weight}</div>
            </div>
            <div className="profile-row">
              <div className="profile-cell"><strong>Blood Group:</strong> {formData.blood_group}</div>
              <div className="profile-cell"><strong>Eye Sight:</strong> {formData.eye_sight_left}(L) - {formData.eye_sight_right}(R)</div>
            </div>
            <div className="profile-row">
              <div className="profile-cell"><strong>Physical Disability:</strong> {formData.disability ? 'Yes' : 'No'}</div>
              <div className="profile-cell"><strong>Diabetes:</strong> {formData.diabetes ? 'Yes' : 'No'}</div>
            </div>
            <div className="profile-row">
              <div className="profile-cell"><strong>Heart Problem:</strong> {formData.heart_problem ? 'Yes' : 'No'}</div>
              <div className="profile-cell"><strong>Kidney Problem:</strong> {formData.kidney_issue ? 'Yes' : 'No'}</div>
            </div>
          </div>
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
              <label>Dob:</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
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
              <select name="blood_group" className="bloodgroup-dd" value={formData.blood_group} onChange={handleInputChange} required>
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
