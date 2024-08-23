// src/pages/MoodSummaryPage.js
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const MoodSummaryPage = () => {
  // Mock data for demonstration
  const mockData = [
    { triggers: ['Work', 'Stress'], valence: -1 },
    { triggers: ['Exercise'], valence: 1 },
    { triggers: ['Sleep', 'Food'], valence: 1 },
    { triggers: [], valence: -1 },
    { triggers: ['Work'], valence: -2 },
  ];

  // Aggregate trigger impact counts
  const impactCounts = mockData.reduce((acc, log) => {
    const impactColor = log.valence > 0 ? '#4caf50' : '#f44336';
    const triggers = Array.isArray(log.triggers) ? log.triggers : [];
    triggers.forEach(trigger => {
      const key = `${trigger}_${impactColor}`;
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {});

  const labels = Object.keys(impactCounts).map(key => key.split('_')[0]);
  const dataCounts = Object.keys(impactCounts).map(key => impactCounts[key]);
  const backgroundColors = Object.keys(impactCounts).map(key => key.split('_')[1]);

  const barChartData = {
    labels: labels.length > 0 ? labels : ['No Data'],
    datasets: [{
      label: 'Trigger Impact Count',
      data: dataCounts.length > 0 ? dataCounts : [0],
      backgroundColor: backgroundColors.length > 0 ? backgroundColors : ['#ccc']
    }]
  };

  const moodDistributionData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      label: 'Mood Distribution',
      data: [
        mockData.filter(log => log.valence > 0).length,
        mockData.filter(log => log.valence === 0).length,
        mockData.filter(log => log.valence < 0).length
      ],
      backgroundColor: ['#4caf50', '#ffeb3b', '#f44336']
    }]
  };

  return (
    <div className="chart-container">
      <div className="chart">
        <h2>Trigger Impact on Mood</h2>
        <Bar
          data={barChartData}
          options={{
            indexAxis: 'x',
            scales: {
              x: { beginAtZero: true }
            }
          }}
        />
      </div>
      <div className="chart">
        <h2>Mood Distribution</h2>
        <Pie data={moodDistributionData} />
      </div>
    </div>
  );
};

export default MoodSummaryPage;
