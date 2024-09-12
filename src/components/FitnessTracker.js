import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';
import './FitnessTracker.css'; // Add a CSS file for the fitness tracker styles

function FitnessTracker() {
  const { userId } = useParams();
  const storedUserId = localStorage.getItem('user');
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
  
        // Store `isKidneyPatient` in local storage
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

  useEffect(() => {
    // Redirect if no token is present
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    // Check if the userId matches the storedUserId
    if (userId !== storedUserId) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      navigate('/login');
      return;
    }

    // Optionally, verify token validity with your backend
    const verifyToken = async () => {
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
        console.log('Token verification result:', result);
        if (!result.valid) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          // Fetch profile data if token is valid
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
          <FitNav id={userId} />
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
              <label>Gender:</label>
              <div>
                <input type="radio" id="male" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleInputChange} required />
                <label htmlFor="male">Male</label>
              </div>
              <div>
                <input type="radio" id="female" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleInputChange} required />
                <label htmlFor="female">Female</label>
              </div>
            </div>
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
              <input type="range" name="eye_sight_left" value={formData.eye_sight_left} min="-4" max="4" step="0.25" onChange={handleSliderChange} required />
              <span>{formData.eye_sight_left}</span>
            </div>
            <div className="form-group">
              <label>Eye Sight (Right):</label>
              <input type="range" name="eye_sight_right" value={formData.eye_sight_right} min="-4" max="4" step="0.25" onChange={handleSliderChange} required />
              <span>{formData.eye_sight_right}</span>
            </div>
            <div className="form-group">
              <label>Disability:</label>
              <input type="checkbox" name="disability" checked={formData.disability} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Heart Problem:</label>
              <input type="checkbox" name="heart_problem" checked={formData.heart_problem} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Diabetes:</label>
              <input type="checkbox" name="diabetes" checked={formData.diabetes} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Kidney Issue:</label>
              <input type="checkbox" name="kidney_issue" checked={formData.kidney_issue} onChange={handleInputChange} />
            </div>
            <button type="submit" className="btn-submit">Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default FitnessTracker;
