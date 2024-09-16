import React, { useState } from 'react';
import './MoodGrid.css';

const MoodGrid = ({ data }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const getDaysInMonth = (month) => new Date(year, month, 0).getDate();

  const getMoodColor = (meanValence, meanArousal) => {
    // Calculate the mood score based on valence and arousal
    const moodScore = meanValence * meanArousal;

    if (moodScore <= 100 && moodScore >80) return '#00e600';
    else if (moodScore < 80 && moodScore > 60) return '#1aff1a';
    else if (moodScore < 60 && moodScore > 40) return '#4dff4d';
    else if (moodScore < 40 && moodScore > 20) return '#80ff80';
    else if (moodScore < 20 && moodScore > 0) return '#b3ffb3';
    else if (moodScore === 0) return '#4d0000';
    else if (moodScore > 0 && moodScore > -20) return '#ff8080';
    else if (moodScore > -20 && moodScore > -40) return '#ff4d4d';
    else if (moodScore > -40 && moodScore > -60) return '#ff1a1a';
    else if (moodScore > -60 && moodScore > -80) return '#e60000';
    else if (moodScore > -80 && moodScore > -100) return '#b30000';
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

        if (dayData.length === 0) {
          return (
            <div key={day} className="day" style={{ backgroundColor: '#ccc' }} />
          );
        }

        // Calculate the mean valence and arousal
        const totalValence = dayData.reduce((acc, log) => acc + log.valence, 0);
        const totalArousal = dayData.reduce((acc, log) => acc + log.arousal, 0);
        const meanValence = totalValence / dayData.length;
        const meanArousal = totalArousal / dayData.length;

        const moodColor = getMoodColor(meanValence, meanArousal);

        return (
          <div
            key={day}
            className="day"
            style={{ backgroundColor: moodColor }}
          />
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
