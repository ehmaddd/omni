import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from './DashNav';
import FitNav from './FitNav';

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
    eye_sight_left: '',
    eye_sight_right: '',
    disability: false,
    heart_problem: false,
    diabetes: false,
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
      <FitNav id={userId} isKidneyPatient={profile && profile.is_kidney_patient} currentPage={currentPage} />
      <h1>{currentPage}</h1>
      {profile ? (
        <div>
          <p>Age: {profile.age}</p>
          <p>Height: {profile.height}</p>
          <p>Weight: {profile.weight}</p>
          <p>Blood Group: {profile.blood_group}</p>
          <p>Eye Sight (Left): {profile.eye_sight_left}</p>
          <p>Eye Sight (Right): {profile.eye_sight_right}</p>
          <p>Disability: {profile.disability ? 'Yes' : 'No'}</p>
          <p>Heart Problem: {profile.heart_problem ? 'Yes' : 'No'}</p>
          <p>Diabetes: {profile.diabetes ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <button type="submit">Create Profile</button>
        </form>
      )}
    </div>
  );
}

export default FitnessTracker;
