import React, { useState } from 'react';
import './MoodGrid.css';

const MoodGrid = ({ data }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const getDaysInMonth = (month) => new Date(year, month, 0).getDate();

  const getMoodColor = (meanValence, meanArousal) => {
    const moodScore = meanValence * meanArousal;

    if (moodScore <= 100 && moodScore > 80) return '#00e600'; // Very Positive
    if (moodScore <= 80 && moodScore > 60) return '#1aff1a'; // Positive
    if (moodScore <= 60 && moodScore > 40) return '#4dff4d'; // Slightly Positive
    if (moodScore <= 40 && moodScore > 20) return '#80ff80'; // Neutral Positive
    if (moodScore <= 20 && moodScore > 0) return '#b3ffb3'; // Slightly Neutral Positive
    if (moodScore === 0) return '#4d0000'; // Neutral
    if (moodScore < 0 && moodScore > -20) return '#ff8080'; // Slightly Negative
    if (moodScore <= -20 && moodScore > -40) return '#ff4d4d'; // Negative
    if (moodScore <= -40 && moodScore > -60) return '#ff1a1a'; // Strongly Negative
    if (moodScore <= -60 && moodScore > -80) return '#e60000'; // Very Negative
    if (moodScore <= -80 && moodScore > -100) return '#b30000'; // Extremely Negative

    return '#dadada';
  };

  const generateGrid = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months from 1 to 12
    return months.map(month => {
      const daysInMonth = getDaysInMonth(month);
      const monthData = data.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === year && logDate.getMonth() + 1 === month;
      });

      const days = Array.from({ length: daysInMonth }, (_, day) => {
        const dayData = monthData.filter(log => new Date(log.date).getDate() === day + 1);

        const totalValence = dayData.reduce((acc, log) => acc + log.valence, 0);
        const totalArousal = dayData.reduce((acc, log) => acc + log.arousal, 0);
        const meanValence = totalValence / dayData.length;
        const meanArousal = totalArousal / dayData.length;

        const moodColor = getMoodColor(meanValence, meanArousal);
        const date = new Date(year, month - 1, day + 1).toLocaleDateString();

        return (
          <div
            key={day}
            className="day"
            style={{ backgroundColor: moodColor }}
          >
            <div className="tooltip">{date}</div>
          </div>
        );
      });

      return (
        <div key={month} className="month">
          <h3>{new Date(year, month - 1).toLocaleString('default', { month: 'long' })}</h3>
          <div className="grid">
            {days}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="mood-grid">
      <div className="year-selector">
        <button onClick={() => setYear(year - 1)}>Previous Year</button>
        <span>{year}</span>
        <button onClick={() => setYear(year + 1)}>Next Year</button>
      </div>
      <div className="months-container">
        {generateGrid()}
      </div>
    </div>
  );
};

export default MoodGrid;
