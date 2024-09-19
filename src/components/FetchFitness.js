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
        } else {
          console.error('Failed to fetch profile:', await response.text());
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
    </div>
  );
};

export default FetchFitness;
