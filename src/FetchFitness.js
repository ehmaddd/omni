import { useEffect, useState } from "react";

const FetchFitness = () => {
  const userId = localStorage.getItem('user');
  const [fitnessData, setFitnessData] = useState({
    gender: '',
    height: 0.0,
    weight: 0.0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/health_profile/${userId}`);

        if (response.ok) {
          const data = await response.json();
          console.log(data);
        //   setFitnessData({
        //     gender: data.gender || '',
        //     height: data.height || 0.0,
        //     weight: data.weight || 0.0,
        //   });
        } else {
          console.error('Failed to fetch profile:', await response.text());
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchData();
  }, [userId]); // The dependency array ensures this effect runs when userId changes.

  return (
    <div>
      <h3>Fitness Profile</h3>
      <p>Gender: {fitnessData.gender}</p>
      <p>Height: {fitnessData.height} cm</p>
      <p>Weight: {fitnessData.weight} kg</p>
    </div>
  );
};

export default FetchFitness;
