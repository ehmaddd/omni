import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function FetchMoodColor({ propStartDate, propEndDate }) {
  const { userId } = useParams();
  const [moodColor, setMoodColor] = useState('#dadada');
  const [moodText, setMoodText] = useState('No mood');

  const startDate = propStartDate;
  const endDate = propEndDate;

  // Function to change the mood text based on the mood color
  const changeText = (color) => {
    switch (color) {
      case '#00e600':
        return 'Extremely Positive';
      case '#1aff1a':
        return 'Strongly Positive';
      case '#4dff4d':
        return 'Very Positive';
      case '#80ff80':
        return 'Positive';
      case '#b3ffb3':
        return 'Slightly Positive';
      case '#FFFF00':
        return 'Neutral';
      case '#ff8080':
        return 'Slightly Negative';
      case '#ff4d4d':
        return 'Negative';
      case '#ff1a1a':
        return 'Very Negative';
      case '#e60000':
        return 'Strongly Negative';
      case '#b30000':
        return 'Extremely Negative';
      default:
        return 'No mood';
    }
  };

  // Fetch mood logs when component mounts
  useEffect(() => {
    fetchMoodLogs();
  }, [userId, startDate, endDate]);

  // Update mood text whenever the mood color changes
  useEffect(() => {
    const newText = changeText(moodColor);
    setMoodText(newText);
  }, [moodColor]);

  const fetchMoodLogs = async () => {
    try {
      const url = `http://localhost:5000/mood-logs?userId=${userId}&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error fetching mood logs');
      }
      const data = await response.json();
      calculateMoodScore(data); // Calculate mood score from the logs
    } catch (error) {
      console.error('Error fetching mood logs:', error);
    }
  };

  const calculateMoodScore = (logs) => {
    let totalMoodScore = 0;
    const totalLogs = logs.length;

    logs.forEach((log) => {
      const moodScore = log.valence * log.arousal; // Multiplying valence and arousal for each log
      totalMoodScore += moodScore;
    });

    const averageMoodScore = totalLogs ? totalMoodScore / totalLogs : 0;
    const moodColor = getMoodColor(averageMoodScore);
    setMoodColor(moodColor); // Set the color based on mood score
  };

  const getMoodColor = (moodScore) => {
    if (moodScore <= 100 && moodScore > 80) return '#00e600'; // Extremely Positive
    if (moodScore <= 80 && moodScore > 60) return '#1aff1a'; // Strongly Positive
    if (moodScore <= 60 && moodScore > 40) return '#4dff4d'; // Very Positive
    if (moodScore <= 40 && moodScore > 20) return '#80ff80'; // Positive
    if (moodScore <= 20 && moodScore > 0) return '#b3ffb3'; // Slightly Positive
    if (moodScore === 0) return '#FFFF00'; // Neutral
    if (moodScore < 0 && moodScore > -20) return '#ff8080'; // Slightly Negative
    if (moodScore <= -20 && moodScore > -40) return '#ff4d4d'; // Negative
    if (moodScore <= -40 && moodScore > -60) return '#ff1a1a'; // Very Negative
    if (moodScore <= -60 && moodScore > -80) return '#e60000'; // Strongly Negative
    if (moodScore <= -80 && moodScore > -100) return '#b30000'; // Extremely Negative

    return '#dadada'; // Default color
  };

  return (
    <div
      className="mood-color-container"
      style={{ backgroundColor: moodColor, height: '2rem', width: '15rem', margin: 'auto', padding: '4px', borderRadius: '15px' }}
    >
      {moodText}
    </div>
  );
}

export default FetchMoodColor;
