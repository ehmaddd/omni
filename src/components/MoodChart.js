// src/pages/MoodSummaryPage.js
import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const MoodSummaryPage = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No data available</p>;
  }

  // Aggregate trigger impact counts
  const impactCounts = data.reduce((acc, log) => {
    const triggers = typeof log.triggers === 'string' ? log.triggers.split(', ') : [];
    const impactColor = log.valence > 0 ? '#4caf50' : log.valence < 0 ? '#f44336' : '#ffeb3b'; // Neutral color for valence = 0
    triggers.forEach(trigger => {
      const key = `${trigger}_${impactColor}`;
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {});

  // Prepare data for the bar chart
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

  // Prepare data for the pie chart
  const moodDistributionData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      label: 'Mood Distribution',
      data: [
        data.filter(log => log.valence > 0).length,
        data.filter(log => log.valence === 0).length,
        data.filter(log => log.valence < 0).length
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
              x: { beginAtZero: true, title: { display: true, text: 'Triggers' } },
              y: { title: { display: true, text: 'Count' } }
            },
            plugins: {
              legend: { display: false }
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
