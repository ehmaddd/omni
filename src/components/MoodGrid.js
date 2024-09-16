import React, { useState } from 'react';
import './MoodGrid.css';

const MoodGrid = ({ data }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const getDaysInMonth = (month) => new Date(year, month, 0).getDate();

  const getMoodColor = (dayData) => {
    if (!data) {
      return []; // or handle the case as needed
    }
    const positiveCount = dayData.filter(log => log.valence > 0).length;
    const negativeCount = dayData.filter(log => log.valence < 0).length;
    const totalCount = positiveCount + negativeCount;

    if (totalCount === 0) return '#ccc'; // Neutral gray if no data

    const positivityRatio = positiveCount / totalCount;

    if (positivityRatio > 0.7) return '#4caf50'; // Green for high positivity
    if (positivityRatio < 0.3) return '#f44336'; // Red for high negativity
    return '#ffeb3b'; // Yellow for neutral
  };

  const generateGrid = () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1); // Months from 1 to 12
    return months.map(month => {
      const daysInMonth = getDaysInMonth(month);
      const monthData = data.filter(log => {
        const logDate = new Date(log.date);
        return logDate.getFullYear() === year && logDate.getMonth() + 1 === month;
      });

      return (
        <div key={month} className="month">
          <h3>{new Date(year, month - 1).toLocaleString('default', { month: 'long' })}</h3>
          <div className="grid">
            {Array.from({ length: daysInMonth }, (_, day) => {
              const dayData = monthData.filter(log => new Date(log.date).getDate() === day + 1);
              return (
                <div
                  key={day}
                  className="day"
                  style={{ backgroundColor: getMoodColor(dayData) }}
                />
              );
            })}
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
