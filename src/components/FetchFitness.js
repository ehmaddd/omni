import { useEffect, useState } from "react";
import underweightImg from '../images/underweight.png';
import normalweightImg from '../images/normalweight.png';
import overweightImg from '../images/overweight.png';
import obeseImg from '../images/obese.png';
import extremelyobeseImg from '../images/extremelyobese.png';

const FetchFitness = () => {
  const userId = localStorage.getItem('user');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [workoutWarning, setWorkoutWarning] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/fetch_specific_health/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          const realData = data.data[0];
          const heightInMeters = realData.height / 100;
          const calculatedBmi = realData.weight / (heightInMeters * heightInMeters);
          setBmi(calculatedBmi.toFixed(2));
          setBmiCategory(getBmiCategory(calculatedBmi));

          const response2 = await fetch(`http://localhost:5000/fetch_workout/${userId}`);
        
          if (response2.ok) {
            const data2 = await response2.json();
          
            // Get today's date and set up a set to track unique workout days
            const today = new Date();
            const uniqueDays = new Set();
          
            // Loop through the fetched workouts
            data2.forEach(workout => {
              const workoutDate = new Date(workout.date); // Convert to Date object
              // Check if the workout is within the last 7 days
              const diffInMs = today - workoutDate;
              const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
          
              if (diffInDays >= 0 && diffInDays < 7) {
                uniqueDays.add(workoutDate.toDateString()); // Add the date to the set
              }
            });
          
            // Check if there are at least 5 unique workout days
            if (uniqueDays.size >= 5) {
              setWorkoutWarning('Doing proper workout');
            } else {
              setWorkoutWarning('Not doing proper workout');
            }
          } else {
            console.error('Failed to fetch fitness data:', await response.text());
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchData();
  }, [userId]);

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi >= 18.5 && bmi < 24.9) return 'Normal weight';
    if (bmi >= 25 && bmi < 29.9) return 'Overweight';
    if (bmi >= 30 && bmi < 39.9) return 'Obese';
    return 'Extremely Obese';
  };

  // Map categories to images and background colors
  const categoryImages = {
    'Underweight': underweightImg,
    'Normal weight': normalweightImg,
    'Overweight': overweightImg,
    'Obese': obeseImg,
    'Extremely Obese': extremelyobeseImg,
  };

  const categoryColors = {
    'Underweight': '#ff1a1a', // Blue
    'Normal weight': '#4dff4d', //Green
    'Overweight': '#ffcc00', // Yellow
    'Obese': '#ff6600', // Orange
    'Extremely Obese': '#ff0000', // Dark red
  };

  const backgroundColor = categoryColors[bmiCategory] || 'transparent';

  return (
    <div style={{textAlign: 'left', width: '20rem', borderWidth: '1px' ,borderStyle: 'solid', borderColor: 'gainsboro', borderRadius: '16px', padding: '10px', marginLeft: '1rem', marginTop: '0.5rem'}}>
      <h3 style={{textAlign: 'center', backgroundColor: 'gainsboro'}}>Fitness Profile</h3>
      <div className="fitness-div" style={{width: '15rem', display: 'flex', flexDirection: 'column', margin: 'auto', textAlign: 'center'}}>
        <p><b>BMI: </b>{bmi !== null ? bmi : 'Loading...'}</p>
        {bmiCategory && (
          <img 
            src={categoryImages[bmiCategory]} 
            alt={bmiCategory} 
            style={{ width: '50px', height: 'auto', margin: 'auto' }} // Adjust size as needed
          />
        )}
        <p style={{ backgroundColor: backgroundColor, padding: '5px', borderRadius: '16px' }}>
          {bmiCategory !== '' ? bmiCategory : 'Loading...'}
        </p>
      </div>
      <p style={{marginTop: '-30px', marginBottom: '-10px', textAlign: 'center'}}>{workoutWarning}</p>
    </div>
  );
};

export default FetchFitness;
